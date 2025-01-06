import { describe, expect, it } from 'vitest'
import { scanDir } from '../src/scanner'

describe('scanner', () => {
  it('scanDir', async () => {
    const files = await scanDir('./example/**/*.tsx')
    expect(files).toMatchInlineSnapshot(`
      [
        {
          "name": "home.page.tsx",
          "path": "./example/pages/home/home.page.tsx",
        },
      ]
    `)
  })
})
