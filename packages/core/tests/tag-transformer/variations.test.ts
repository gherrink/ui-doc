import { describe, expect, it } from 'vitest'

import type { Block } from '../../src/Block.types'
import variations, {
  matchesVariationPattern,
  parseVariationPatterns,
} from '../../src/tag-transformers/variations'

describe('variations tag transformer', () => {
  describe('parseVariationPatterns', () => {
    it('should return wildcard for empty value', () => {
      const result = parseVariationPatterns('')
      expect(result).toEqual({ include: ['*'], exclude: [] })
    })

    it('should return wildcard for whitespace-only value', () => {
      const result = parseVariationPatterns('   ')
      expect(result).toEqual({ include: ['*'], exclude: [] })
    })

    it('should parse single pattern', () => {
      const result = parseVariationPatterns('bg')
      expect(result).toEqual({ include: ['bg'], exclude: [] })
    })

    it('should parse multiple patterns', () => {
      const result = parseVariationPatterns('bg, theme')
      expect(result).toEqual({ include: ['bg', 'theme'], exclude: [] })
    })

    it('should parse exact keys', () => {
      const result = parseVariationPatterns('bg.light, theme.primary')
      expect(result).toEqual({ include: ['bg.light', 'theme.primary'], exclude: [] })
    })

    it('should parse exclude patterns', () => {
      const result = parseVariationPatterns('bg, -bg.dark')
      expect(result).toEqual({ include: ['bg'], exclude: ['bg.dark'] })
    })

    it('should default to wildcard when only excludes', () => {
      const result = parseVariationPatterns('-bg.dark, -theme.muted')
      expect(result).toEqual({ include: ['*'], exclude: ['bg.dark', 'theme.muted'] })
    })

    it('should parse wildcard with excludes', () => {
      const result = parseVariationPatterns('*, -bg.dark')
      expect(result).toEqual({ include: ['*'], exclude: ['bg.dark'] })
    })

    it('should lowercase all patterns', () => {
      const result = parseVariationPatterns('BG, Theme.Primary, -BG.Dark')
      expect(result).toEqual({ include: ['bg', 'theme.primary'], exclude: ['bg.dark'] })
    })
  })

  describe('matchesVariationPattern', () => {
    it('should match wildcard to any variation', () => {
      expect(matchesVariationPattern('*', 'bg.light')).toBe(true)
      expect(matchesVariationPattern('*', 'theme.primary')).toBe(true)
      expect(matchesVariationPattern('*', 'anything')).toBe(true)
    })

    it('should match exact key', () => {
      expect(matchesVariationPattern('bg.light', 'bg.light')).toBe(true)
      expect(matchesVariationPattern('bg.light', 'bg.dark')).toBe(false)
    })

    it('should match group prefix', () => {
      expect(matchesVariationPattern('bg', 'bg.light')).toBe(true)
      expect(matchesVariationPattern('bg', 'bg.dark')).toBe(true)
      expect(matchesVariationPattern('bg', 'bg.subtle.warm')).toBe(true)
    })

    it('should not match partial prefix', () => {
      expect(matchesVariationPattern('bg', 'background.light')).toBe(false)
      expect(matchesVariationPattern('bg', 'bglight')).toBe(false)
    })

    it('should match nested groups', () => {
      expect(matchesVariationPattern('bg.subtle', 'bg.subtle.warm')).toBe(true)
      expect(matchesVariationPattern('bg.subtle', 'bg.subtle.cool')).toBe(true)
      expect(matchesVariationPattern('bg.subtle', 'bg.light')).toBe(false)
    })
  })

  describe('transform', () => {
    it('should set variations to wildcard for empty @variations', () => {
      const comment = {
        description: '',
        name: '',
        optional: false,
        problems: [],
        source: [],
        tag: 'variations',
        type: '',
      }
      let block: Partial<Block> = {}

      block = variations.transform(block, comment)

      expect(block.variations).toEqual(['*'])
      expect(block.variationsExclude).toBeUndefined()
    })

    it('should parse patterns from name', () => {
      const comment = {
        description: '',
        name: 'bg',
        optional: false,
        problems: [],
        source: [],
        tag: 'variations',
        type: '',
      }
      let block: Partial<Block> = {}

      block = variations.transform(block, comment)

      expect(block.variations).toEqual(['bg'])
    })

    it('should parse patterns from name and description combined', () => {
      const comment = {
        description: 'theme.primary',
        name: 'bg,',
        optional: false,
        problems: [],
        source: [],
        tag: 'variations',
        type: '',
      }
      let block: Partial<Block> = {}

      block = variations.transform(block, comment)

      expect(block.variations).toEqual(['bg', 'theme.primary'])
    })

    it('should set variationsExclude when excludes present', () => {
      const comment = {
        description: '-bg.dark',
        name: 'bg,',
        optional: false,
        problems: [],
        source: [],
        tag: 'variations',
        type: '',
      }
      let block: Partial<Block> = {}

      block = variations.transform(block, comment)

      expect(block.variations).toEqual(['bg'])
      expect(block.variationsExclude).toEqual(['bg.dark'])
    })
  })
})
