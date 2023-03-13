import { FileReader } from './helpers/file-reader/file-reader'
import { AppRouteRouteMatcher } from '../../route-matchers/app-route-route-matcher'
import { Normalizer } from '../../normalizers/normalizer'
import { Normalizers } from '../../normalizers/normalizers'
import { AbsoluteFilenameNormalizer } from '../../normalizers/absolute-filename-normalizer'
import { wrapNormalizerFn } from '../../normalizers/wrap-normalizer-fn'
import { normalizeAppPath } from '../../../../shared/lib/router/utils/app-paths'
import { PrefixingNormalizer } from '../../normalizers/prefixing-normalizer'
import { RouteKind } from '../../route-kind'
import { FileCacheRouteMatcherProvider } from './file-cache-route-matcher-provider'
import {
  isMetadataRoute,
  isStaticMetadataRoute,
} from '../../../../lib/is-app-route-route'

export class DevAppRouteRouteMatcherProvider extends FileCacheRouteMatcherProvider<AppRouteRouteMatcher> {
  private readonly expression: RegExp
  private readonly normalizers: {
    page: Normalizer
    pathname: Normalizer
    bundlePath: Normalizer
  }

  constructor(
    appDir: string,
    extensions: ReadonlyArray<string>,
    reader: FileReader
  ) {
    super(appDir, reader)

    // Match any route file that ends with `/route.${extension}` under the app directory.
    // Match top level robots file that ends with `/robots.${extension}` under the app directory.
    this.expression = new RegExp(
      `[/\\\\]route\\.(?:${extensions.join(
        '|'
      )})$|[/\\\\]robots\\.(?:${extensions
        .concat('txt')
        .join('|')})?$|[/\\\\]sitemap\\.(?:${extensions
        .concat('xml')
        .join('|')})?$|[/\\\\]favicon\\.ico$`
    )

    const pageNormalizer = new AbsoluteFilenameNormalizer(appDir, extensions)

    this.normalizers = {
      page: pageNormalizer,
      pathname: new Normalizers([
        // The pathname to match should have the trailing `/route` and other route
        // group information stripped from it.
        wrapNormalizerFn(normalizeAppPath),
      ]),
      bundlePath: new Normalizers([
        // Prefix the bundle path with `app/`.
        new PrefixingNormalizer('app'),
      ]),
    }
  }

  protected async transform(
    files: ReadonlyArray<string>
  ): Promise<ReadonlyArray<AppRouteRouteMatcher>> {
    const matchers: Array<AppRouteRouteMatcher> = []
    for (const filename of files) {
      // If the file isn't a match for this matcher, then skip it.
      if (!this.expression.test(filename)) {
        continue
      }

      let page = this.normalizers.page.normalize(filename)
      if (isMetadataRoute(page)) {
        if (!isStaticMetadataRoute(page)) {
          if (page === '/sitemap') {
            page += '.xml'
          }
          if (page === '/robots') {
            page += '.txt'
          }
          if (page === '/favicon') {
            page += '.ico'
          }
        }
        page = `${page}/route`
      }

      const pathname = this.normalizers.pathname.normalize(page)
      const bundlePath = this.normalizers.bundlePath.normalize(page)

      matchers.push(
        new AppRouteRouteMatcher({
          kind: RouteKind.APP_ROUTE,
          pathname,
          page,
          bundlePath,
          filename,
        })
      )
    }

    return matchers
  }
}
