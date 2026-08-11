import { describe, expect, it } from 'vitest'

import { BlockParseError, TagTransformerError } from '../src/errors'
import { ColorParseError } from '../src/errors/ColorParseError'
import { CSSParseError } from '../src/errors/CSSParseError'

describe('blockParseError', () => {
  describe('constructor', () => {
    it('should create error with all required properties', () => {
      const error = new BlockParseError({
        message: 'Unexpected token',
        code: 'const x = ;',
        line: 42,
        column: 10,
        source: 'example.ts',
      })

      expect(error.name).toBe('BlockParseError')
      expect(error.message).toBe('Unexpected token')
      expect(error.code).toBe('const x = ;')
      expect(error.line).toBe(42)
      expect(error.column).toBe(10)
      expect(error.source).toBe('example.ts')
      expect(error.stack).toBeDefined()
    })

    it('should format stack trace with single line code', () => {
      const error = new BlockParseError({
        message: 'Parse failed',
        code: 'simple code',
        line: 1,
        column: 5,
        source: 'test.js',
      })

      expect(error.stack).toContain('BlockParseError: Parse failed')
      expect(error.stack).toContain('in test.js:1')
      expect(error.stack).toContain('simple code')
    })

    it('should format stack trace with multiline code indented', () => {
      const error = new BlockParseError({
        message: 'Multiline error',
        code: 'line1\nline2\nline3',
        line: 10,
        column: 3,
        source: 'multi.ts',
      })

      expect(error.stack).toContain('BlockParseError: Multiline error')
      expect(error.stack).toContain('in multi.ts:10')
      expect(error.stack).toContain('    line1')
      expect(error.stack).toContain('    line2')
      expect(error.stack).toContain('    line3')
    })

    it('should handle empty code string', () => {
      const error = new BlockParseError({
        message: 'Empty code',
        code: '',
        line: 1,
        column: 1,
        source: 'empty.js',
      })

      expect(error.code).toBe('')
      expect(error.stack).toContain('BlockParseError: Empty code')
      expect(error.stack).toContain('in empty.js:1')
    })
  })

  describe('error throwing', () => {
    it('should be throwable and caught as SyntaxError and BlockParseError', () => {
      const throwError = (): never => {
        throw new BlockParseError({
          message: 'Test error',
          code: 'bad code',
          line: 1,
          column: 1,
          source: 'test.js',
        })
      }

      expect(throwError).toThrow(BlockParseError)
      expect(throwError).toThrow(SyntaxError)

      try {
        throwError()
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError)
        expect(error).toBeInstanceOf(BlockParseError)
      }
    })
  })
})

describe('cSSParseError', () => {
  describe('constructor', () => {
    it('should create basic CSS parse error', () => {
      const error = new CSSParseError('Invalid CSS syntax')

      expect(error.name).toBe('CSSParseError')
      expect(error.message).toBe('Invalid CSS syntax')
    })

    it('should handle empty message', () => {
      const error = new CSSParseError('')

      expect(error.name).toBe('CSSParseError')
      expect(error.message).toBe('')
    })
  })

  describe('error throwing', () => {
    it('should be throwable and caught as Error and CSSParseError', () => {
      const throwError = (): never => {
        throw new CSSParseError('CSS error')
      }

      expect(throwError).toThrow(CSSParseError)
      expect(throwError).toThrow(Error)

      try {
        throwError()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toBeInstanceOf(CSSParseError)
      }
    })
  })
})

describe('colorParseError', () => {
  describe('constructor', () => {
    it('should create error with formatted message for invalid color', () => {
      const error = new ColorParseError('invalid-color')

      expect(error.name).toBe('ColorParseError')
      expect(error.message).toBe('Could not parse color value "invalid-color".')
    })

    it('should handle empty color string', () => {
      const error = new ColorParseError('')

      expect(error.name).toBe('ColorParseError')
      expect(error.message).toBe('Could not parse color value "".')
    })
  })

  describe('inheritance chain', () => {
    it('should be instanceof Error, CSSParseError, and ColorParseError', () => {
      const error = new ColorParseError('bad-color')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(CSSParseError)
      expect(error).toBeInstanceOf(ColorParseError)
    })
  })

  describe('error throwing', () => {
    it('should be throwable and caught', () => {
      const throwError = (): never => {
        throw new ColorParseError('rgb(999, 999, 999)')
      }

      expect(throwError).toThrow(ColorParseError)
      expect(throwError).toThrow(CSSParseError)
      expect(throwError).toThrow(Error)

      try {
        throwError()
      } catch (error) {
        expect(error).toBeInstanceOf(ColorParseError)
        expect(error).toBeInstanceOf(CSSParseError)
        expect(error).toBeInstanceOf(Error)
      }
    })
  })
})

describe('tagTransformerError', () => {
  describe('constructor', () => {
    it('should create error with tag only', () => {
      const error = new TagTransformerError('missing value', 'example')

      expect(error.name).toBe('TagTransformerError')
      expect(error.message).toBe("Problem with '@example' - missing value")
      expect(error.tag).toBe('example')
      expect(error.line).toBeUndefined()
      expect(error.column).toBeUndefined()
    })

    it('should create error with tag and line number', () => {
      const error = new TagTransformerError('invalid format', 'param', { line: 15 })

      expect(error.name).toBe('TagTransformerError')
      expect(error.message).toBe("Problem with '@param' - invalid format")
      expect(error.tag).toBe('param')
      expect(error.line).toBe(15)
      expect(error.column).toBeUndefined()
    })

    it('should create error with tag, line, and column', () => {
      const error = new TagTransformerError('syntax error', 'returns', {
        line: 20,
        column: 8,
      })

      expect(error.name).toBe('TagTransformerError')
      expect(error.message).toBe("Problem with '@returns' - syntax error")
      expect(error.tag).toBe('returns')
      expect(error.line).toBe(20)
      expect(error.column).toBe(8)
    })

    it('should handle empty message', () => {
      const error = new TagTransformerError('', 'test')

      expect(error.message).toBe("Problem with '@test' - ")
    })

    it('should handle zero line and column values', () => {
      const error = new TagTransformerError('error at start', 'type', {
        line: 0,
        column: 0,
      })

      expect(error.line).toBe(0)
      expect(error.column).toBe(0)
    })
  })

  describe('error throwing', () => {
    it('should be throwable and caught', () => {
      const throwError = (): never => {
        throw new TagTransformerError('test error', 'custom', { line: 5 })
      }

      expect(throwError).toThrow(TagTransformerError)
      expect(throwError).toThrow(Error)

      try {
        throwError()
      } catch (error) {
        expect(error).toBeInstanceOf(TagTransformerError)
        expect(error).toBeInstanceOf(Error)
      }
    })
  })
})
