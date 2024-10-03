import { describe, expect, test } from '@jest/globals'

import { Block } from '../../src/Block.types'
import order from '../../src/tag-transformers/order'

describe('Order tag transformer', () => {
  test('should transform', () => {
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

  test('should transform to 0', () => {
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
