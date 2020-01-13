import { join } from 'path'
export const NEXT_PROJECT_ROOT = join(__dirname, '..', '..')
export const NEXT_PROJECT_ROOT_DIST = join(NEXT_PROJECT_ROOT, 'dist')
export const NEXT_PROJECT_ROOT_NODE_MODULES = join(
  NEXT_PROJECT_ROOT,
  'node_modules'
)
export const NEXT_PROJECT_ROOT_DIST_CLIENT = join(
  NEXT_PROJECT_ROOT_DIST,
  'client'
)
export const NEXT_PROJECT_ROOT_DIST_SERVER = join(
  NEXT_PROJECT_ROOT_DIST,
  'server'
)

// Regex for API routes
export const API_ROUTE = /^\/api(?:\/|$)/

// Because on Windows absolute paths in the generated code can break because of numbers, eg 1 in the path,
// we have to use a private alias
export const PAGES_DIR_ALIAS = 'private-next-pages'
export const DOT_NEXT_ALIAS = 'private-dot-next'

export const PUBLIC_DIR_MIDDLEWARE_CONFLICT = `You can not have a '_next' folder inside of your public folder. This conflicts with the internal '/_next' route. https://err.sh/zeit/next.js/public-next-folder-conflict`

export const SPR_GET_INITIAL_PROPS_CONFLICT = `You can not use getInitialProps with unstable_getStaticProps. To use SPR, please remove your getInitialProps`

export const SERVER_PROPS_GET_INIT_PROPS_CONFLICT = `You can not use getInitialProps with unstable_getServerProps. Please remove one or the other`

export const SERVER_PROPS_SPR_CONFLICT = `You can not use unstable_getStaticProps with unstable_getServerProps. To use SPR, please remove your unstable_getServerProps`
