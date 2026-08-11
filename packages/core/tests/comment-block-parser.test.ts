import { describe, expect, it, vi } from 'vitest'

import { CommentBlockParser } from '../src/CommentBlockParser'
import type { DescriptionParser } from '../src/DescriptionParser.types'
import { BlockParseError, TagTransformerError } from '../src/errors'

class TestDescriptionParser implements DescriptionParser {
  public parse(content: string): string {
    return content
  }
}

const parser = new CommentBlockParser(new TestDescriptionParser())
function prepareForBlockParserException(content: string): string {
  return content.replace(/^\n+|\s+$/g, '')
}

describe('commentBlockParser', () => {
  it('should parse comment', () => {
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

  it('should parse comments', () => {
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

  it('should report non existing tags', () => {
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
        column: 0,
        line: 5,
        message: "Undefined tag type 'fooo'.",
        source: 'inline:test',
      }),
    )
  })

  it('should run custom tag transformer', () => {
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

  it('should report empty block', () => {
    const content = `
    /**
     */
    `

    expect(() => parser.parse({ content, identifier: 'inline:test' })).toThrowError(
      new BlockParseError({
        code: prepareForBlockParserException(content),
        column: 0,
        line: 2,
        message: 'Empty block.',
        source: 'inline:test',
      }),
    )
  })

  it('should report invalid location', () => {
    const content = `
    /**
     * @section headline Headline
     */
    `

    expect(() => parser.parse({ content, identifier: 'inline:test' })).toThrowError(
      new BlockParseError({
        code: prepareForBlockParserException(content),
        column: 0,
        line: 2,
        message:
          "Missing block location. Don't know where to place this block, please use @location, @page or @section + @page.",
        source: 'inline:test',
      }),
    )
  })

  it('should parse block with @location tag', () => {
    const content = `
    /**
     * @location page.section
     */
    `
    const blocks = parser.parse({ content, identifier: 'inline:test' })

    expect(blocks).toHaveLength(1)
    expect(blocks[0].key).toBe('page.section')
  })

  it('should parse block with only @page tag', () => {
    const content = `
    /**
     * @page mypage
     */
    `
    const blocks = parser.parse({ content, identifier: 'inline:test' })

    expect(blocks).toHaveLength(1)
    expect(blocks[0].key).toBe('mypage')
  })

  it('should wrap TagTransformerError as BlockParseError', () => {
    const errorParser = new CommentBlockParser(new TestDescriptionParser())

    errorParser.registerTagTransformer({
      name: 'throwingTag',
      transform: () => {
        throw new TagTransformerError('Custom error message', 'throwingTag')
      },
    })

    const content = `
    /**
     * @page foo
     * @throwingTag
     */
    `

    expect(() => errorParser.parse({ content, identifier: 'inline:test' })).toThrowError(
      BlockParseError,
    )
    expect(() => errorParser.parse({ content, identifier: 'inline:test' })).toThrowError(
      /Custom error message/,
    )
  })

  it('should propagate non-TagTransformerError exceptions', () => {
    const errorParser = new CommentBlockParser(new TestDescriptionParser())

    errorParser.registerTagTransformer({
      name: 'genericError',
      transform: () => {
        throw new Error('Generic error')
      },
    })

    const content = `
    /**
     * @page foo
     * @genericError
     */
    `

    expect(() => errorParser.parse({ content, identifier: 'inline:test' })).toThrow('Generic error')
  })

  it('should emit parsed event for each block', () => {
    const listener = vi.fn()

    parser.on('parsed', listener)

    const content = `
    /**
     * @page foo
     */
    /**
     * @page bar
     */
    `
    parser.parse({ content, identifier: 'inline:test' })

    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenNthCalledWith(1, expect.objectContaining({ key: 'foo' }))
    expect(listener).toHaveBeenNthCalledWith(2, expect.objectContaining({ key: 'bar' }))
  })

  it('should parse description using description parser', () => {
    const mockDescriptionParser: DescriptionParser = {
      parse: vi.fn().mockReturnValue('<p>Parsed description</p>'),
    }
    const parserWithMock = new CommentBlockParser(mockDescriptionParser)

    const content = `
    /**
     * This is a description
     * @page foo
     */
    `
    const blocks = parserWithMock.parse({ content, identifier: 'inline:test' })

    expect(mockDescriptionParser.parse).toHaveBeenCalledWith('This is a description')
    expect(blocks[0].description).toBe('<p>Parsed description</p>')
  })

  it('should trim whitespace from tag properties', () => {
    const content = `
    /**
     * @page   foo   Title with spaces
     */
    `
    const blocks = parser.parse({ content, identifier: 'inline:test' })

    expect(blocks[0].key).toBe('foo')
  })

  it('should support method chaining for registerTagTransformer', () => {
    const newParser = new CommentBlockParser(new TestDescriptionParser())

    const result = newParser
      .registerTagTransformer({ name: 'custom1', transform: block => block })
      .registerTagTransformer({ name: 'custom2', transform: block => block })

    expect(result).toBe(newParser)
  })
})
