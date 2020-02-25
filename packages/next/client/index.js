/* global location */
import React from 'react'
import ReactDOM from 'react-dom'
import HeadManager from './head-manager'
import { createRouter, makePublicRouterInstance } from 'next/router'
import mitt from '../next-server/lib/mitt'
import { loadGetInitialProps, getURL, ST } from '../next-server/lib/utils'
import PageLoader from './page-loader'
import * as envConfig from '../next-server/lib/runtime-config'
import { HeadManagerContext } from '../next-server/lib/head-manager-context'
import { RouterContext } from '../next-server/lib/router-context'
import { parse as parseQs, stringify as stringifyQs } from 'querystring'
import { isDynamicRoute } from '../next-server/lib/router/utils/is-dynamic'

/// <reference types="react-dom/experimental" />

if (!('finally' in Promise.prototype)) {
  // eslint-disable-next-line no-extend-native
  Promise.prototype.finally = require('finally-polyfill')
}

const data = JSON.parse(document.getElementById('__NEXT_DATA__').textContent)
window.__NEXT_DATA__ = data

export const version = process.env.__NEXT_VERSION

const {
  props,
  err,
  page,
  query,
  buildId,
  assetPrefix,
  runtimeConfig,
  dynamicIds,
  isFallback,
} = data

const prefix = assetPrefix || ''

// With dynamic assetPrefix it's no longer possible to set assetPrefix at the build time
// So, this is how we do it in the client side at runtime
__webpack_public_path__ = `${prefix}/_next/` //eslint-disable-line
// Initialize next/config with the environment configuration
envConfig.setConfig({
  serverRuntimeConfig: {},
  publicRuntimeConfig: runtimeConfig || {},
})

const asPath = getURL()

const pageLoader = new PageLoader(buildId, prefix)
const register = ([r, f]) => pageLoader.registerPage(r, f)
if (window.__NEXT_P) {
  window.__NEXT_P.map(register)
}
window.__NEXT_P = []
window.__NEXT_P.push = register

const headManager = new HeadManager()
const appElement = document.getElementById('__next')

let lastAppProps
let webpackHMR
export let router
let ErrorComponent
let Component
let App, onPerfEntry

class Container extends React.Component {
  componentDidCatch(err, info) {
    this.props.fn(err, info)
  }

  componentDidMount() {
    this.scrollToHash()

    if (process.env.__NEXT_PLUGINS) {
      // eslint-disable-next-line
      import('next-plugin-loader?middleware=unstable-post-hydration!')
        .then(mod => {
          return mod.default()
        })
        .catch(err => {
          console.error('Error calling post-hydration for plugins', err)
        })
    }

    // We need to replace the router state if:
    // - the page was (auto) exported and has a query string or search (hash)
    // - it was auto exported and is a dynamic route (to provide params)
    // - if it is a client-side skeleton (fallback render)
    if (
      router.isSsr &&
      (isFallback ||
        (data.nextExport &&
          (isDynamicRoute(router.pathname) || location.search)) ||
        (Component && Component.__N_SSG && location.search))
    ) {
      // update query on mount for exported pages
      router.replace(
        router.pathname +
          '?' +
          stringifyQs({
            ...router.query,
            ...parseQs(location.search.substr(1)),
          }),
        asPath,
        {
          // WARNING: `_h` is an internal option for handing Next.js
          // client-side hydration. Your app should _never_ use this property.
          // It may change at any time without notice.
          _h: 1,
          // Fallback pages must trigger the data fetch, so the transition is
          // not shallow.
          // Other pages (strictly updating query) happens shallowly, as data
          // requirements would already be present.
          shallow: !isFallback,
        }
      )
    }

    if (process.env.__NEXT_TEST_MODE) {
      window.__NEXT_HYDRATED = true

      if (window.__NEXT_HYDRATED_CB) {
        window.__NEXT_HYDRATED_CB()
      }
    }
  }

  componentDidUpdate() {
    this.scrollToHash()
  }

  scrollToHash() {
    let { hash } = location
    hash = hash && hash.substring(1)
    if (!hash) return

    const el = document.getElementById(hash)
    if (!el) return

    // If we call scrollIntoView() in here without a setTimeout
    // it won't scroll properly.
    setTimeout(() => el.scrollIntoView(), 0)
  }

  render() {
    return this.props.children
  }
}

export const emitter = mitt()

