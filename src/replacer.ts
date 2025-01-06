import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import * as prettier from 'prettier'
import type { TsxFile } from './type'

export async function lint(code: string) {
  try {
    const config = await prettier.resolveConfig(resolve(cwd(), '.prettierrc'))
    return prettier.format(code, { ...config, parser: 'typescript' })
  }
  catch {
    return code
  }
}

export async function replace(file: Required<TsxFile>) {
  const lintedCode = await lint(file.transformedCode)
  await writeFile(resolve(cwd(), file.path), lintedCode, 'utf-8')
}
