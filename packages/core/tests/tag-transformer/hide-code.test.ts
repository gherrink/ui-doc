import { describe, expect, test } from '@jest/globals'

import { Block } from '../../src/Block.types'
import hideCode from '../../src/tag-transformers/hide-code'

describe('hide code tag transformer', () => {
  test('should transform', () => {
    const comment = {
      description: '',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'hideCode',
      type: '',
    }
    let block: Partial<Block> = {}

    block = hideCode.transform(block, comment)

    expect(block).toHaveProperty('hideCode')
    expect(block.hideCode).toEqual(true)
    expect(block.code).toBeUndefined()
  })

  test('should remove code', () => {
    const comment = {
      description: '',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'hideCode',
      type: '',
    }
    let block: Partial<Block> = {
      code: {
        content: '<div>test</div>',
        title: '',
        type: 'html',
      },
    }

    block = hideCode.transform(block, comment)

    expect(block).toHaveProperty('hideCode')
    expect(block.hideCode).toEqual(true)
    expect(block.code).toBeUndefined()
  })
})
