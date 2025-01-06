import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'
import { parseTsx } from '../src/transformer'
import {
  diff,
  parseTestIds,
  readTestIds,
  record,
  saveTestIds,
} from '../src/recorder'

describe('recorder', () => {
  it('getTestIds', () => {
    const div1 = `const a = <div className="test"></div>`
    expect(parseTestIds(parseTsx(div1))).toMatchInlineSnapshot(`{}`)

    const div2 = 'const a = <div className="test" data-testid="12a45678"></div>'
    expect(parseTestIds(parseTsx(div2))).toMatchInlineSnapshot(`
      {
        "12a45678": "<div className="test" data-testid="12a45678">",
      }
    `)
  })

  it('record/read/save', async () => {
    const filePath = `${cwd()}/test/tmp.testid.json`
    const tsxFilePath = '/test'
    const div = 'const a = <div className="test" data-testid="12a45678"></div>'

    const ids = {
      [tsxFilePath]: parseTestIds(parseTsx(div)),
    }
    expect(ids).toMatchInlineSnapshot(`
      {
        "/test": {
          "12a45678": "<div className="test" data-testid="12a45678">",
        },
      }
    `)

    saveTestIds(filePath, ids)

    expect(await readTestIds(filePath)).toMatchInlineSnapshot(`
      {
        "/test": {
          "12a45678": "<div className="test" data-testid="12a45678">",
        },
      }
    `)

    const newDiv =
      'const a = <div className="test" data-testid="87654321"></div>'
    const newIds = { [tsxFilePath]: parseTestIds(parseTsx(newDiv)) }
    expect(newIds).toMatchInlineSnapshot(`
      {
        "/test": {
          "87654321": "<div className="test" data-testid="87654321">",
        },
      }
    `)

    expect(diff(newIds, ids)).toMatchInlineSnapshot(`
      {
        "addedInfo": {
          "/test": {
            "87654321": "<div className="test" data-testid="87654321">",
          },
        },
        "removedInfo": {
          "/test": {
            "12a45678": "<div className="test" data-testid="12a45678">",
          },
        },
      }
    `)

    await record({
      path: filePath,
      newTestIds: newIds,
      showAddedId: true,
    })

    expect(await readTestIds(filePath)).toMatchInlineSnapshot(`
      {
        "/test": {
          "87654321": "<div className="test" data-testid="87654321">",
        },
      }
    `)
  })
})
