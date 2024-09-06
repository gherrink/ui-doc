import { describe, expect, test } from '@jest/globals'

import space from '../../src/tag-transformers/space'
import { Block } from '../../src/types'

describe('Space tag transformer', () => {
  test('should transform', () => {
    const comment = {
      description: 'XS',
      name: '--space-xs',
      optional: false,
      problems: [],
      source: [],
      tag: 'space',
      type: '0.5rem',
    }
    const block: Partial<Block> = {}

    space.transform(block, comment)

    expect(block).toHaveProperty('spaces')
    if (!block.spaces) {
      return
    }
    expect(block.spaces).toHaveLength(1)
    expect(block.spaces[0]).toMatchObject({
      name: '--space-xs',
      text: 'XS',
      value: { output: '0.5rem' },
    })
  })

  test('should transform with variable', () => {
    const comment = {
      description: 'XS',
      name: 'name',
      optional: false,
      problems: [],
      source: [],
      tag: 'space',
      type: '--space-xxs',
    }
    const block: Partial<Block> = {}

    space.transform(block, comment)

    expect(block).toHaveProperty('spaces')
    if (!block.spaces) {
      return
    }
    expect(block.spaces).toHaveLength(1)
    expect(block.spaces[0]).toMatchObject({
      name: 'name',
      text: 'XS',
      value: { name: '--space-xxs' },
    })
  })

  test('should transform with name as vairable', () => {
    const comment = {
      description: 'XS',
      name: '--space-xs',
      optional: false,
      problems: [],
      source: [],
      tag: 'space',
      type: '',
    }
    const block: Partial<Block> = {}

    space.transform(block, comment)

    expect(block).toHaveProperty('spaces')
    if (!block.spaces) {
      return
    }
    expect(block.spaces).toHaveLength(1)
    expect(block.spaces[0]).toMatchObject({
      name: '--space-xs',
      text: 'XS',
      value: { name: '--space-xs' },
    })
  })
})
