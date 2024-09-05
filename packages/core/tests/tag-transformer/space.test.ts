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
      value: '0.5rem',
    })
  })
})
