import { describe, expect, test } from '@jest/globals'

import section from '../../src/tag-transformers/section'
import { Block } from '../../src/types'

describe('Section tag transformer', () => {
  test('should transform name', () => {
    const comment = {
      description: '',
      name: 'test',
      optional: false,
      problems: [],
      source: [],
      tag: 'section',
      type: '',
    }
    let block: Partial<Block> = {}

    block = section.transform(block, comment)

    expect(block).toHaveProperty('section')
    expect(block).toMatchObject({
      section: 'test',
      title: 'test',
    })
  })

  test('should transform name upper', () => {
    const comment = {
      description: '',
      name: 'Test',
      optional: false,
      problems: [],
      source: [],
      tag: 'section',
      type: '',
    }
    let block: Partial<Block> = {}

    block = section.transform(block, comment)

    expect(block).toHaveProperty('section')
    expect(block).toMatchObject({
      section: 'test',
      title: 'Test',
    })
  })

  test('should transform name and description', () => {
    const comment = {
      description: 'Test Section',
      name: 'test',
      optional: false,
      problems: [],
      source: [],
      tag: 'section',
      type: '',
    }
    let block: Partial<Block> = {}

    block = section.transform(block, comment)

    expect(block).toHaveProperty('section')
    expect(block).toMatchObject({
      section: 'test',
      title: 'Test Section',
    })
  })

  test('should transform name and description level 2', () => {
    const comment = {
      description: 'Test Section',
      name: 'test.test',
      optional: false,
      problems: [],
      source: [],
      tag: 'section',
      type: '',
    }
    let block: Partial<Block> = {}

    block = section.transform(block, comment)

    expect(block).toHaveProperty('section')
    expect(block).toMatchObject({
      section: 'test.test',
      title: 'Test Section',
    })
  })

  test('should not override location title', () => {
    const comment = {
      description: 'Test Section',
      name: 'test.test',
      optional: false,
      problems: [],
      source: [],
      tag: 'section',
      type: '',
    }
    let block: Partial<Block> = {
      location: 'test.test',
      title: 'Test Location',
    }

    block = section.transform(block, comment)

    expect(block).toMatchObject({
      location: 'test.test',
      section: 'test.test',
      title: 'Test Location',
    })
  })

  test('should throw error', () => {
    const comment = {
      description: '',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'section',
      type: '',
    }
    let block: Partial<Block> = {}

    expect(() => {
      block = section.transform(block, comment)
    }).toThrowError('Missing key')

    expect(block.section).toBeUndefined()
  })
})
