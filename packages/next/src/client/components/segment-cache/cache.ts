import type {
  TreePrefetch,
  RootTreePrefetch,
  SegmentPrefetch,
} from '../../../server/app-render/collect-segment-data'
import type { LoadingModuleData } from '../../../shared/lib/app-router-context.shared-runtime'
import {
  NEXT_ROUTER_PREFETCH_HEADER,
  NEXT_ROUTER_SEGMENT_PREFETCH_HEADER,
  NEXT_URL,
  RSC_CONTENT_TYPE_HEADER,
  RSC_HEADER,
} from '../app-router-headers'
import {
  createFetch,
  createFromNextReadableStream,
  createUnclosingPrefetchStream,
  urlToUrlWithoutFlightMarker,
  type RequestHeaders,
} from '../router-reducer/fetch-server-response'
import {
  trackPrefetchRequestBandwidth,
  pingPrefetchTask,
  type PrefetchTask,
  spawnPrefetchSubtask,
} from './scheduler'
import { getAppBuildId } from '../../app-build-id'
import { createHrefFromUrl } from '../router-reducer/create-href-from-url'
import type {
  NormalizedHref,
  NormalizedNextUrl,
  RouteCacheKey,
} from './cache-key'
import { createTupleMap, type TupleMap, type Prefix } from './tuple-map'

// A note on async/await when working in the prefetch cache:
//
// Most async operations in the prefetch cache should *not* use async/await,
// Instead, spawn a subtask that writes the results to a cache entry, and attach
// a "ping" listener to notify the prefetch queue to try again.
//
// The reason is we need to be able to access the segment cache and traverse its
// data structures synchronously. For example, if there's a synchronous update
// we can take an immediate snapshot of the cache to produce something we can
// render. Limiting the use of async/await also makes it easier to avoid race
// conditions, which is especially important because is cache is mutable.
//
// Another reason is that while we're performing async work, it's possible for
// existing entries to become stale, or for Link prefetches to be removed from
// the queue. For optimal scheduling, we need to be able to "cancel" subtasks
// that are no longer needed. So, when a segment is received from the server, we
// restart from the root of the tree that's being prefetched, to confirm all the
// parent segments are still cached. If the segment is no longer reachable from
// the root, then it's effectively canceled. This is similar to the design of
// Rust Futures, or React Suspense.

type RouteCacheEntryShared = {
  staleAt: number
  // This is false only if we're certain the route cannot be intercepted. It's
  // true in all other cases, including on initialization when we haven't yet
  // received a response from the server.
  couldBeIntercepted: boolean
}

export const enum EntryStatus {
  Pending,
  Rejected,
  Fulfilled,
}

type PendingRouteCacheEntry = RouteCacheEntryShared & {
  status: EntryStatus.Pending
  blockedTasks: Set<PrefetchTask> | null
  canonicalUrl: null
  tree: null
  head: null
}

type RejectedRouteCacheEntry = RouteCacheEntryShared & {
  status: EntryStatus.Rejected
  blockedTasks: Set<PrefetchTask> | null
  canonicalUrl: null
  tree: null
  head: null
}

export type FulfilledRouteCacheEntry = RouteCacheEntryShared & {
  status: EntryStatus.Fulfilled
  blockedTasks: null
  canonicalUrl: string
  tree: TreePrefetch
  head: React.ReactNode | null
}

export type RouteCacheEntry =
  | PendingRouteCacheEntry
  | FulfilledRouteCacheEntry
  | RejectedRouteCacheEntry

type SegmentCacheEntryShared = {
  staleAt: number
}

type PendingSegmentCacheEntry = SegmentCacheEntryShared & {
  status: EntryStatus.Pending
  rsc: null
  loading: null
  promise: null | PromiseWithResolvers<FulfilledSegmentCacheEntry | null>
}

type RejectedSegmentCacheEntry = SegmentCacheEntryShared & {
  status: EntryStatus.Rejected
  rsc: null
  loading: null
  promise: null
}

