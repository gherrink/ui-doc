import { describe, expect, it } from 'vitest'

import { TagTransformerError } from '../../src/errors'
import { CSSColor } from '../../src/tag-transformers/nodes/CSSColor'
import { CSSVariable } from '../../src/tag-transformers/nodes/CSSVariable'
import {
  code,
  createTagTransformerError,
  cssColorValue,
  identifier,
  isValidHTML,
  trimDescription,
} from '../../src/tag-transformers/utils'

describe('tag transformer utilities', () => {
  it.each([
    '<div>test</div>',
    '<div>test</div><div>test</div>',
    '<div>test</div><div>test</div><div>test</div>',
    '<div>test</div><div>test</div><div>test</div><div>test</div>',
    '<div class="foo">test</div>',
    '<div class="foo">test</div><div class="foo">test</div>',
    '<p>test</p>',
    '<p>test</p><p>test</p>',
    '<br/>',
    '<br/><br/>',
    '<div>test</div>\n<div>test</div>',
    '<div>\n<div>test</div>\n</div>',
    '<p>Testing</p> <p>Testing</p>',
    '<div>Test<br>Test<div>foo</div><p>bar</p></div>',
    '<!-- test comment --><div>Test</div>',
    '<div>Test <!-- test comment --> </div>',
    '<input type="submit" class="btn" value="Submit button" />',
  ])('should be valid html:\n%s', html => {
    expect(isValidHTML(html)).toBe(true)
  })

  it.each(['<>', '<><>', '<div>foo<p>bar</p>', '<div>\n', '<div>foo</p>', '<div>foo</p></div>'])(
    'should be invalid html:\n%s',
    html => {
      expect(isValidHTML(html)).toBe(false)
    },
  )

  it('should return false for empty string', () => {
    expect(isValidHTML('')).toBe(false)
  })
})

describe('identifier', () => {
  it('should return key and name from spec with name and description', () => {
    const spec = {
      description: 'My Title',
      name: 'MyKey',
      optional: false,
      problems: [],
      source: [],
      tag: 'page',
      type: '',
    }

    const result = identifier(spec)

    expect(result.key).toBe('mykey')
    expect(result.name).toBe('My Title')
  })

  it('should use name as title when no description', () => {
    const spec = {
      description: '',
      name: 'MyKey',
      optional: false,
      problems: [],
      source: [],
      tag: 'page',
      type: '',
    }

    const result = identifier(spec)

    expect(result.key).toBe('mykey')
    expect(result.name).toBe('MyKey')
  })

  it('should throw TagTransformerError when name is missing', () => {
    const spec = {
      description: '',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'page',
      type: '',
    }

    expect(() => identifier(spec)).toThrow(TagTransformerError)
    expect(() => identifier(spec)).toThrow(/Missing key/)
  })
})

describe('code', () => {
  it('should return code object from spec with description', () => {
    const spec = {
      description: '<div>content</div>',
      name: 'Title',
      optional: false,
      problems: [],
      source: [],
      tag: 'code',
      type: 'html',
    }

    const result = code(spec)

    expect(result).toEqual({
      content: '<div>content</div>',
      title: 'Title',
      type: 'html',
    })
  })

  it('should return undefined when no description', () => {
    const spec = {
      description: '',
      name: 'Title',
      optional: false,
      problems: [],
      source: [],
      tag: 'code',
      type: 'html',
    }

    const result = code(spec)

    expect(result).toBeUndefined()
  })

  it('should default type to html when not provided', () => {
    const spec = {
      description: '<div>content</div>',
      name: 'Title',
      optional: false,
      problems: [],
      source: [],
      tag: 'code',
      type: '',
    }

    const result = code(spec)

    expect(result?.type).toBe('html')
  })
})

describe('trimDescription', () => {
  it('should remove leading dash', () => {
    expect(trimDescription('- text')).toBe('text')
  })

  it('should remove leading pipe', () => {
    expect(trimDescription('| text')).toBe('text')
  })

  it('should trim whitespace', () => {
    expect(trimDescription('  text  ')).toBe('text')
  })

  it('should remove leading dash and trim', () => {
    expect(trimDescription('-  text  ')).toBe('text')
  })

  it('should not modify text without leading dash or pipe', () => {
    expect(trimDescription('plain text')).toBe('plain text')
  })
})

describe('createTagTransformerError', () => {
  it('should create error with line number from source', () => {
    const spec = {
      description: '',
      name: '',
      optional: false,
      problems: [],
      source: [{ number: 9, source: '@test', tokens: {} as never }],
      tag: 'test',
      type: '',
    }

    const error = createTagTransformerError('Error message', spec)

    expect(error).toBeInstanceOf(TagTransformerError)
    expect(error.message).toContain('Error message')
    expect(error.tag).toBe('test')
    expect(error.line).toBe(10)
  })

  it('should use line 0 when no source', () => {
    const spec = {
      description: '',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'test',
      type: '',
    }

    const error = createTagTransformerError('Error message', spec)

    expect(error.line).toBe(0)
  })
})

describe('cssColorValue', () => {
  it('should return CSSVariable for variable string', () => {
    const result = cssColorValue('--my-color')

    expect(result).toBeInstanceOf(CSSVariable)
    expect((result as CSSVariable).name).toBe('--my-color')
  })

  it('should return CSSColor for hex color', () => {
    const result = cssColorValue('#ff0000')

    expect(result).toBeInstanceOf(CSSColor)
    expect((result as CSSColor).hex).toBe('#ff0000')
  })

  it('should return CSSColor for rgb color', () => {
    const result = cssColorValue('255 0 0')

    expect(result).toBeInstanceOf(CSSColor)
    expect((result as CSSColor).rgb).toBe('255 0 0')
  })
})
