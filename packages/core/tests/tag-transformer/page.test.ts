import { describe, expect, test } from '@jest/globals'
import { Block } from '@styleguide/core'

import page from '../../src/tag-transformers/page'

describe('Page tag transformer', () => {
  test('should transform name', () => {
    const comment = {
      description: '',
      name: 'test',
      optional: false,
      problems: [],
      source: [],
      tag: 'page',
      type: '',
    }
    let block: Partial<Block> = {}

    block = page.transform(block, comment)

    expect(block).toHaveProperty('page')
    expect(block).toMatchObject({
      page: 'test',
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
      tag: 'page',
      type: '',
    }
    let block: Partial<Block> = {}

    block = page.transform(block, comment)

    expect(block).toHaveProperty('page')
    expect(block).toMatchObject({
      page: 'test',
      title: 'Test',
    })
  })

  test('should transform name and description', () => {
    const comment = {
      description: 'Test Page',
      name: 'test',
      optional: false,
      problems: [],
      source: [],
      tag: 'page',
      type: '',
    }
    let block: Partial<Block> = {}

    block = page.transform(block, comment)

    expect(block).toHaveProperty('page')
    expect(block).toMatchObject({
      page: 'test',
      title: 'Test Page',
    })
  })

  test('should throw error', () => {
    const comment = {
      description: '',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'page',
      type: '',
    }
    let block: Partial<Block> = {}

    expect(() => {
      block = page.transform(block, comment)
    }).toThrowError('No key is given')

    expect(block.page).toBeUndefined()
  })
})