type FulfilledSegmentCacheEntry = SegmentCacheEntryShared & {
  status: EntryStatus.Fulfilled
  rsc: React.ReactNode | null
  loading: LoadingModuleData | Promise<LoadingModuleData>
  promise: null
}

export type SegmentCacheEntry =
  | PendingSegmentCacheEntry
  | RejectedSegmentCacheEntry
  | FulfilledSegmentCacheEntry

// Route cache entries vary on multiple keys: the href and the Next-Url. Each of
// these parts needs to be included in the internal cache key. Rather than
// concatenate the keys into a single key, we use a multi-level map, where the
// first level is keyed by href, the second level is keyed by Next-Url, and so
// on (if were to add more levels).
type RouteCacheKeypath = [NormalizedHref, NormalizedNextUrl]
const routeCacheMap: TupleMap<RouteCacheKeypath, RouteCacheEntry> =
  createTupleMap()

// TODO: We may eventually store segment entries in a tuple map, too, to
// account for search params.
const segmentCache = new Map<string, SegmentCacheEntry>()

export function readExactRouteCacheEntry(
  now: number,
  href: NormalizedHref,
  nextUrl: NormalizedNextUrl | null
): RouteCacheEntry | null {
  const keypath: Prefix<RouteCacheKeypath> =
    nextUrl === null ? [href] : [href, nextUrl]
  const existingEntry = routeCacheMap.get(keypath)
  if (existingEntry !== null) {
    // Check if the entry is stale
    if (existingEntry.staleAt > now) {
      // Reuse the existing entry.
      return existingEntry
    } else {
      // Evict the stale entry from the cache.
      routeCacheMap.delete(keypath)
    }
  }
  return null
}

export function readRouteCacheEntry(
  now: number,
  key: RouteCacheKey
): RouteCacheEntry | null {
  // First check if there's a non-intercepted entry. Most routes cannot be
  // intercepted, so this is the common case.
  const nonInterceptedEntry = readExactRouteCacheEntry(now, key.href, null)
  if (nonInterceptedEntry !== null && !nonInterceptedEntry.couldBeIntercepted) {
    // Found a match, and the route cannot be intercepted. We can reuse it.
    return nonInterceptedEntry
  }
  // There was no match. Check again but include the Next-Url this time.
  return readExactRouteCacheEntry(now, key.href, key.nextUrl)
}

export function readSegmentCacheEntry(
  now: number,
  path: string
): SegmentCacheEntry | null {
  const existingEntry = segmentCache.get(path)
  if (existingEntry !== undefined) {
    // Check if the entry is stale
    if (existingEntry.staleAt > now) {
      // Reuse the existing entry.
      return existingEntry
    } else {
      // Evict the stale entry from the cache.
      evictSegmentEntryFromCache(existingEntry, path)
    }
  }
  return null
}

export function waitForSegmentCacheEntry(
  pendingEntry: PendingSegmentCacheEntry
): Promise<FulfilledSegmentCacheEntry | null> {
  // Because the entry is pending, there's already a in-progress request.
  // Attach a promise to the entry that will resolve when the server responds.
  let promiseWithResolvers = pendingEntry.promise
  if (promiseWithResolvers === null) {
    promiseWithResolvers = pendingEntry.promise =
      createPromiseWithResolvers<FulfilledSegmentCacheEntry | null>()
  } else {
    // There's already a promise we can use
  }
  return promiseWithResolvers.promise
}

/**
 * Reads the route cache for a matching entry *and* spawns a request if there's
 * no match. Because this may issue a network request, it should only be called
 * from within the context of a prefetch task.
 */
