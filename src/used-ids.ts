import { readTestIds } from './recorder'

const usedTestIds: Record<string, boolean> = {}

export async function initUsedTestIds(path: string) {
  const testIds = await readTestIds(path)
  const idMaps: Record<string, boolean> = {}

  for (const [, ids] of Object.entries(testIds)) {
    for (const id in ids) {
      idMaps[id] = true
    }
  }

  return idMaps
}

export function setUsedTestId(id: string) {
  usedTestIds[id] = true
}

export function getUsedTestIds() {
  return usedTestIds
}

export function isTestIdUsed(id: string) {
  return usedTestIds[id]
}
