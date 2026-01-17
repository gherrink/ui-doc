import type { Block } from '../../src/Block.types'

import { describe, expect, it } from 'vitest'
import order from '../../src/tag-transformers/order'

describe('order tag transformer', () => {
  it('should transform', () => {
    const comment = {
      description: '',
      name: '1',
      optional: false,
      problems: [],
      source: [],
      tag: 'order',
      type: '',
    }
    let block: Partial<Block> = {}

    block = order.transform(block, comment)

    expect(block).toHaveProperty('order')
    expect(block.order).toEqual(1)
  })

  it('should transform to 0', () => {
    const comment = {
      description: '',
      name: 'asdf',
      optional: false,
      problems: [],
      source: [],
      tag: 'order',
      type: '',
    }
    let block: Partial<Block> = {}

    block = order.transform(block, comment)

    expect(block).toHaveProperty('order')
    expect(block.order).toEqual(0)
  })
})
