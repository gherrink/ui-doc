import type { Block } from '../../src/Block.types'

import { describe, expect, it } from 'vitest'
import hideCode from '../../src/tag-transformers/hide-code'

describe('hide code tag transformer', () => {
  it('should transform', () => {
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

  it('should remove code', () => {
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
