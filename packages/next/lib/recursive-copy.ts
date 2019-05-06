import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import Sema from 'async-sema'

const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)
const copyFile = promisify(fs.copyFile)

const COPYFILE_EXCL = fs.constants.COPYFILE_EXCL

export async function recursiveCopy(
  source: string,
  dest: string,
  {
    concurrency = 255,
    filter = () => true,
  }: { concurrency?: number; filter?(path: string): boolean } = {},
) {
  const cwdPath = process.cwd()
  const from = path.resolve(cwdPath, source)
  const to = path.resolve(cwdPath, dest)

  const sema = new Sema(concurrency)

  async function _copy(item: string) {
    const target = item.replace(from, to)
    const stats = await stat(item)

    if (!filter(item.replace(from, ''))) {
      return
    }

    await sema.acquire()

    if (stats.isDirectory()) {
      await mkdir(target, { recursive: true })
      const files = await readdir(item)
      await Promise.all(files.map((file) => _copy(path.join(item, file))))
    } else if (stats.isFile()) {
      await copyFile(item, target, COPYFILE_EXCL)
    }

    sema.release()
    return
  }

  await _copy(from)
}
