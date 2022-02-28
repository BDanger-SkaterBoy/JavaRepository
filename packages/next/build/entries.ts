import chalk from 'next/dist/compiled/chalk'
import { posix, join } from 'path'
import { stringify } from 'querystring'
import { API_ROUTE, PAGES_DIR_ALIAS } from '../lib/constants'
import { MIDDLEWARE_ROUTE } from '../lib/constants'
import { normalizePagePath } from '../server/normalize-page-path'
import { warn } from './output/log'
import { MiddlewareLoaderOptions } from './webpack/loaders/next-middleware-loader'
import { ClientPagesLoaderOptions } from './webpack/loaders/next-client-pages-loader'
import { NextConfigComplete } from '../server/config-shared'
import { isCustomErrorPage, isFlightPage, isReservedPage } from './utils'
import { ssrEntries } from './webpack/plugins/middleware-plugin'
import type { webpack5 } from 'next/dist/compiled/webpack/webpack'
import {
  MIDDLEWARE_RUNTIME_WEBPACK,
  MIDDLEWARE_SSR_RUNTIME_WEBPACK,
} from '../shared/lib/constants'

type ObjectValue<T> = T extends { [key: string]: infer V } ? V : never
export type PagesMapping = {
  [page: string]: string
}

export function getPageFromPath(pagePath: string, extensions: string[]) {
  let page = pagePath.replace(new RegExp(`\\.+(${extensions.join('|')})$`), '')
  page = page.replace(/\\/g, '/').replace(/\/index$/, '')
  return page === '' ? '/' : page
}

export function createPagesMapping(
  pagePaths: string[],
  extensions: string[],
  {
    isDev,
    hasServerComponents,
    runtime,
  }: {
    isDev: boolean
    hasServerComponents: boolean
    runtime?: 'nodejs' | 'edge'
  }
): PagesMapping {
  const previousPages: PagesMapping = {}

  // Do not process .d.ts files inside the `pages` folder
  pagePaths = extensions.includes('ts')
    ? pagePaths.filter((pagePath) => !pagePath.endsWith('.d.ts'))
    : pagePaths

  const pages: PagesMapping = pagePaths.reduce(
    (result: PagesMapping, pagePath): PagesMapping => {
      const pageKey = getPageFromPath(pagePath, extensions)

      if (hasServerComponents && /\.client$/.test(pageKey)) {
        // Assume that if there's a Client Component, that there is
        // a matching Server Component that will map to the page.
        return result
      }

      if (pageKey in result) {
        warn(
          `Duplicate page detected. ${chalk.cyan(
            join('pages', previousPages[pageKey])
          )} and ${chalk.cyan(
            join('pages', pagePath)
          )} both resolve to ${chalk.cyan(pageKey)}.`
        )
      } else {
        previousPages[pageKey] = pagePath
      }
      result[pageKey] = join(PAGES_DIR_ALIAS, pagePath).replace(/\\/g, '/')
      return result
    },
    {}
  )

  // we alias these in development and allow webpack to
  // allow falling back to the correct source file so
  // that HMR can work properly when a file is added/removed
  const documentPage = `_document${runtime ? '-concurrent' : ''}`
  if (isDev) {
    pages['/_app'] = `${PAGES_DIR_ALIAS}/_app`
    pages['/_error'] = `${PAGES_DIR_ALIAS}/_error`
    pages['/_document'] = `${PAGES_DIR_ALIAS}/_document`
  } else {
    pages['/_app'] = pages['/_app'] || 'next/dist/pages/_app'
    pages['/_error'] = pages['/_error'] || 'next/dist/pages/_error'
    pages['/_document'] =
      pages['/_document'] || `next/dist/pages/${documentPage}`
  }
  return pages
}

type Entrypoints = {
  client: webpack5.EntryObject
  server: webpack5.EntryObject
  edgeServer: webpack5.EntryObject
}

