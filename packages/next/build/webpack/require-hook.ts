// sync injects a hook for webpack and webpack/... requires to use the internal ncc webpack version
// this is in order for userland plugins to attach to the same webpack instance as next.js
// the individual compiled modules are as defined for the compilation in bundles/webpack/packages/*

export default function loadRequireHook(aliases: [string, string][] = []) {
  const hookPropertyMap = new Map(
    [...aliases, ['styled-jsx', 'next/dist/styled-jsx']].map(
      ([request, replacement]) => [request, require.resolve(replacement)]
    )
  )

  const mod = require('module')
  const resolveFilename = mod._resolveFilename
  mod._resolveFilename = function (
    request: string,
    parent: any,
    isMain: boolean,
    options: any
  ) {
    const hookResolved = hookPropertyMap.get(request)
    if (hookResolved) request = hookResolved
    return resolveFilename.call(mod, request, parent, isMain, options)
  }
}