export default async ({ webpackHMR: passedWebpackHMR } = {}) => {
  // This makes sure this specific lines are removed in production
  if (process.env.NODE_ENV === 'development') {
    webpackHMR = passedWebpackHMR
  }

  let renderCtx
  const doRender = await getRenderFn(async () => {
    const { page: app, mod } = await pageLoader.loadPageScript('/_app')
    App = app
    if (mod && mod.unstable_onPerformanceData) {
      onPerfEntry = function({ name, startTime, value, duration }) {
        mod.unstable_onPerformanceData({ name, startTime, value, duration })
      }
    }

    let initialErr = err

    try {
      Component = await pageLoader.loadPage(page)

      if (process.env.NODE_ENV !== 'production') {
        const { isValidElementType } = require('react-is')
        if (!isValidElementType(Component)) {
          throw new Error(
            `The default export is not a React Component in page: "${page}"`
          )
        }
      }
    } catch (error) {
      // This catches errors like throwing in the top level of a module
      initialErr = error
    }

    if (window.__NEXT_PRELOADREADY) {
      await window.__NEXT_PRELOADREADY(dynamicIds)
    }

    router = createRouter(page, query, asPath, {
      initialProps: props,
      pageLoader,
      App,
      Component,
      wrapApp,
      err: initialErr,
      isFallback,
      subscription: ({ Component, props, err }, App) => {
        render({ App, Component, props, err })
      },
    })

    // call init-client middleware
    if (process.env.__NEXT_PLUGINS) {
      // eslint-disable-next-line
      import('next-plugin-loader?middleware=on-init-client!')
        .then(mod => {
          return mod.default({ router })
        })
        .catch(err => {
          console.error('Error calling client-init for plugins', err)
        })
    }

    renderCtx = { App, Component, props, err: initialErr }
    return renderCtx
  })

  if (process.env.NODE_ENV === 'production') {
    doRender()
    return emitter
  }

  if (process.env.NODE_ENV !== 'production') {
    return { emitter, render, renderCtx }
  }
}

export async function render(props) {
  const doRender = await getRenderFn(() => renderToElem(props))
  await doRender()
}

async function renderToElem(props) {
  if (props.err) {
    return await renderErrorToElem(props)
  }
  try {
    return await getElemToRender(props)
  } catch (err) {
    await renderError({ ...props, err })
  }
}

async function renderErrorToElem(props) {
  const { App, err } = props

  // In development runtime errors are caught by react-error-overlay
  // In production we catch runtime errors using componentDidCatch which will trigger renderError
  if (process.env.NODE_ENV !== 'production') {
    return webpackHMR.reportRuntimeError(webpackHMR.prepareError(err))
  }
  if (process.env.__NEXT_PLUGINS) {
    // eslint-disable-next-line
    import('next-plugin-loader?middleware=on-error-client!')
      .then(mod => {
        return mod.default({ err })
      })
      .catch(err => {
        console.error('error calling on-error-client for plugins', err)
      })
  }

  // Make sure we log the error to the console, otherwise users can't track down issues.
  console.error(err)

  ErrorComponent = await pageLoader.loadPage('/_error')

  // In production we do a normal render with the `ErrorComponent` as component.
  // If we've gotten here upon initial render, we can use the props from the server.
  // Otherwise, we need to call `getInitialProps` on `App` before mounting.
  const AppTree = wrapApp(App)
  const appCtx = {
    Component: ErrorComponent,
    AppTree,
    router,
    ctx: { err, pathname: page, query, asPath, AppTree },
  }

  const initProps = props.props
    ? props.props
    : await loadGetInitialProps(App, appCtx)

  return await getElemToRender({
    ...props,
    err,
    Component: ErrorComponent,
    props: initProps,
  })
}

// This method handles all runtime and debug errors.
// 404 and 500 errors are special kind of errors
// and they are still handle via the main render method.
export async function renderError(props) {
  const doRender = await getRenderFn(() => renderErrorToElem(props))
  await doRender()
}

// If hydrate does not exist, eg in preact.
let isInitialRender = typeof ReactDOM.hydrate === 'function'
let reactRoot = null
function renderReactElement(reactEl, domEl) {
  if (process.env.__NEXT_REACT_MODE !== 'legacy') {
    if (!reactRoot) {
      const opts = { hydrate: true }
      reactRoot =
        process.env.__NEXT_REACT_MODE === 'concurrent'
          ? ReactDOM.createRoot(domEl, opts)
          : ReactDOM.createBlockingRoot(domEl, opts)
    }
    reactRoot.render(reactEl)
  } else {
    // mark start of hydrate/render
    if (ST) {
      performance.mark('beforeRender')
    }

    // The check for `.hydrate` is there to support React alternatives like preact
    if (isInitialRender) {
      ReactDOM.hydrate(reactEl, domEl, markHydrateComplete)
      isInitialRender = false
    } else {
      ReactDOM.render(reactEl, domEl, markRenderComplete)
    }
  }

  if (onPerfEntry && ST) {
    try {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(onPerfEntry)
      })
      // Start observing paint entry types.
      observer.observe({
        type: 'paint',
        buffered: true,
      })
    } catch (e) {
      window.addEventListener('load', () => {
        performance.getEntriesByType('paint').forEach(onPerfEntry)
      })
    }
  }
}

