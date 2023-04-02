import type { ServerRuntime } from '../../types'

// in seconds
export const CACHE_ONE_YEAR = 31536000

// Prerender values
export const PRERENDER_REVALIDATE_HEADER = 'x-prerender-revalidate'
export const PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER =
  'x-prerender-revalidate-if-generated'

// Patterns to detect middleware files
export const MIDDLEWARE_FILENAME = 'middleware'
export const MIDDLEWARE_LOCATION_REGEXP = `(?:src/)?${MIDDLEWARE_FILENAME}`

// Pattern to detect instrumentation hooks file
export const INSTRUMENTATION_HOOK_FILENAME = 'instrumentation'
export const INSTRUMENTATION_HOOKS_LOCATION_REGEXP = `(?:src/)?${INSTRUMENTATION_HOOK_FILENAME}`

// Because on Windows absolute paths in the generated code can break because of numbers, eg 1 in the path,
// we have to use a private alias
export const PAGES_DIR_ALIAS = 'private-next-pages'
export const DOT_NEXT_ALIAS = 'private-dot-next'
export const ROOT_DIR_ALIAS = 'private-next-root-dir'
export const APP_DIR_ALIAS = 'private-next-app-dir'
export const RSC_MOD_REF_PROXY_ALIAS = 'private-next-rsc-mod-ref-proxy'
export const RSC_ACTION_PROXY_ALIAS = 'private-next-rsc-action-proxy'

export const PUBLIC_DIR_MIDDLEWARE_CONFLICT = `You can not have a '_next' folder inside of your public folder. This conflicts with the internal '/_next' route. https://nextjs.org/docs/messages/public-next-folder-conflict`

export const SSG_GET_INITIAL_PROPS_CONFLICT = `You can not use getInitialProps with getStaticProps. To use SSG, please remove your getInitialProps`

export const SERVER_PROPS_GET_INIT_PROPS_CONFLICT = `You can not use getInitialProps with getServerSideProps. Please remove getInitialProps.`

export const SERVER_PROPS_SSG_CONFLICT = `You can not use getStaticProps or getStaticPaths with getServerSideProps. To use SSG, please remove getServerSideProps`

export const STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR = `can not have getInitialProps/getServerSideProps, https://nextjs.org/docs/messages/404-get-initial-props`

export const SERVER_PROPS_EXPORT_ERROR = `pages with \`getServerSideProps\` can not be exported. See more info here: https://nextjs.org/docs/messages/gssp-export`

export const GSP_NO_RETURNED_VALUE =
  'Your `getStaticProps` function did not return an object. Did you forget to add a `return`?'
export const GSSP_NO_RETURNED_VALUE =
  'Your `getServerSideProps` function did not return an object. Did you forget to add a `return`?'

export const UNSTABLE_REVALIDATE_RENAME_ERROR =
  'The `unstable_revalidate` property is available for general use.\n' +
  'Please use `revalidate` instead.'

export const GSSP_COMPONENT_MEMBER_ERROR = `can not be attached to a page's component and must be exported from the page. See more info here: https://nextjs.org/docs/messages/gssp-component-member`

export const NON_STANDARD_NODE_ENV = `You are using a non-standard "NODE_ENV" value in your environment. This creates inconsistencies in the project and is strongly advised against. Read more: https://nextjs.org/docs/messages/non-standard-node-env`

export const SSG_FALLBACK_EXPORT_ERROR = `Pages with \`fallback\` enabled in \`getStaticPaths\` can not be exported. See more info here: https://nextjs.org/docs/messages/ssg-fallback-true-export`

// Consolidate this consts when the `appDir` will be stable.
export const ESLINT_DEFAULT_DIRS = ['pages', 'components', 'lib', 'src']
export const ESLINT_DEFAULT_DIRS_WITH_APP = ['app', ...ESLINT_DEFAULT_DIRS]

export const ESLINT_PROMPT_VALUES = [
  {
    title: 'Strict',
    recommended: true,
    config: {
      extends: 'next/core-web-vitals',
    },
  },
  {
    title: 'Base',
    config: {
      extends: 'next',
    },
  },
  {
    title: 'Cancel',
    config: null,
  },
]

export const SERVER_RUNTIME: Record<string, ServerRuntime> = {
  edge: 'edge',
  experimentalEdge: 'experimental-edge',
  nodejs: 'nodejs',
}

export const WEBPACK_LAYERS = {
  shared: 'sc_shared',
  server: 'sc_server',
  client: 'sc_client',
  action: 'sc_action',
  api: 'api',
  middleware: 'middleware',
  edgeAsset: 'edge-asset',
  appClient: 'app-client',
}
