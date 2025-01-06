import { cwd } from 'node:process'
import { basename } from 'node:path'
import fg from 'fast-glob'
import type { TsxFile } from './type'
import log from './logger'

export async function scanDir(dir: string, files: TsxFile[] = []) {
  const filePaths = await fg.async(dir, {
    cwd: cwd(),
    absolute: false,
    onlyFiles: true,
    baseNameMatch: true,
  })

  await Promise.all(filePaths.map(async (filePath) => {
    if (/\.tsx$/.test(filePath)) {
      files.push({
        path: filePath,
        name: basename(filePath),
      })
    }
  }))

  log(`${files.length} files scanned.`)

  return files
}