export function requestRouteCacheEntryFromCache(
  now: number,
  task: PrefetchTask
): RouteCacheEntry {
  const key = task.key
  // First check if there's a non-intercepted entry. Most routes cannot be
  // intercepted, so this is the common case.
  const nonInterceptedEntry = readExactRouteCacheEntry(now, key.href, null)
  if (nonInterceptedEntry !== null && !nonInterceptedEntry.couldBeIntercepted) {
    // Found a match, and the route cannot be intercepted. We can reuse it.
    return nonInterceptedEntry
  }
  // There was no match. Check again but include the Next-Url this time.
  const exactEntry = readExactRouteCacheEntry(now, key.href, key.nextUrl)
  if (exactEntry !== null) {
    return exactEntry
  }
  // Create a pending entry and spawn a request for its data.
  const pendingEntry: PendingRouteCacheEntry = {
    canonicalUrl: null,
    status: EntryStatus.Pending,
    blockedTasks: null,
    tree: null,
    head: null,
    // If the request takes longer than a minute, a subsequent request should
    // retry instead of waiting for this one.
    //
    // When the response is received, this value will be replaced by a new value
    // based on the stale time sent from the server.
    staleAt: now + 60 * 1000,
    // This is initialized to true because we don't know yet whether the route
    // could be intercepted. It's only set to false once we receive a response
    // from the server.
    couldBeIntercepted: true,
  }
  spawnPrefetchSubtask(fetchRouteOnCacheMiss(pendingEntry, task))
  const keypath: Prefix<RouteCacheKeypath> =
    key.nextUrl === null ? [key.href] : [key.href, key.nextUrl]
  routeCacheMap.set(keypath, pendingEntry)
  return pendingEntry
}

/**
 * Reads the route cache for a matching entry *and* spawns a request if there's
 * no match. Because this may issue a network request, it should only be called
 * from within the context of a prefetch task.
 */
export function requestSegmentEntryFromCache(
  now: number,
  task: PrefetchTask,
  route: FulfilledRouteCacheEntry,
  path: string,
  accessToken: string
): SegmentCacheEntry {
  const existingEntry = readSegmentCacheEntry(now, path)
  if (existingEntry !== null) {
    return existingEntry
  }
  // Create a pending entry and spawn a request for its data.
  const pendingEntry: PendingSegmentCacheEntry = {
    status: EntryStatus.Pending,
    rsc: null,
    loading: null,
    staleAt: route.staleAt,
    promise: null,
  }
  spawnPrefetchSubtask(
    fetchSegmentEntryOnCacheMiss(
      route,
      pendingEntry,
      task.key,
      path,
      accessToken
    )
  )
  segmentCache.set(path, pendingEntry)
  return pendingEntry
}

function evictSegmentEntryFromCache(
  entry: SegmentCacheEntry,
  key: string
): void {
  segmentCache.delete(key)
  if (entry.status === EntryStatus.Pending && entry.promise !== null) {
    // There were listeners for this entry. Resolve them with `null` to indicate
    // that the prefetch failed. It's up to the listener to decide how to handle
    // this case.
    // NOTE: We don't currently propagate the reason the prefetch was canceled
    // but we could by accepting a `reason` argument.
    entry.promise.resolve(null)
    entry.promise = null
  }
}

function fulfillRouteCacheEntry(
  entry: PendingRouteCacheEntry,
  tree: TreePrefetch,
  head: React.ReactNode,
  staleAt: number,
  couldBeIntercepted: boolean,
  canonicalUrl: string
): FulfilledRouteCacheEntry {
  const fulfilledEntry: FulfilledRouteCacheEntry = entry as any
  fulfilledEntry.status = EntryStatus.Fulfilled
  fulfilledEntry.tree = tree
  fulfilledEntry.head = head
  fulfilledEntry.staleAt = staleAt
  fulfilledEntry.couldBeIntercepted = couldBeIntercepted
  fulfilledEntry.canonicalUrl = canonicalUrl
  const blockedTasks = entry.blockedTasks
  if (blockedTasks !== null) {
    for (const task of blockedTasks) {
      pingPrefetchTask(task)
    }
    fulfilledEntry.blockedTasks = null
  }
  return fulfilledEntry
}

