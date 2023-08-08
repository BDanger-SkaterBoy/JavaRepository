import type { GetDynamicParamFromSegment } from '../../server/app-render/app-render'
import type { LoaderTree } from '../../server/lib/app-dir-module'

import React from 'react'
import {
  AppleWebAppMeta,
  FormatDetectionMeta,
  ItunesMeta,
  BasicMetadata,
  VerificationMeta,
} from './generate/basic'
import { AlternatesMetadata } from './generate/alternate'
import {
  OpenGraphMetadata,
  TwitterMetadata,
  AppLinksMeta,
} from './generate/opengraph'
import { IconsMetadata } from './generate/icons'
import { resolveMetadata } from './resolve-metadata'
import { MetaFilter } from './generate/meta'
import { ResolvedMetadata } from './types/metadata-interface'
import { createDefaultMetadata } from './default-metadata'
import { isNotFoundError } from '../../client/components/not-found'

// Use a promise to share the status of the metadata resolving,
// returning two components `MetadataTree` and `MetadataOutlet`
// `MetadataTree` is the one that will be rendered at first in the content sequence for metadata tags.
// `MetadataOutlet` is the one that will be rendered under error boundaries for metadata resolving errors.
// In this way we can let the metadata tags always render successfully,
// and the error will be caught by the error boundary and trigger fallbacks.
export function createMetadataComponents({
  tree,
  pathname,
  searchParams,
  getDynamicParamFromSegment,
  appUsingSizeAdjust,
  errorType,
}: {
  tree: LoaderTree
  pathname: string
  searchParams: { [key: string]: any }
  getDynamicParamFromSegment: GetDynamicParamFromSegment
  appUsingSizeAdjust: boolean
  errorType?: 'not-found' | 'redirect'
}): [React.ComponentType, React.ComponentType] {
  const metadataContext = {
    pathname,
  }

  let resolve: (value: Error | undefined) => void | undefined
  // Only use promise.resolve here to avoid unhandled rejections
  const metadataErrorResolving = new Promise<Error | undefined>((res) => {
    resolve = res
  })

  async function MetadataTree() {
    const defaultMetadata = createDefaultMetadata()
    let metadata: ResolvedMetadata | undefined = defaultMetadata
    let error: any
    const errorMetadataItem: [null, null] = [null, null]
    const errorConvention = errorType === 'redirect' ? undefined : errorType

    const metadataResult = await resolveMetadata({
      tree,
      parentParams: {},
      metadataItems: [],
      errorMetadataItem,
      searchParams,
      getDynamicParamFromSegment,
      errorConvention,
      metadataContext,
    })
    if (!metadataResult[1]) {
      metadata = metadataResult[0]
      resolve(undefined)
    } else {
      error = metadataResult[1]
      // If the error triggers in initial metadata resolving, re-resolve with proper error type.
      // They'll be saved for flight data, when hydrates, it will replaces the SSR'd metadata with this.
      // for not-found error: resolve not-found metadata
      if (!errorType && isNotFoundError(metadataResult[1])) {
        const errorMetadataResult = await resolveMetadata({
          tree,
          parentParams: {},
          metadataItems: [],
          errorMetadataItem,
          searchParams,
          getDynamicParamFromSegment,
          errorConvention: 'not-found',
          metadataContext,
        })
        metadata = metadataResult[0]
        error = errorMetadataResult[1] || error
      }
      resolve(error)
    }

    const elements = MetaFilter([
      BasicMetadata({ metadata }),
      AlternatesMetadata({ alternates: metadata.alternates }),
      ItunesMeta({ itunes: metadata.itunes }),
      FormatDetectionMeta({ formatDetection: metadata.formatDetection }),
      VerificationMeta({ verification: metadata.verification }),
      AppleWebAppMeta({ appleWebApp: metadata.appleWebApp }),
      OpenGraphMetadata({ openGraph: metadata.openGraph }),
      TwitterMetadata({ twitter: metadata.twitter }),
      AppLinksMeta({ appLinks: metadata.appLinks }),
      IconsMetadata({ icons: metadata.icons }),
    ])

    if (appUsingSizeAdjust) elements.push(<meta name="next-size-adjust" />)

    return (
      <>
        {elements.map((el, index) => {
          return React.cloneElement(el as React.ReactElement, { key: index })
        })}
      </>
    )
  }

  async function MetadataOutlet() {
    const error = await metadataErrorResolving
    if (error) {
      throw error
    }
    return null
  }

  // @ts-expect-error async server components
  return [MetadataTree, MetadataOutlet]
}