function markHydrateComplete() {
  if (!ST) return

  performance.mark('afterHydrate') // mark end of hydration

  performance.measure(
    'Next.js-before-hydration',
    'navigationStart',
    'beforeRender'
  )
  performance.measure('Next.js-hydration', 'beforeRender', 'afterHydrate')
  if (onPerfEntry) {
    performance.getEntriesByName('Next.js-hydration').forEach(onPerfEntry)
    performance.getEntriesByName('beforeRender').forEach(onPerfEntry)
  }
  clearMarks()
}

function markRenderComplete() {
  if (!ST) return

  performance.mark('afterRender') // mark end of render
  const navStartEntries = performance.getEntriesByName('routeChange', 'mark')

  if (!navStartEntries.length) {
    return
  }

  performance.measure(
    'Next.js-route-change-to-render',
    navStartEntries[0].name,
    'beforeRender'
  )
  performance.measure('Next.js-render', 'beforeRender', 'afterRender')
  if (onPerfEntry) {
    performance.getEntriesByName('Next.js-render').forEach(onPerfEntry)
    performance
      .getEntriesByName('Next.js-route-change-to-render')
      .forEach(onPerfEntry)
  }
  clearMarks()
}

function clearMarks() {
  ;[
    'beforeRender',
    'afterHydrate',
    'afterRender',
    'routeChange',
  ].forEach(mark => performance.clearMarks(mark))
  ;[
    'Next.js-before-hydration',
    'Next.js-hydration',
    'Next.js-route-change-to-render',
    'Next.js-render',
  ].forEach(measure => performance.clearMeasures(measure))
}

function AppContainer({ children }) {
  return (
    <Container
      fn={error =>
        renderError({ App, err: error }).catch(err =>
          console.error('Error rendering page: ', err)
        )
      }
    >
      <RouterContext.Provider value={makePublicRouterInstance(router)}>
        <HeadManagerContext.Provider value={headManager.updateHead}>
          {children}
        </HeadManagerContext.Provider>
      </RouterContext.Provider>
    </Container>
  )
}

const wrapApp = App => props => {
  const appProps = { ...props, Component, err, router }
  return (
    <AppContainer>
      <App {...appProps} />
    </AppContainer>
  )
}

async function getElemToRender({ App, Component, props, err }) {
  // Usual getInitialProps fetching is handled in next/router
  // this is for when ErrorComponent gets replaced by Component by HMR
  if (
    !props &&
    Component &&
    Component !== ErrorComponent &&
    lastAppProps.Component === ErrorComponent
  ) {
    const { pathname, query, asPath } = router
    const AppTree = wrapApp(App)
    const appCtx = {
      router,
      AppTree,
      Component: ErrorComponent,
      ctx: { err, pathname, query, asPath, AppTree },
    }
    props = await loadGetInitialProps(App, appCtx)
  }

  Component = Component || lastAppProps.Component
  props = props || lastAppProps.props

  const appProps = { ...props, Component, err, router }
  // lastAppProps has to be set before ReactDom.render to account for ReactDom throwing an error.
  lastAppProps = appProps

  return {
    Component,
    ErrorComponent,
    appProps,
  }
}

async function getRenderFn(getElem) {
  let resolveWith
  let status = {
    state: 'PENDING',
    promise: new Promise(async resolve => {
      // We use a promise object instead of async here because
      // we don't want loading errors to be thrown to React,
      // but instead to the caller of `doRender`.
      resolveWith = value => {
        status = { state: 'RESOLVED', value }
        resolve()
      }
    }),
  }
  const waitForLoad = async () => {
    if (status.state === 'PENDING') {
      const elem = await getElem()
      resolveWith(elem)
    }
  }

  if (process.env.__NEXT_REACT_MODE === 'legacy') {
    // In legacy mode, `useElem` should always return without suspending,
    // so we wait for it here instead.
    await waitForLoad()
  }

  return async () => {
    // We catch runtime errors using componentDidCatch which will trigger renderError
    renderReactElement(
      <NextRoot
        useElem={() => {
          if (status.state === 'PENDING') {
            throw status.promise
          }
          return status.value
        }}
      />,
      appElement
    )

    if (process.env.__NEXT_REACT_MODE !== 'legacy') {
      // In Concurrent or Blocking Mode, `useElem` should suspend.
      await waitForLoad()
    }
  }
}

function NextRoot({ useElem }) {
  const { Component, ErrorComponent, appProps } = useElem()

  React.useLayoutEffect(() => {
    emitter.emit('before-reactdom-render', {
      Component,
      ErrorComponent,
      appProps,
    })
  }, [Component, ErrorComponent, appProps])

  React.useEffect(() => {
    emitter.emit('after-reactdom-render', {
      Component,
      ErrorComponent,
      appProps,
    })
  }, [Component, ErrorComponent, appProps])

  const elem = (
    <AppContainer>
      <App {...appProps} />
    </AppContainer>
  )

  return process.env.__NEXT_STRICT_MODE ? (
    <React.StrictMode>{elem}</React.StrictMode>
  ) : (
    elem
  )
}
