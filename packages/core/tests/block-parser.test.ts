import { describe, expect, test } from '@jest/globals'

import { BlockParser } from '../src/BlockParser'
import { BlockParseError } from '../src/errors'

const parser = new BlockParser()
const perpareForBlockParserExeption = (content: string): string => {
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
    const blocks = parser.parse(content)

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
    const blocks = parser.parse(content)

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

    expect(() => parser.parse(content))
      .toThrowError(new BlockParseError(
        'Undefined tag type \'fooo\'.',
        perpareForBlockParserExeption(content),
        1,
      ))
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

    const blocks = parser.parse(content)

    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toMatchObject({ fooo: 'customname' })
  })

  test('should report empty block', () => {
    const content = `
    /**
     */
    `

    expect(() => parser.parse(content)).toThrowError(new BlockParseError('Empty block.', perpareForBlockParserExeption(content), 1))
  })

  test('should report invalid location', () => {
    const content = `
    /**
     * @section headline Headline
     */
    `

    expect(() => parser.parse(content))
      .toThrowError(new BlockParseError(
        'Missing block location. Don\'t know where to place this block, please use @location, @page or @section + @page.',
        perpareForBlockParserExeption(content),
        1,
      ))
  })
})
