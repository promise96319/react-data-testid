import { readFile, stat, writeFile } from 'node:fs/promises'
import { cwd } from 'node:process'
import { resolve } from 'node:path'
import ts from 'typescript'
import type { Node } from 'typescript'
import { green, red } from 'kolorist'
import { TestIdKey } from './const'
import { isPossibleAutoTestId } from './util'
import log from './logger'
import type { FilePath, TestId, TestIdDescription, TestIds } from './type'

export interface TestIdInfo {
  id: TestId
  path: FilePath
  description: TestIdDescription
}

export async function saveTestIds(path: string, ids: TestIds) {
  const absolutePath = resolve(cwd(), path)

  try {
    await writeFile(absolutePath, JSON.stringify(ids, null, 2), 'utf-8')
  }
  catch (e) {
    log.error('save testid file failed: ', e)
  }
}

export async function readTestIds(path: string): Promise<TestIds> {
  const absolutePath = resolve(cwd(), path)

  try {
    if (!(await stat(absolutePath)).isFile()) {
      return {}
    }
    return JSON.parse(await readFile(absolutePath, 'utf8'))
  }
  catch (e) {
    log.error('read testid file failed: ', e)
    return {}
  }
}

export function parseTestIds(
  ast: ts.SourceFile,
): Record<TestId, TestIdDescription> {
  const idMaps: Record<string, string> = {}

  const visitor = (node: Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const attributes = node.attributes.properties
      attributes.some((property) => {
        if (
          ts.isJsxAttribute(property)
          && property.name.getText() === TestIdKey
        ) {
          const value = property.initializer
          if (value && ts.isStringLiteral(value)) {
            const id = value.text
            if (isPossibleAutoTestId(id)) {
              idMaps[id] = node.getText()
            }

            return true
          }

          return false
        }

        return false
      })
    }

    ts.forEachChild(node, visitor)
  }

  ts.forEachChild(ast, visitor)
  return idMaps
}

export function normalizeTestIds(testids: TestIds) {
  const testIdMap: Record<TestId, TestIdInfo> = {}
  for (const [filePath, testIdInFile] of Object.entries(testids)) {
    for (const [testId, description] of Object.entries(testIdInFile)) {
      testIdMap[testId] = {
        id: testId,
        description,
        path: filePath,
      }
    }
  }
  return testIdMap
}

export function diff(
  newTestIds: TestIds,
  oldTestIds: TestIds,
): { removedInfo: TestIds, addedInfo: TestIds } {
  const newIdInfo = normalizeTestIds(newTestIds)
  const oldIdInfo = normalizeTestIds(oldTestIds)

  const removedIds: Record<TestId, boolean> = {}
  Object.keys(oldIdInfo).forEach((oldId) => {
    if (!newIdInfo[oldId]) {
      removedIds[oldId] = true
    }
  })

  const removedInfo: TestIds = {}
  for (const [filePath, testIdInFile] of Object.entries(oldTestIds)) {
    for (const [testId, description] of Object.entries(testIdInFile)) {
      if (removedIds[testId]) {
        if (!removedInfo[filePath]) {
          removedInfo[filePath] = {}
        }
        removedInfo[filePath][testId] = description
      }
    }
  }

  const addedIds: Record<TestId, boolean> = {}
  Object.keys(newIdInfo).forEach((newId) => {
    if (!oldIdInfo[newId]) {
      addedIds[newId] = true
    }
  })

  const addedInfo: TestIds = {}
  for (const [filePath, testIdInFile] of Object.entries(newTestIds)) {
    for (const [testId, description] of Object.entries(testIdInFile)) {
      if (addedIds[testId]) {
        if (!addedInfo[filePath]) {
          addedInfo[filePath] = {}
        }
        addedInfo[filePath][testId] = description
      }
    }
  }

  return { removedInfo, addedInfo }
}

export function printDiffInfo(testids: TestIds, message: string, color: any) {
  if (!Object.keys(testids).length) {
    return
  }

  for (const [filePath, testIdInFile] of Object.entries(testids)) {
    log(color(filePath))
    for (const [, description] of Object.entries(testIdInFile)) {
      log(`  - [${color(message)}]: ${description}`)
    }
  }
}

export async function record(config: {
  path: string
  newTestIds: TestIds
  showAddedId?: boolean
}) {
  const { path, newTestIds, showAddedId = true } = config
  const oldTestIds: TestIds = await readTestIds(path)
  const { removedInfo, addedInfo } = diff(newTestIds, oldTestIds)

  printDiffInfo(removedInfo, 'Removed', red)

  if (showAddedId) {
    // eslint-disable-next-line no-console
    console.log(' ')
    printDiffInfo(addedInfo, 'Added', green)
  }

  if (!Object.keys(removedInfo).length && !Object.keys(addedInfo).length) {
    log(green('✅ testid has not changed.'))
  }

  await saveTestIds(path, newTestIds)
}
