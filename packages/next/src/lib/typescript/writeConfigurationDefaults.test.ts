import { mkdtemp, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// eslint-disable-next-line import/no-extraneous-dependencies
import ts from 'typescript'
import { writeConfigurationDefaults } from './writeConfigurationDefaults'

describe('writeConfigurationDefaults()', () => {
  it('applies suggested and mandatory defaults to existing tsconfig.json and logs them', async () => {
    const tmpDir = await mkdtemp(join(tmpdir(), 'nextjs-test-'))
    const tsConfigPath = join(tmpDir, 'tsconfig.json')
    const isFirstTimeSetup = false
    const hasAppDir = true
    const distDir = '.next'
    const hasPagesDir = false
    const logSpy = jest.spyOn(console, 'log')

    await writeFile(tsConfigPath, JSON.stringify({ compilerOptions: {} }), {
      encoding: 'utf8',
    })

    await writeConfigurationDefaults(
      ts,
      tsConfigPath,
      isFirstTimeSetup,
      hasAppDir,
      distDir,
      hasPagesDir
    )

    const tsConfig = await readFile(tsConfigPath, { encoding: 'utf8' })

    expect(JSON.parse(tsConfig)).toMatchInlineSnapshot(`
      {
        "compilerOptions": {
          "allowJs": true,
          "esModuleInterop": true,
          "incremental": true,
          "isolatedModules": true,
          "jsx": "preserve",
          "lib": [
            "dom",
            "dom.iterable",
            "esnext",
          ],
          "module": "esnext",
          "moduleResolution": "node",
          "noEmit": true,
          "plugins": [
            {
              "name": "next",
            },
          ],
          "resolveJsonModule": true,
          "skipLibCheck": true,
          "strict": false,
          "target": "ES2017",
        },
        "exclude": [
          "node_modules",
        ],
        "include": [
          "next-env.d.ts",
          ".next/types/**/*.ts",
          "**/*.ts",
          "**/*.tsx",
        ],
      }
    `)

    expect(
      logSpy.mock.calls
        .flat()
        .join('\n')
        // eslint-disable-next-line no-control-regex
        .replace(/\x1B\[\d+m/g, '') // remove color control characters
    ).toMatchInlineSnapshot(`
      "
        
      We detected TypeScript in your project and reconfigured your tsconfig.json file for you. Strict-mode is set to false by default.
        
      The following suggested values were added to your tsconfig.json. These values can be changed to fit your project's needs:

        
      	-  (For top-level \`await\`. Note: Next.js only polyfills for the esmodules target.)
        
      	-  (undefined)
        
      	-  (undefined)
        
      	-  (undefined)
        
      	-  (undefined)
        
      	-  (undefined)
        
      	-  (undefined)
        
      	- include was set to ['next-env.d.ts', '.next/types/**/*.ts', '**/*.ts', '**/*.tsx']
        
      	- plugins was updated to add { name: 'next' }
        
      	- exclude was set to ['node_modules']

        
      The following mandatory changes were made to your tsconfig.json:

        
      	- module was set to esnext (for dynamic import() support)
        
      	- esModuleInterop was set to true (requirement for SWC / babel)
        
      	- moduleResolution was set to node (to match webpack resolution)
        
      	- resolveJsonModule was set to true (to match webpack resolution)
        
      	- isolatedModules was set to true (requirement for SWC / Babel)
        
      	- jsx was set to preserve (next.js implements its own optimized jsx transform)
      "
    `)
  })
})
