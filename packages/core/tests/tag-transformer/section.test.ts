import { describe, expect, test } from '@jest/globals'
import { Block } from '@styleguide/core'

import section from '../../src/tag-transformers/section'

describe('Section tag transformer', () => {
  test('should transform name', () => {
    const comment = {
      tag: 'section',
      name: 'test',
      type: '',
      description: '',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = section.transform(block, comment)

    expect(block).toHaveProperty('section')
    expect(block.section).toMatchObject({
      key: 'test',
      name: 'test',
    })
  })

  test('should transform name upper', () => {
    const comment = {
      tag: 'section',
      name: 'Test',
      type: '',
      description: '',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = section.transform(block, comment)

    expect(block).toHaveProperty('section')
    expect(block.section).toMatchObject({
      key: 'test',
      name: 'Test',
    })
  })

  test('should transform name and description', () => {
    const comment = {
      tag: 'section',
      name: 'test',
      type: '',
      description: 'Test Section',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = section.transform(block, comment)

    expect(block).toHaveProperty('section')
    expect(block.section).toMatchObject({
      key: 'test',
      name: 'Test Section',
    })
  })

  test('should transform name and description level 2', () => {
    const comment = {
      tag: 'section',
      name: 'test.test',
      type: '',
      description: 'Test Section',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = section.transform(block, comment)

    expect(block).toHaveProperty('section')
    expect(block.section).toMatchObject({
      key: 'test.test',
      name: 'Test Section',
    })
  })

  test('should throw error', () => {
    const comment = {
      tag: 'section',
      name: '',
      type: '',
      description: '',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    expect(() => {
      block = section.transform(block, comment)
    }).toThrowError('No key is given')

    expect(block.section).toBeUndefined()
  })
})