export function createEntrypoints(
  pages: PagesMapping,
  buildId: string,
  config: NextConfigComplete
): Entrypoints {
  const client: webpack5.EntryObject = {}
  const server: webpack5.EntryObject = {}
  const edgeServer: webpack5.EntryObject = {}

  const edgeRuntime = config.experimental.runtime === 'edge'

  Object.keys(pages).forEach((page) => {
    const absolutePagePath = pages[page]
    const bundleFile = normalizePagePath(page)
    const isApiRoute = page.match(API_ROUTE)

    const clientBundlePath = posix.join('pages', bundleFile)
    const serverBundlePath = posix.join('pages', bundleFile)

    const isReserved = isReservedPage(page)
    const isCustomError = isCustomErrorPage(page)
    const isFlight = isFlightPage(config, absolutePagePath)

    if (page.match(MIDDLEWARE_ROUTE)) {
      const loaderOpts: MiddlewareLoaderOptions = {
        absolutePagePath: pages[page],
        page,
      }

      client[clientBundlePath] = `next-middleware-loader?${stringify(
        loaderOpts
      )}!`
      return
    }

    if (edgeRuntime && !isReserved && !isCustomError && !isApiRoute) {
      ssrEntries.set(clientBundlePath, { requireFlightManifest: isFlight })
      edgeServer[serverBundlePath] = finalizeEntrypoint({
        name: '[name].js',
        value: `next-middleware-ssr-loader?${stringify({
          dev: false,
          page,
          buildId,
          stringifiedConfig: JSON.stringify(config),
          absolute500Path: pages['/500'] || '',
          absolutePagePath,
          absoluteAppPath: pages['/_app'],
          absoluteDocumentPath: pages['/_document'],
          absoluteErrorPath: pages['/_error'],
          isServerComponent: isFlight,
        } as any)}!`,
        isServer: false,
        isEdgeServer: true,
      })
    }

    if (!edgeRuntime || isReserved || isCustomError) {
      server[serverBundlePath] = [absolutePagePath]
    }

    if (page === '/_document') {
      return
    }

    if (!isApiRoute) {
      const pageLoaderOpts: ClientPagesLoaderOptions = {
        page,
        absolutePagePath,
      }
      const pageLoader = `next-client-pages-loader?${stringify(
        pageLoaderOpts
      )}!`

      // Make sure next/router is a dependency of _app or else chunk splitting
      // might cause the router to not be able to load causing hydration
      // to fail

      client[clientBundlePath] =
        page === '/_app'
          ? [pageLoader, require.resolve('../client/router')]
          : pageLoader
    }
  })

  return {
    client,
    server,
    edgeServer,
  }
}

export function finalizeEntrypoint({
  name,
  value,
  isServer,
  isMiddleware,
  isEdgeServer,
}: {
  isServer: boolean
  name: string
  value: ObjectValue<webpack5.EntryObject>
  isMiddleware?: boolean
  isEdgeServer?: boolean
}): ObjectValue<webpack5.EntryObject> {
  const entry =
    typeof value !== 'object' || Array.isArray(value)
      ? { import: value }
      : value

  if (isServer) {
    const isApi = name.startsWith('pages/api/')
    return {
      publicPath: isApi ? '' : undefined,
      runtime: isApi ? 'webpack-api-runtime' : 'webpack-runtime',
      layer: isApi ? 'api' : undefined,
      ...entry,
    }
  }

  if (isEdgeServer) {
    const ssrMiddlewareEntry = {
      library: {
        name: ['_ENTRIES', `middleware_[name]`],
        type: 'assign',
      },
      runtime: MIDDLEWARE_SSR_RUNTIME_WEBPACK,
      asyncChunks: false,
      ...entry,
    }
    return ssrMiddlewareEntry
  }
  if (isMiddleware) {
    const middlewareEntry = {
      filename: 'server/[name].js',
      layer: 'middleware',
      library: {
        name: ['_ENTRIES', `middleware_[name]`],
        type: 'assign',
      },
      runtime: MIDDLEWARE_RUNTIME_WEBPACK,
      asyncChunks: false,
      ...entry,
    }
    return middlewareEntry
  }

  if (
    name !== 'polyfills' &&
    name !== 'main' &&
    name !== 'amp' &&
    name !== 'react-refresh'
  ) {
    return {
      dependOn:
        name.startsWith('pages/') && name !== 'pages/_app'
          ? 'pages/_app'
          : 'main',
      ...entry,
    }
  }

  return entry
}
