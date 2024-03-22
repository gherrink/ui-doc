import { describe, expect, test } from '@jest/globals'
import { Block } from '@styleguide/core'

import page from '../../src/tag-transformers/page'

describe('Page tag transformer', () => {
  test('should transform name', () => {
    const comment = {
      tag: 'page',
      name: 'test',
      type: '',
      description: '',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = page.transform(block, comment)

    expect(block).toHaveProperty('page')
    expect(block.page).toMatchObject({
      key: 'test',
      name: 'test',
    })
  })

  test('should transform name upper', () => {
    const comment = {
      tag: 'page',
      name: 'Test',
      type: '',
      description: '',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = page.transform(block, comment)

    expect(block).toHaveProperty('page')
    expect(block.page).toMatchObject({
      key: 'test',
      name: 'Test',
    })
  })

  test('should transform name and description', () => {
    const comment = {
      tag: 'page',
      name: 'test',
      type: '',
      description: 'Test Page',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = page.transform(block, comment)

    expect(block).toHaveProperty('page')
    expect(block.page).toMatchObject({
      key: 'test',
      name: 'Test Page',
    })
  })

  test('should throw error', () => {
    const comment = {
      tag: 'page',
      name: '',
      type: '',
      description: '',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    expect(() => {
      block = page.transform(block, comment)
    }).toThrowError('No key is given')

    expect(block.page).toBeUndefined()
  })
})
