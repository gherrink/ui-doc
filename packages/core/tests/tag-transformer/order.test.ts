import { describe, expect, test } from '@jest/globals'
import { Block } from '@styleguide/core'

import order from '../../src/tag-transformers/order'

describe('Order tag transformer', () => {
  test('should transform', () => {
    const comment = {
      tag: 'order',
      name: '1',
      type: '',
      description: '',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = order.transform(block, comment)

    expect(block).toHaveProperty('order')
    expect(block.order).toEqual(1)
  })

  test('should transform to 0', () => {
    const comment = {
      tag: 'order',
      name: 'asdf',
      type: '',
      description: '',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = order.transform(block, comment)

    expect(block).toHaveProperty('order')
    expect(block.order).toEqual(0)
  })
})
