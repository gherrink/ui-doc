import { describe, expect, test } from '@jest/globals'

import { BlockParser } from '../src/BlockParser'

const parser = new BlockParser()

describe('Parser', () => {
  test('should parse comments', () => {
    const content = `
    /**
     * @page resets
     * @section headline Headlines
     * @example
     * <h1>Headline</h1>
     */
    `
    const blocks = parser.parse(content)

    expect(blocks).toHaveLength(1)
  })
})
