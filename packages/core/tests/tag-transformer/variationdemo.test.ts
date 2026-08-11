import { describe, expect, it } from 'vitest'

import type { Block } from '../../src/Block.types'
import variationdemo, { parseComponentPatterns } from '../../src/tag-transformers/variationdemo'

describe('variationdemo tag transformer', () => {
  describe('parseComponentPatterns', () => {
    it('should return wildcard for empty value', () => {
      const result = parseComponentPatterns('')
      expect(result).toEqual({ include: ['*'], exclude: [], explicitMode: false })
    })

    it('should return wildcard for whitespace-only value', () => {
      const result = parseComponentPatterns('   ')
      expect(result).toEqual({ include: ['*'], exclude: [], explicitMode: false })
    })

    it('should parse exclusions in auto-discover mode', () => {
      const result = parseComponentPatterns('-components.button.white')
      expect(result).toEqual({
        include: ['*'],
        exclude: ['components.button.white'],
        explicitMode: false,
      })
    })

    it('should parse multiple exclusions in auto-discover mode', () => {
      const result = parseComponentPatterns('-components.button.white, -components.input')
      expect(result).toEqual({
        include: ['*'],
        exclude: ['components.button.white', 'components.input'],
        explicitMode: false,
      })
    })

    it('should parse explicit includes', () => {
      const result = parseComponentPatterns('+components.button.black')
      expect(result).toEqual({
        include: ['components.button.black'],
        exclude: [],
        explicitMode: true,
      })
    })

    it('should parse multiple explicit includes', () => {
      const result = parseComponentPatterns('+components.button.black, +components.input')
      expect(result).toEqual({
        include: ['components.button.black', 'components.input'],
        exclude: [],
        explicitMode: true,
      })
    })

    it('should ignore exclusions in explicit mode', () => {
      const result = parseComponentPatterns('+components.button.black, -components.input')
      expect(result).toEqual({
        include: ['components.button.black'],
        exclude: [],
        explicitMode: true,
      })
    })

    it('should lowercase all patterns', () => {
      const result = parseComponentPatterns('+Components.Button, -Components.Input')
      expect(result).toEqual({
        include: ['components.button'],
        exclude: [],
        explicitMode: true,
      })
    })
  })

  describe('transform', () => {
    it('should set variationdemo to variation key', () => {
      const comment = {
        description: '',
        name: 'bg.black',
        optional: false,
        problems: [],
        source: [],
        tag: 'variationdemo',
        type: '',
      }
      let block: Partial<Block> = {}

      block = variationdemo.transform(block, comment)

      expect(block.variationdemo).toBe('bg.black')
      expect(block.variationdemoInclude).toEqual(['*'])
      expect(block.variationdemoExclude).toBeUndefined()
    })

    it('should lowercase the variation key', () => {
      const comment = {
        description: '',
        name: 'BG.Black',
        optional: false,
        problems: [],
        source: [],
        tag: 'variationdemo',
        type: '',
      }
      let block: Partial<Block> = {}

      block = variationdemo.transform(block, comment)

      expect(block.variationdemo).toBe('bg.black')
    })

    it('should throw error when variation key is missing', () => {
      const comment = {
        description: '',
        name: '',
        optional: false,
        problems: [],
        source: [],
        tag: 'variationdemo',
        type: '',
      }
      const block: Partial<Block> = {}

      expect(() => {
        variationdemo.transform(block, comment)
      }).toThrowError('Missing variation key')
    })

    it('should parse component exclusions from description', () => {
      const comment = {
        description: '-components.button.white',
        name: 'bg.black',
        optional: false,
        problems: [],
        source: [],
        tag: 'variationdemo',
        type: '',
      }
      let block: Partial<Block> = {}

      block = variationdemo.transform(block, comment)

      expect(block.variationdemo).toBe('bg.black')
      expect(block.variationdemoInclude).toEqual(['*'])
      expect(block.variationdemoExclude).toEqual(['components.button.white'])
    })

    it('should parse explicit includes from description', () => {
      const comment = {
        description: '+components.button.black, +components.input',
        name: 'bg.black',
        optional: false,
        problems: [],
        source: [],
        tag: 'variationdemo',
        type: '',
      }
      let block: Partial<Block> = {}

      block = variationdemo.transform(block, comment)

      expect(block.variationdemo).toBe('bg.black')
      expect(block.variationdemoInclude).toEqual(['components.button.black', 'components.input'])
      expect(block.variationdemoExclude).toBeUndefined()
    })

    it('should combine type and description for filters', () => {
      const comment = {
        description: '+components.input',
        name: 'bg.black',
        optional: false,
        problems: [],
        source: [],
        tag: 'variationdemo',
        type: '+components.button,',
      }
      let block: Partial<Block> = {}

      block = variationdemo.transform(block, comment)

      expect(block.variationdemoInclude).toEqual(['components.button', 'components.input'])
    })

    it('should handle simple variation key', () => {
      const comment = {
        description: '',
        name: 'dark',
        optional: false,
        problems: [],
        source: [],
        tag: 'variationdemo',
        type: '',
      }
      let block: Partial<Block> = {}

      block = variationdemo.transform(block, comment)

      expect(block.variationdemo).toBe('dark')
    })
  })
})
