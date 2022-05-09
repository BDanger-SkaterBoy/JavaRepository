import type ws from 'ws'
import type { webpack5 as webpack } from 'next/dist/compiled/webpack/webpack'
import type { NextConfigComplete } from '../config-shared'
import { EventEmitter } from 'events'
import { findPageFile } from '../lib/find-page-file'
import { getPageRuntime, runDependingOnPageType } from '../../build/entries'
import { join, posix } from 'path'
import { normalizePathSep } from '../../shared/lib/page-path/normalize-path-sep'
import { normalizePagePath } from '../../shared/lib/page-path/normalize-page-path'
import { ensureLeadingSlash } from '../../shared/lib/page-path/ensure-leading-slash'
import { removePagePathTail } from '../../shared/lib/page-path/remove-page-path-tail'
import { pageNotFoundError } from '../require'
import { reportTrigger } from '../../build/output'
import getRouteFromEntrypoint from '../get-route-from-entrypoint'

export const ADDED = Symbol('added')
export const BUILDING = Symbol('building')
export const BUILT = Symbol('built')

export const entries: {
  /**
   * The key composed of the compiler name and the page. For example:
   * `edge-server/about`
   */
  [page: string]: {
    /**
     * The absolute page to the page file. For example:
     * `/Users/Rick/project/pages/about/index.js`
     */
    absolutePagePath: string
    /**
     * Path to the page file relative to the dist folder with no extension.
     * For example: `pages/about/index`
     */
    bundlePath: string
    /**
     * Tells if a page is scheduled to be disposed.
     */
    dispose?: boolean
    /**
     * Timestamp with the last time the page was active.
     */
    lastActiveTime?: number
    /**
     * Page build status.
     */
    status?: typeof ADDED | typeof BUILDING | typeof BUILT
  }
} = {}

export function onDemandEntryHandler({
  maxInactiveAge,
  multiCompiler,
  nextConfig,
  pagesBufferLength,
  pagesDir,
  viewsDir,
  watcher,
}: {
  maxInactiveAge: number
  multiCompiler: webpack.MultiCompiler
  nextConfig: NextConfigComplete
  pagesBufferLength: number
  pagesDir: string
  viewsDir?: string
  watcher: any
}) {
  const invalidator = new Invalidator(watcher)
  const doneCallbacks: EventEmitter | null = new EventEmitter()
  const lastClientAccessPages = ['']

  for (const compiler of multiCompiler.compilers) {
    compiler.hooks.make.tap(
      'NextJsOnDemandEntries',
      (_compilation: webpack.Compilation) => {
        invalidator.startBuilding()
      }
    )
  }

  function getPagePathsFromEntrypoints(
    type: 'client' | 'server' | 'edge-server',
    entrypoints: Map<string, { name?: string }>,
    root?: boolean
  ) {
    const pagePaths: string[] = []
    for (const entrypoint of entrypoints.values()) {
      const page = getRouteFromEntrypoint(entrypoint.name!, root)
      if (page) {
        pagePaths.push(`${type}${page}`)
      } else if (root && entrypoint.name === 'root') {
        pagePaths.push(`${type}/${entrypoint.name}`)
      }
    }

    return pagePaths
  }

  multiCompiler.hooks.done.tap('NextJsOnDemandEntries', (multiStats) => {
    if (invalidator.rebuildAgain) {
      return invalidator.doneBuilding()
    }
    const [clientStats, serverStats, edgeServerStats] = multiStats.stats
    const root = !!viewsDir
    const pagePaths = [
      ...getPagePathsFromEntrypoints(
        'client',
        clientStats.compilation.entrypoints,
        root
      ),
      ...getPagePathsFromEntrypoints(
        'server',
        serverStats.compilation.entrypoints,
        root
      ),
      ...(edgeServerStats
        ? getPagePathsFromEntrypoints(
            'edge-server',
            edgeServerStats.compilation.entrypoints,
            root
          )
        : []),
    ]

    for (const page of pagePaths) {
      const entry = entries[page]
      if (!entry) {
        continue
      }

      if (entry.status !== BUILDING) {
        continue
      }

      entry.status = BUILT
      doneCallbacks!.emit(page)
    }

    invalidator.doneBuilding()
  })

  const pingIntervalTime = Math.max(1000, Math.min(5000, maxInactiveAge))

  setInterval(function () {
    disposeInactiveEntries(lastClientAccessPages, maxInactiveAge)
  }, pingIntervalTime + 1000).unref()

  function handlePing(pg: string) {
    const page = normalizePathSep(pg)
    const pageKey = `client${page}`
    const entryInfo = entries[pageKey]

    // If there's no entry, it may have been invalidated and needs to be re-built.
    if (!entryInfo) {
      // if (page !== lastEntry) client pings, but there's no entry for page
      return { invalid: true }
    }

    // 404 is an on demand entry but when a new page is added we have to refresh the page
    const toSend = page === '/_error' ? { invalid: true } : { success: true }

    // We don't need to maintain active state of anything other than BUILT entries
    if (entryInfo.status !== BUILT) return

    // If there's an entryInfo
    if (!lastClientAccessPages.includes(pageKey)) {
      lastClientAccessPages.unshift(pageKey)

      // Maintain the buffer max length
      if (lastClientAccessPages.length > pagesBufferLength) {
        lastClientAccessPages.pop()
      }
    }
    entryInfo.lastActiveTime = Date.now()
    entryInfo.dispose = false
    return toSend
  }

  return {
    async ensurePage(page: string, clientOnly: boolean) {
      const pagePathData = await findPagePathData(
        pagesDir,
        page,
        nextConfig.pageExtensions,
        viewsDir
      )

      let entryAdded = false

      const addPageEntry = (type: 'client' | 'server' | 'edge-server') => {
        return new Promise<void>((resolve, reject) => {
          const pageKey = `${type}${pagePathData.page}`
          if (entries[pageKey]) {
            entries[pageKey].dispose = false
            entries[pageKey].lastActiveTime = Date.now()
            if (entries[pageKey].status === BUILT) {
              resolve()
              return
            }
          } else {
            entryAdded = true
            entries[pageKey] = {
              absolutePagePath: pagePathData.absolutePagePath,
              bundlePath: pagePathData.bundlePath,
              dispose: false,
              lastActiveTime: Date.now(),
              status: ADDED,
            }
          }

          doneCallbacks!.once(pageKey, (err: Error) => {
            if (err) return reject(err)
            resolve()
          })
        })
      }

      const promises = runDependingOnPageType({
        page: pagePathData.page,
        pageRuntime: await getPageRuntime(
          pagePathData.absolutePagePath,
          nextConfig
        ),
        onClient: () => addPageEntry('client'),
        onServer: () => addPageEntry('server'),
        onEdgeServer: () => addPageEntry('edge-server'),
      })

      if (entryAdded) {
        reportTrigger(
          !clientOnly && promises.length > 1
            ? `${pagePathData.page} (client and server)`
            : pagePathData.page
        )
        invalidator.invalidate()
      }

      return Promise.all(promises)
    },

    onHMR(client: ws) {
      client.addEventListener('message', ({ data }) => {
        try {
          const parsedData = JSON.parse(
            typeof data !== 'string' ? data.toString() : data
          )

          if (parsedData.event === 'ping') {
            const result = handlePing(parsedData.page)
            client.send(
              JSON.stringify({
                ...result,
                event: 'pong',
              })
            )
          }
        } catch (_) {}
      })
    },
  }
}

