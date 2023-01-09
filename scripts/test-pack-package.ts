const path = require('path')
const fs = require('fs-extra')
const os = require('os')
const execa = require('execa')
const { randomBytes } = require('crypto')

const main = async () => {
  const repoRoot = path.dirname(__dirname)
  const pkgsDir = path.join(repoRoot, 'packages')
  const currentPkgDirname = process.argv[2]

  const getPackedPkgPath = (pkgDirname: string) =>
    path.join(pkgsDir, pkgDirname, `packed-${pkgDirname}.tgz`)
  const getPackageJsonPath = (pkgDirname: string) =>
    path.join(pkgsDir, pkgDirname, `package.json`)

  const allPkgDirnames = await fs.readdir(pkgsDir)
  if (!allPkgDirnames.includes(currentPkgDirname)) {
    throw new Error(`Unknown package '${currentPkgDirname}'`)
  }

  const currentPkgDir = path.join(pkgsDir, currentPkgDirname)

  const tmpPkgPath = path.join(
    os.tmpdir(),
    `${currentPkgDirname}-${randomBytes(32).toString('hex')}`
  )

  const packageJsonPath = getPackageJsonPath(currentPkgDirname)
  const packageJson = await fs.readJson(packageJsonPath)
  const dependencies = packageJson.dependencies

  // @next/swc is devDependency in next, but we want to include it anyway
  if (currentPkgDirname === 'next') {
    dependencies['@next/swc'] = '*'
  }

  // Modify dependencies to point to packed packages
  if (dependencies) {
    await Promise.all(
      allPkgDirnames.map(async (depPkgDirname) => {
        const { name: depPkgName } = await fs.readJson(
          getPackageJsonPath(depPkgDirname)
        )
        if (depPkgName in dependencies) {
          dependencies[depPkgName] = getPackedPkgPath(depPkgDirname)
        }
      })
    )
  }

  // Ensure that we bundle binaries with swc
  if (currentPkgDirname === 'next-swc') {
    packageJson.files = [...packageJson.files, 'native']
    console.log(
      'using swc binaries: ',
      await execa('ls', [path.join(path.dirname(packageJsonPath), 'native')])
    )
  }

  try {
    await fs.copy(currentPkgDir, tmpPkgPath)
    await fs.writeJson(path.join(tmpPkgPath, 'package.json'), packageJson)
    execa.sync('yarn', ['pack', '-f', getPackedPkgPath(currentPkgDirname)], {
      cwd: tmpPkgPath,
    })
  } finally {
    fs.remove(tmpPkgPath).catch()
  }
}

main()
