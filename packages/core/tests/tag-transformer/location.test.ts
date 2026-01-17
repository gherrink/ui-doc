import type { Block } from '../../src/Block.types'

import { describe, expect, it } from 'vitest'
import location from '../../src/tag-transformers/location'

describe('location tag transformer', () => {
  it('should transform name', () => {
    const comment = {
      description: '',
      name: 'test',
      optional: false,
      problems: [],
      source: [],
      tag: 'location',
      type: '',
    }
    let block: Partial<Block> = {}

    block = location.transform(block, comment)

    expect(block).toHaveProperty('location')
    expect(block.location).toEqual('test')
  })

  it('should transform name upper', () => {
    const comment = {
      description: '',
      name: 'Test',
      optional: false,
      problems: [],
      source: [],
      tag: 'location',
      type: '',
    }
    let block: Partial<Block> = {}

    block = location.transform(block, comment)

    expect(block).toHaveProperty('location')
    expect(block.location).toEqual('test')
  })

  it('should transform name and description level 2', () => {
    const comment = {
      description: '',
      name: 'test.test',
      optional: false,
      problems: [],
      source: [],
      tag: 'location',
      type: '',
    }
    let block: Partial<Block> = {}

    block = location.transform(block, comment)

    expect(block).toHaveProperty('location')
    expect(block.location).toEqual('test.test')
  })

  it('should throw error', () => {
    const comment = {
      description: '',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'location',
      type: '',
    }
    let block: Partial<Block> = {}

    expect(() => {
      block = location.transform(block, comment)
    }).toThrowError('Missing key')

    expect(block.location).toBeUndefined()
  })
})
