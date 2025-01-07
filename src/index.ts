import { readFile } from 'node:fs/promises'
import { scanDir } from './scanner'
import { addTestId, parseTsx } from './transformer'
import type { Config, TestIds, TsxFile } from './type'
import { parseTestIds, record } from './recorder'
import { replace } from './replacer'
import { initUsedTestIds } from './used-ids'

export async function generateTestId(config: Config) {
  const { src, output, excludeTags, removeExcludeTags } = config

  // scan
  const files = await scanDir(src)

  // transform
  await initUsedTestIds(output)
  const filesWithCode: Required<TsxFile>[] = await Promise.all(
    files.map(async (file) => {
      const code = await readFile(file.path, 'utf-8')
      const { transformedCode, isTestIdChanged } = addTestId({
        sourceText: code,
        excludeTags,
        removeExcludeTags,
      })
      const fileWithCode = {
        ...file,
        code,
        transformedCode,
      }
      if (isTestIdChanged) {
        await replace(fileWithCode)
      }
      return fileWithCode
    }),
  )

  // record
  const newTestIds: TestIds = {}
  await Promise.all(
    filesWithCode.map(async (file) => {
      newTestIds[file.path] = parseTestIds(parseTsx(file.transformedCode))
    }),
  )
  await record({ path: output, newTestIds, showAddedId: true })
}