function fulfillSegmentCacheEntry(
  segmentCacheEntry: PendingSegmentCacheEntry,
  rsc: React.ReactNode,
  loading: LoadingModuleData | Promise<LoadingModuleData>,
  staleAt: number
) {
  const fulfilledEntry: FulfilledSegmentCacheEntry = segmentCacheEntry as any
  fulfilledEntry.status = EntryStatus.Fulfilled
  fulfilledEntry.rsc = rsc
  fulfilledEntry.loading = loading
  fulfilledEntry.staleAt = staleAt
  // Resolve any listeners that were waiting for this data.
  if (segmentCacheEntry.promise !== null) {
    segmentCacheEntry.promise.resolve(fulfilledEntry)
    // Free the promise for garbage collection.
    fulfilledEntry.promise = null
  }
}

function rejectRouteCacheEntry(
  entry: PendingRouteCacheEntry,
  staleAt: number
): void {
  const rejectedEntry: RejectedRouteCacheEntry = entry as any
  rejectedEntry.status = EntryStatus.Rejected
  rejectedEntry.staleAt = staleAt
  const blockedTasks = entry.blockedTasks
  if (blockedTasks !== null) {
    for (const task of blockedTasks) {
      pingPrefetchTask(task)
    }
    rejectedEntry.blockedTasks = null
  }
}

function rejectSegmentCacheEntry(
  entry: PendingSegmentCacheEntry,
  staleAt: number
): void {
  const rejectedEntry: RejectedSegmentCacheEntry = entry as any
  rejectedEntry.status = EntryStatus.Rejected
  rejectedEntry.staleAt = staleAt
  if (entry.promise !== null) {
    // NOTE: We don't currently propagate the reason the prefetch was canceled
    // but we could by accepting a `reason` argument.
    entry.promise.resolve(null)
    entry.promise = null
  }
}

async function fetchRouteOnCacheMiss(
  entry: PendingRouteCacheEntry,
  task: PrefetchTask
): Promise<void> {
  // This function is allowed to use async/await because it contains the actual
  // fetch that gets issued on a cache miss. Notice though that it does not
  // return anything; it writes the result to the cache entry directly, then
  // pings the scheduler to unblock the corresponding prefetch task.
  const key = task.key
  const href = key.href
  const nextUrl = key.nextUrl
  try {
    const response = await fetchSegmentPrefetchResponse(href, '/_tree', nextUrl)
    if (!response || !response.ok || !response.body) {
      // Received an unexpected response.
      rejectRouteCacheEntry(entry, Date.now() + 10 * 1000)
      return
    }
    const serverData: RootTreePrefetch = await (createFromNextReadableStream(
      response.body
    ) as Promise<RootTreePrefetch>)
    if (serverData.buildId !== getAppBuildId()) {
      // The server build does not match the client. Treat as a 404. During
      // an actual navigation, the router will trigger an MPA navigation.
      // TODO: Consider moving the build ID to a response header so we can check
      // it before decoding the response, and so there's one way of checking
      // across all response types.
      rejectRouteCacheEntry(entry, Date.now() + 10 * 1000)
      return
    }

    // This is a bit convoluted but it's taken from router-reducer and
    // fetch-server-response
    const canonicalUrl = response.redirected
      ? createHrefFromUrl(urlToUrlWithoutFlightMarker(response.url))
      : href

    // Check whether the response varies based on the Next-Url header.
    const varyHeader = response.headers.get('vary')
    const couldBeIntercepted =
      varyHeader !== null && varyHeader.includes(NEXT_URL)

    fulfillRouteCacheEntry(
      entry,
      serverData.tree,
      serverData.head,
      Date.now() + serverData.staleTime,
      couldBeIntercepted,
      canonicalUrl
    )

    if (!couldBeIntercepted && nextUrl !== null) {
      // This route will never be intercepted. So we can use this entry for all
      // requests to this route, regardless of the Next-Url header. This works
      // because when reading the cache we always check for a valid
      // non-intercepted entry first.
      //
      // Re-key the entry. Since we're in an async task, we must first confirm
      // that the entry hasn't been concurrently modified by a different task.
      const currentKeypath: Prefix<RouteCacheKeypath> = [href, nextUrl]
      const expectedEntry = routeCacheMap.get(currentKeypath)
      if (expectedEntry === entry) {
        routeCacheMap.delete(currentKeypath)
        const newKeypath: Prefix<RouteCacheKeypath> = [href]
        routeCacheMap.set(newKeypath, entry)
      } else {
        // Something else modified this entry already. Since the re-keying is
        // just a performance optimization, we can safely skip it.
      }
    }
  } catch (error) {
    // Either the connection itself failed, or something bad happened while
    // decoding the response.
    rejectRouteCacheEntry(entry, Date.now() + 10 * 1000)
  }
}

