import { describe, expect, it } from 'vitest'

import type { Block } from '../../src/Block.types'
import page from '../../src/tag-transformers/page'

describe('page tag transformer', () => {
  it('should transform name', () => {
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

  it('should transform name upper', () => {
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

  it('should transform name and description', () => {
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

  it('should throw error', () => {
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
    }).toThrowError('Missing key')

    expect(block.page).toBeUndefined()
  })
})
