import { UNDERSCORE_NOT_FOUND_ROUTE } from '../../api/constants'
import type { Segment as FlightRouterStateSegment } from './types'

// TypeScript trick to simulate opaque types, like in Flow.
type Opaque<K, T> = T & { __brand: K }

export type EncodedSegment = Opaque<'EncodedSegment', string>

export function encodeSegment(
  segment: FlightRouterStateSegment
): EncodedSegment {
  if (typeof segment === 'string') {
    const safeName =
      segment === UNDERSCORE_NOT_FOUND_ROUTE
        ? // TODO: FlightRouterState encodes Not Found routes as "/_not-found".
          // But params typically don't include the leading slash. We should use
          // a different encoding to avoid this special case.
          '_not-found'
        : encodeToFilesystemAndURLSafeString(segment)
    // Since this is not a dynamic segment, it's fully encoded. It does not
    // need to be "hydrated" with a param value.
    return safeName as EncodedSegment
  }
  const name = segment[0]
  const paramValue = segment[1]
  const paramType = segment[2]
  const safeName = encodeToFilesystemAndURLSafeString(name)
  const safeValue = encodeToFilesystemAndURLSafeString(paramValue)

  const encodedName = '$' + paramType + '$' + safeName + '$' + safeValue
  return encodedName as EncodedSegment
}

export function encodeSlot(parallelRouteKey: string, segment: EncodedSegment) {
  // Omit the parallel route key for children, since this is the most
  // common case. Saves some bytes.
  return parallelRouteKey === 'children'
    ? segment
    : `@${parallelRouteKey}/${segment}`
}

// Define a regex pattern to match the most common characters found in a route
// param. It excludes anything that might not be cross-platform filesystem
// compatible, like |. It does not need to be precise because the fallback is to
// just base64url-encode the whole parameter, which is fine; we just don't do it
// by default for compactness, and for easier debugging.
const simpleParamValueRegex = /^[a-zA-Z0-9\-_@]+$/

function encodeToFilesystemAndURLSafeString(value: string) {
  if (simpleParamValueRegex.test(value)) {
    return value
  }
  // If there are any unsafe characters, base64url-encode the entire value.
  // We also add a ! prefix so it doesn't collide with the simple case.
  const base64url = btoa(value)
    .replace(/\+/g, '-') // Replace '+' with '-'
    .replace(/\//g, '_') // Replace '/' with '_'
    .replace(/=+$/, '') // Remove trailing '='
  return '!' + base64url
}