function disposeInactiveEntries(
  lastClientAccessPages: string[],
  maxInactiveAge: number
) {
  Object.keys(entries).forEach((page) => {
    const { lastActiveTime, status, dispose } = entries[page]

    // Skip pages already scheduled for disposing
    if (dispose) return

    // This means this entry is currently building or just added
    // We don't need to dispose those entries.
    if (status !== BUILT) return

    // We should not build the last accessed page even we didn't get any pings
    // Sometimes, it's possible our XHR ping to wait before completing other requests.
    // In that case, we should not dispose the current viewing page
    if (lastClientAccessPages.includes(page)) return

    if (lastActiveTime && Date.now() - lastActiveTime > maxInactiveAge) {
      entries[page].dispose = true
    }
  })
}

// Make sure only one invalidation happens at a time
// Otherwise, webpack hash gets changed and it'll force the client to reload.
class Invalidator {
  private watcher: any
  private building: boolean
  public rebuildAgain: boolean

  constructor(watcher: any) {
    this.watcher = watcher
    // contains an array of types of compilers currently building
    this.building = false
    this.rebuildAgain = false
  }

  invalidate() {
    // If there's a current build is processing, we won't abort it by invalidating.
    // (If aborted, it'll cause a client side hard reload)
    // But let it to invalidate just after the completion.
    // So, it can re-build the queued pages at once.
    if (this.building) {
      this.rebuildAgain = true
      return
    }

    this.building = true
    this.watcher.invalidate()
  }

  startBuilding() {
    this.building = true
  }

  doneBuilding() {
    this.building = false

    if (this.rebuildAgain) {
      this.rebuildAgain = false
      this.invalidate()
    }
  }
}

/**
 * Attempts to find a page file path from the given pages absolute directory,
 * a page and allowed extensions. If the page can't be found it will throw an
 * error. It defaults the `/_error` page to Next.js internal error page.
 *
 * @param pagesDir Absolute path to the pages folder with trailing `/pages`.
 * @param normalizedPagePath The page normalized (it will be denormalized).
 * @param pageExtensions Array of page extensions.
 */
async function findPagePathData(
  pagesDir: string,
  page: string,
  extensions: string[],
  viewsDir?: string
) {
  const normalizedPagePath = tryToNormalizePagePath(page)
  let pagePath: string | null = null
  let isView = false

  // check viewsDir first
  if (viewsDir) {
    pagePath = await findPageFile(viewsDir, normalizedPagePath, extensions)

    if (pagePath) {
      isView = true
    }
  }

  if (!pagePath) {
    pagePath = await findPageFile(pagesDir, normalizedPagePath, extensions)
  }

  if (pagePath !== null) {
    const pageUrl = ensureLeadingSlash(
      removePagePathTail(normalizePathSep(pagePath), extensions, !isView)
    )
    const bundleFile = normalizePagePath(pageUrl)
    const bundlePath = posix.join(isView ? 'views' : 'pages', bundleFile)
    const absolutePagePath = join(isView ? viewsDir! : pagesDir, pagePath)

    return {
      absolutePagePath,
      bundlePath,
      page: posix.normalize(pageUrl),
    }
  }

  if (page === '/_error') {
    return {
      absolutePagePath: require.resolve('next/dist/pages/_error'),
      bundlePath: page,
      page: normalizePathSep(page),
    }
  } else {
    throw pageNotFoundError(normalizedPagePath)
  }
}

function tryToNormalizePagePath(page: string) {
  try {
    return normalizePagePath(page)
  } catch (err) {
    console.error(err)
    throw pageNotFoundError(page)
  }
}
