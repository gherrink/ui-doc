import { describe, expect, test } from '@jest/globals'
import { Block } from '@styleguide/core'

import location from '../../src/tag-transformers/location'

describe('Location tag transformer', () => {
  test('should transform name', () => {
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

  test('should transform name upper', () => {
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

  test('should transform name and description level 2', () => {
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

  test('should throw error', () => {
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
    }).toThrowError('No key is given')

    expect(block.location).toBeUndefined()
  })
})
