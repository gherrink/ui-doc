import { describe, expect, test } from '@jest/globals'

import { CommentBlockParser } from '../src/BlockParser'
import { BlockParseError } from '../src/errors'
import type { DescriptionParser } from '../src/types'

class TestDescriptionParser implements DescriptionParser {
  public parse(content: string): string {
    return content
  }
}

const parser = new CommentBlockParser(new TestDescriptionParser())
const prepareForBlockParserException = (content: string): string => {
  return content.replace(/^\n+|[\n\s]+$/g, '')
}

describe('BlockParser', () => {
  test('should parse comment', () => {
    const content = `
    /**
     * @page foo
     * @section headline Headlines
     * @example
     * <h1>Headline</h1>
     */
    `
    const blocks = parser.parse({ content, identifier: 'inline:test' })

    expect(blocks).toHaveLength(1)
    expect(blocks[0].key).toBe('foo.headline')
  })

  test('should parse comments', () => {
    const content = `
    /**
     * @page foo
     * @section headline Headlines
     * @example
     * <h1>Headline</h1>
     */

    /**
     * @page bar
     * @section headline Headlines
     * @example
     * <h1>Headline</h1>
     */
    `
    const blocks = parser.parse({ content, identifier: 'inline:test' })

    expect(blocks).toHaveLength(2)

    expect(blocks[0].key).toBe('foo.headline')
    expect(blocks[1].key).toBe('bar.headline')
  })

  test('should report non existing tags', () => {
    const content = `
    /**
     * @page foo
     * @section headline Headlines
     * @fooo
     */
    `

    expect(() => parser.parse({ content, identifier: 'inline:test' })).toThrowError(
      new BlockParseError({
        code: prepareForBlockParserException(content),
        line: 1,
        message: "Undefined tag type 'fooo'.",
        source: 'inline:test',
      }),
    )
  })

  test('should run custom tag transformer', () => {
    const content = `
    /**
     * @page foo
     * @section headline Headlines
     * @fooo customname
     */
    `

    parser.registerTagTransformer({
      name: 'fooo',
      transform: (block, tag) => {
        block.fooo = tag.name

        return block
      },
    })

    const blocks = parser.parse({ content, identifier: 'inline:test' })

    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toMatchObject({ fooo: 'customname' })
  })

  test('should report empty block', () => {
    const content = `
    /**
     */
    `

    expect(() => parser.parse({ content, identifier: 'inline:test' })).toThrowError(
      new BlockParseError({
        code: prepareForBlockParserException(content),
        line: 1,
        message: 'Empty block.',
        source: 'inline:test',
      }),
    )
  })

  test('should report invalid location', () => {
    const content = `
    /**
     * @section headline Headline
     */
    `

    expect(() => parser.parse({ content, identifier: 'inline:test' })).toThrowError(
      new BlockParseError({
        code: prepareForBlockParserException(content),
        line: 1,
        message:
          "Missing block location. Don't know where to place this block, please use @location, @page or @section + @page.",
        source: 'inline:test',
      }),
    )
  })
})
