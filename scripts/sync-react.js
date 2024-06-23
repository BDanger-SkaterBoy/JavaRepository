// @ts-check

const path = require('path')
const fsp = require('fs/promises')
const execa = require('execa')

/** @type {any} */
const fetch = require('node-fetch')

// Use this script to update Next's vendored copy of React and related packages:
//
// Basic usage (defaults to most recent React canary version):
//   pnpm run sync-react
//
// Update package.json but skip installing the dependencies automatically:
//   pnpm run sync-react --no-install

async function sync(channel = 'next') {
  const noInstall = readBoolArg(process.argv, 'no-install')
  const useExperimental = channel === 'experimental'
  let newVersionStr = readStringArg(process.argv, 'version')
  if (newVersionStr === null) {
    const { stdout, stderr } = await execa(
      'npm',
      [
        'view',
        useExperimental ? 'react@experimental' : 'react@next',
        'version',
      ],
      {
        // Avoid "Usage Error: This project is configured to use pnpm".
        cwd: '/tmp',
      }
    )
    if (stderr) {
      console.error(stderr)
      throw new Error('Failed to read latest React canary version from npm.')
    }
    newVersionStr = stdout.trim()
  }

  const newVersionInfo = extractInfoFromReactVersion(newVersionStr)
  if (!newVersionInfo) {
    throw new Error(
      `New react version does not match expected format: ${newVersionStr}

Choose a React canary version from npm: https://www.npmjs.com/package/react?activeTab=versions

Or, run this command with no arguments to use the most recently published version.
`
    )
  }
  newVersionInfo.releaseLabel = channel

  const cwd = process.cwd()
  const pkgJson = JSON.parse(
    await fsp.readFile(path.join(cwd, 'package.json'), 'utf-8')
  )
  const devDependencies = pkgJson.devDependencies
  const resolutions = pkgJson.resolutions
  const baseVersionStr = devDependencies[
    useExperimental ? 'react-experimental-builtin' : 'react-builtin'
  ].replace(/^npm:react@/, '')

  const baseVersionInfo = extractInfoFromReactVersion(baseVersionStr)
  if (!baseVersionInfo) {
    throw new Error(
      'Base react version does not match expected format: ' + baseVersionStr
    )
  }

  const {
    sha: newSha,
    releaseLabel: newReleaseLabel,
    dateString: newDateString,
  } = newVersionInfo
  const {
    sha: baseSha,
    releaseLabel: baseReleaseLabel,
    dateString: baseDateString,
  } = baseVersionInfo

  console.log(`Updating "react@${channel}" to ${newSha}...\n`)
  if (newSha === baseSha) {
    console.log('Already up to date.')
    return
  }

  for (const [dep, version] of Object.entries(devDependencies)) {
    if (version.endsWith(`${baseReleaseLabel}-${baseSha}-${baseDateString}`)) {
      devDependencies[dep] = version.replace(
        `${baseReleaseLabel}-${baseSha}-${baseDateString}`,
        `${newReleaseLabel}-${newSha}-${newDateString}`
      )
    }
  }
  for (const [dep, version] of Object.entries(resolutions)) {
    if (version.endsWith(`${baseReleaseLabel}-${baseSha}-${baseDateString}`)) {
      resolutions[dep] = version.replace(
        `${baseReleaseLabel}-${baseSha}-${baseDateString}`,
        `${newReleaseLabel}-${newSha}-${newDateString}`
      )
    }
  }
  await fsp.writeFile(
    path.join(cwd, 'package.json'),
    JSON.stringify(pkgJson, null, 2) +
      // Prettier would add a newline anyway so do it manually to skip the additional `pnpm prettier-write`
      '\n'
  )
  console.log('Successfully updated React dependencies in package.json.\n')

  // Install the updated dependencies and build the vendored React files.
  if (noInstall) {
    console.log('Skipping install step because --no-install flag was passed.\n')
  } else {
    console.log('Installing dependencies...\n')

    const installSubprocess = execa('pnpm', ['install'])
    if (installSubprocess.stdout) {
      installSubprocess.stdout.pipe(process.stdout)
    }
    try {
      await installSubprocess
    } catch (error) {
      console.error(error)
      throw new Error('Failed to install updated dependencies.')
    }

    console.log('Building vendored React files...\n')
    const nccSubprocess = execa('pnpm', ['ncc-compiled'], {
      cwd: path.join(cwd, 'packages', 'next'),
    })
    if (nccSubprocess.stdout) {
      nccSubprocess.stdout.pipe(process.stdout)
    }
    try {
      await nccSubprocess
    } catch (error) {
      console.error(error)
      throw new Error('Failed to run ncc.')
    }

    // Print extra newline after ncc output
    console.log()
  }

  // Fetch the changelog from GitHub and print it to the console.
  try {
    const changelog = await getChangelogFromGitHub(baseSha, newSha)
    if (changelog === null) {
      console.log(
        `GitHub reported no changes between ${baseSha} and ${newSha}.`
      )
    } else {
      console.log(
        `<details>\n<summary>React upstream changes</summary>\n\n${changelog}\n\n</details>`
      )
    }
  } catch (error) {
    console.error(error)
    console.log(
      '\nFailed to fetch changelog from GitHub. Changes were applied, anyway.\n'
    )
  }

  if (noInstall) {
    console.log(
      `
To finish upgrading, complete the following steps:

- Install the updated dependencies: pnpm install
- Build the vendored React files: (inside packages/next dir) pnpm ncc-compiled

Or run this command again without the --no-install flag to do both automatically.
    `
    )
  }

  console.log(
    `Successfully updated React from ${baseSha} to ${newSha}.\n` +
      `Don't forget to find & replace all references to the React version '${baseVersionStr}' with '${newVersionStr}':\n` +
      `-${baseVersionStr}\n` +
      `+${newVersionStr}\n`
  )
}