async function fetchSegmentEntryOnCacheMiss(
  route: FulfilledRouteCacheEntry,
  segmentCacheEntry: PendingSegmentCacheEntry,
  routeKey: RouteCacheKey,
  segmentPath: string,
  accessToken: string | null
): Promise<void> {
  // This function is allowed to use async/await because it contains the actual
  // fetch that gets issued on a cache miss. Notice though that it does not
  // return anything; it writes the result to the cache entry directly.
  //
  // Segment fetches are non-blocking so we don't need to ping the scheduler
  // on completion.
  const href = routeKey.href
  try {
    const response = await fetchSegmentPrefetchResponse(
      href,
      accessToken === '' ? segmentPath : `${segmentPath}.${accessToken}`,
      routeKey.nextUrl
    )
    if (!response || !response.ok || !response.body) {
      // Server responded with an error. We should still cache the response, but
      // we can try again after 10 seconds.
      rejectSegmentCacheEntry(segmentCacheEntry, Date.now() + 10 * 1000)
      return
    }
    // Wrap the original stream in a new stream that never closes. That way the
    // Flight client doesn't error if there's a hanging promise. See comment in
    // createUnclosingPrefetchStream for more details.
    const prefetchStream = createUnclosingPrefetchStream(response.body)
    const serverData = await (createFromNextReadableStream(
      prefetchStream
    ) as Promise<SegmentPrefetch>)
    if (serverData.buildId !== getAppBuildId()) {
      // The server build does not match the client. Treat as a 404. During
      // an actual navigation, the router will trigger an MPA navigation.
      // TODO: Consider moving the build ID to a response header so we can check
      // it before decoding the response, and so there's one way of checking
      // across all response types.
      rejectSegmentCacheEntry(segmentCacheEntry, Date.now() + 10 * 1000)
      return
    }
    fulfillSegmentCacheEntry(
      segmentCacheEntry,
      serverData.rsc,
      serverData.loading,
      // TODO: The server does not currently provide per-segment stale time.
      // So we use the stale time of the route.
      route.staleAt
    )
  } catch (error) {
    // Either the connection itself failed, or something bad happened while
    // decoding the response.
    rejectSegmentCacheEntry(segmentCacheEntry, Date.now() + 10 * 1000)
  }
}

async function fetchSegmentPrefetchResponse(
  href: NormalizedHref,
  segmentPath: string,
  nextUrl: NormalizedNextUrl | null
): Promise<Response | null> {
  const headers: RequestHeaders = {
    [RSC_HEADER]: '1',
    [NEXT_ROUTER_PREFETCH_HEADER]: '1',
    [NEXT_ROUTER_SEGMENT_PREFETCH_HEADER]: segmentPath,
  }
  if (nextUrl !== null) {
    headers[NEXT_URL] = nextUrl
  }
  const fetchPriority = 'low'
  const responsePromise = createFetch(new URL(href), headers, fetchPriority)
  trackPrefetchRequestBandwidth(responsePromise)
  const response = await responsePromise
  const contentType = response.headers.get('content-type')
  const isFlightResponse =
    contentType && contentType.startsWith(RSC_CONTENT_TYPE_HEADER)
  if (!response.ok || !isFlightResponse) {
    return null
  }
  return response
}

function createPromiseWithResolvers<T>(): PromiseWithResolvers<T> {
  // Shim of Stage 4 Promise.withResolvers proposal
  let resolve: (value: T | PromiseLike<T>) => void
  let reject: (reason: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { resolve: resolve!, reject: reject!, promise }
}
