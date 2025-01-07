import { describe, expect, it } from 'vitest'
import { scanDir } from '../src/scanner'

describe('scanner', () => {
  it('scanDir', async () => {
    const files = await scanDir('./fixtures/**/*.tsx')
    expect(files).toMatchInlineSnapshot(`
      [
        {
          "name": "a.tsx",
          "path": "./fixtures/a.tsx",
        },
        {
          "name": "b.tsx",
          "path": "./fixtures/b.tsx",
        },
      ]
    `)
  })
})
