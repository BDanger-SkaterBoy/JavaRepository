import { isNextBuiltinClientComponent } from './utils'

export default async function transformSource(this: any): Promise<string> {
  const { modules, runtime, ssr } = this.getOptions()
  const requests: string[] = !Array.isArray(modules)
    ? modules
      ? [modules]
      : []
    : modules

  const source =
    requests
      .map((request: string) => {
        // TODO: only emit lazy chunks if it's under views/
        const isClientSource =
          !isNextBuiltinClientComponent(request) &&
          request.endsWith('.client.js')
        const webpackMode = isClientSource ? 'lazy' : 'eager'

        return `import(
          /* webpackMode: "${webpackMode}" */
          ${JSON.stringify(request)}
        )`
      })
      .join(';\n') +
    `
    export const __next_rsc__ = {
      server: false,
      __webpack_require__
    };
    export default function RSC() {};
    ` +
    // Currently for the Edge runtime, we treat all RSC pages as SSR pages.
    (runtime === 'edge'
      ? 'export const __N_SSP = true;'
      : ssr
      ? `export const __N_SSP = true;`
      : `export const __N_SSG = true;`)

  return source
}
