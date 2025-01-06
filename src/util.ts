import { createHash } from 'node:crypto'
import { isTestIdUsed, setUsedTestId } from './used-ids'

export function isTsxFile(path: string) {
  return /\.tsx$/.test(path)
}

export function createTestId(salt: string, random?: boolean, maxLength = 8) {
  const hash = createHash('sha256')
  const str = random ? Date.now() + salt + Math.random() : salt
  hash.update(str)
  return hash.digest('hex').slice(0, maxLength)
}

export function loopCreateTestId(
  salt: string,
  config: {
    random?: boolean
    maxTryTime?: number
    maxLength?: number
  },
) {
  const { random = true, maxTryTime = 10 } = config
  let { maxLength = 8 } = config

  if (maxTryTime <= 0) {
    maxLength += 1
  }

  const id = createTestId(salt, random, maxLength)
  if (isTestIdUsed(id)) {
    return loopCreateTestId(salt, {
      random,
      maxTryTime: maxTryTime - 1,
      maxLength,
    })
  }

  setUsedTestId(id)
  return id
}

export function isPossibleAutoTestId(id: string) {
  return /^[0-9a-f]{8,}$/.test(id)
}
