import {PluginItem} from '@babel/core'
const env = process.env.NODE_ENV
const isProduction = env === 'production'
const isDevelopment = env === 'development'
const isTest = env === 'test'

type StyledJsxPlugin = [string, any] | string
type StyledJsxBabelOptions = {
  plugins?: StyledJsxPlugin[]
} | undefined

// Resolve styled-jsx plugins
function styledJsxOptions (options: StyledJsxBabelOptions) {
  if (!options) {
    return {}
  }

  if (!Array.isArray(options.plugins)) {
    return options
  }

  options.plugins = options.plugins.map((plugin: StyledJsxPlugin): StyledJsxPlugin => {
    if (Array.isArray(plugin)) {
      const [name, options] = plugin
      return [
        require.resolve(name),
        options
      ]
    }

    return require.resolve(plugin)
  })

  return options
}

type NextBabelPresetOptions = {
  'preset-env'?: object,
  'preset-react'?: object,
  'preset-typescript'?: object,
  'class-properties'?: object,
  'object-rest-spread'?: object,
  'transform-runtime'?: object,
  'styled-jsx'?: StyledJsxBabelOptions
}

type BabelPreset = {
  presets?: PluginItem[] | null,
  plugins?: PluginItem[] | null,
  overrides?: any[]
}

// Taken from https://github.com/babel/babel/commit/d60c5e1736543a6eac4b549553e107a9ba967051#diff-b4beead8ad9195361b4537601cc22532R158
function supportsStaticESM(caller: any) {
  return !!(caller && caller.supportsStaticESM);
}

module.exports = (api: any, options: NextBabelPresetOptions = {}): BabelPreset => {
  const supportsESM = api.caller(supportsStaticESM)

  const presetEnvConfig = {
    // In the test environment `modules` is often needed to be set to true, babel figures that out by itself using the `'auto'` option
    // In production/development this option is set to `false` so that webpack can handle import/export with tree-shaking
    modules: 'auto',
    exclude: [
      // used to improve react's performance. see: https://github.com/zeit/next.js/pull/6812
      'transform-typeof-symbol'
    ],
    ...options['preset-env']
  }

  const isCjs = ['commonjs', 'cjs'].includes(presetEnvConfig.modules)

  return {
    presets: [
      [require('@babel/preset-env').default, presetEnvConfig],
      [require('@babel/preset-react'), {
        // adds the following in development:
        // * @babel/plugin-transform-react-jsx-source
        // * @babel/plugin-transform-react-jsx-self
        development: isDevelopment || isTest,
        ...options['preset-react']
      }],
      [require('@babel/preset-typescript'), options['preset-typescript'] || {}]
    ],
    plugins: [
      require('babel-plugin-react-require'),
      require('@babel/plugin-syntax-dynamic-import'),
      require('./plugins/react-loadable-plugin'),
      [require('@babel/plugin-proposal-class-properties'), options['class-properties'] || {}],
      [require('@babel/plugin-proposal-object-rest-spread'), {
        useBuiltIns: true,
        ...options['object-rest-spread']
      }],
      [require('@babel/plugin-transform-runtime'), {
        corejs: 2,
        helpers: true,
        regenerator: true,
        useESModules: supportsESM && !isCjs,
        ...options['transform-runtime']
      }],
      [require('styled-jsx/babel'), styledJsxOptions(options['styled-jsx'])],
      require('./plugins/amp-attributes'),
      isProduction && [require('babel-plugin-transform-react-remove-prop-types'), {
        removeImport: true
      }]
    ].filter(Boolean)
  }
}