function readBoolArg(argv, argName) {
  return argv.indexOf('--' + argName) !== -1
}

function readStringArg(argv, argName) {
  const argIndex = argv.indexOf('--' + argName)
  return argIndex === -1 ? null : argv[argIndex + 1]
}

function extractInfoFromReactVersion(reactVersion) {
  const match = reactVersion.match(
    /(?<semverVersion>.*)-(?<releaseLabel>.*)-(?<sha>.*)-(?<dateString>.*)$/
  )
  return match ? match.groups : null
}

async function getChangelogFromGitHub(baseSha, newSha) {
  const pageSize = 50
  let changelog = []
  for (let currentPage = 1; ; currentPage++) {
    const url = `https://api.github.com/repos/facebook/react/compare/${baseSha}...${newSha}?per_page=${pageSize}&page=${currentPage}`
    const headers = {}
    // GITHUB_TOKEN is optional but helps in case of rate limiting during development.
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
    }
    const response = await fetch(url, {
      headers,
    })
    if (!response.ok) {
      throw new Error(
        `${response.url}: Failed to fetch commit log from GitHub:\n${response.statusText}\n${await response.text()}`
      )
    }
    const data = await response.json()

    const { commits } = data
    for (const { commit, sha } of commits) {
      const title = commit.message.split('\n')[0] || ''
      const match =
        // The "title" looks like "[Fiber][Float] preinitialized stylesheets should support integrity option (#26881)"
        /\(#([0-9]+)\)$/.exec(title) ??
        // or contains "Pull Request resolved: https://github.com/facebook/react/pull/12345" in the body if merged via ghstack (e.g. https://github.com/facebook/react/commit/0a0a5c02f138b37e93d5d93341b494d0f5d52373)
        /^Pull Request resolved: https:\/\/github.com\/facebook\/react\/pull\/([0-9]+)$/m.exec(
          commit.message
        )
      const prNum = match ? match[1] : ''
      if (prNum) {
        changelog.push(`- https://github.com/facebook/react/pull/${prNum}`)
      } else {
        changelog.push(
          `- [${commit.message.split('\n')[0]} facebook/react@${sha.slice(0, 9)}](https://github.com/facebook/react/commit/${sha}) (${commit.author.name})`
        )
      }
    }

    if (commits.length < pageSize) {
      // If the number of commits is less than the page size, we've reached
      // the end. Otherwise we'll keep fetching until we run out.
      break
    }
  }

  changelog.reverse()

  return changelog.length > 0 ? changelog.join('\n') : null
}

sync('experimental')
  .then(() => sync('rc'))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
