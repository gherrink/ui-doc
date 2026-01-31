import type { Block } from '../../src/Block.types'

import { describe, expect, it } from 'vitest'
import variation from '../../src/tag-transformers/variation'

describe('variation tag transformer', () => {
  it('should transform variation with key and wrapper only', () => {
    const comment = {
      description: '<div class="bg-light">{{content}}</div>',
      name: 'bg.light',
      optional: false,
      problems: [],
      source: [],
      tag: 'variation',
      type: '',
    }
    let block: Partial<Block> = {}

    block = variation.transform(block, comment)

    expect(block).toHaveProperty('variation')
    expect(block.variation).toMatchObject({
      key: 'bg.light',
      name: 'bg.light',
      wrapper: '<div class="bg-light">{{content}}</div>',
    })
  })

  it('should parse display name from first line of description', () => {
    const comment = {
      description: 'Dark Background\n<div class="dark">{{content}}</div>',
      name: 'bg.dark',
      optional: false,
      problems: [],
      source: [],
      tag: 'variation',
      type: '',
    }
    let block: Partial<Block> = {}

    block = variation.transform(block, comment)

    expect(block.variation).toMatchObject({
      key: 'bg.dark',
      name: 'Dark Background',
      wrapper: '<div class="dark">{{content}}</div>',
    })
  })

  it('should lowercase the key', () => {
    const comment = {
      description: '<div>{{content}}</div>',
      name: 'BG.Light',
      optional: false,
      problems: [],
      source: [],
      tag: 'variation',
      type: '',
    }
    let block: Partial<Block> = {}

    block = variation.transform(block, comment)

    expect(block.variation?.key).toBe('bg.light')
  })

  it('should throw error when key is missing', () => {
    const comment = {
      description: '<div>{{content}}</div>',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'variation',
      type: '',
    }
    const block: Partial<Block> = {}

    expect(() => {
      variation.transform(block, comment)
    }).toThrowError('Missing variation key')
  })

  it('should throw error when wrapper is missing {{content}} placeholder', () => {
    const comment = {
      description: '<div class="wrapper"></div>',
      name: 'bg.light',
      optional: false,
      problems: [],
      source: [],
      tag: 'variation',
      type: '',
    }
    const block: Partial<Block> = {}

    expect(() => {
      variation.transform(block, comment)
    }).toThrowError('{{content}} placeholder')
  })

  it('should return block unchanged when no description', () => {
    const comment = {
      description: '',
      name: 'bg.light',
      optional: false,
      problems: [],
      source: [],
      tag: 'variation',
      type: '',
    }
    let block: Partial<Block> = {}

    block = variation.transform(block, comment)

    expect(block.variation).toBeUndefined()
  })
})
