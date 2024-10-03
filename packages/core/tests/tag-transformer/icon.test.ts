import { describe, expect, test } from '@jest/globals'

import { Block } from '../../src/Block.types'
import icon from '../../src/tag-transformers/icon'

describe('Icon tag transformer', () => {
  test('should transform', () => {
    const comment = {
      description: 'chevron-right',
      name: '--icon-chevron-right',
      optional: false,
      problems: [],
      source: [],
      tag: 'icon',
      type: 'e900',
    }
    const block: Partial<Block> = {}

    icon.transform(block, comment)

    expect(block).toHaveProperty('icons')
    if (!block.icons) {
      return
    }
    expect(block.icons).toHaveLength(1)
    expect(block.icons[0]).toMatchObject({
      name: '--icon-chevron-right',
      text: 'chevron-right',
      value: { output: '&#xe900' },
    })
  })

  test('should transform with variable', () => {
    const comment = {
      description: 'chevron-right',
      name: '--icon-chevron-right',
      optional: false,
      problems: [],
      source: [],
      tag: 'icon',
      type: '--icon-chevron-right',
    }
    const block: Partial<Block> = {}

    icon.transform(block, comment)

    expect(block).toHaveProperty('icons')
    if (!block.icons) {
      return
    }
    expect(block.icons).toHaveLength(1)
    expect(block.icons[0]).toMatchObject({
      name: '--icon-chevron-right',
      text: 'chevron-right',
      value: { name: '--icon-chevron-right' },
    })
  })

  test('should transform with name as variable', () => {
    const comment = {
      description: 'chevron-right',
      name: '--icon-chevron-right',
      optional: false,
      problems: [],
      source: [],
      tag: 'icon',
      type: '',
    }
    const block: Partial<Block> = {}

    icon.transform(block, comment)

    expect(block).toHaveProperty('icons')
    if (!block.icons) {
      return
    }
    expect(block.icons).toHaveLength(1)
    expect(block.icons[0]).toMatchObject({
      name: '--icon-chevron-right',
      text: 'chevron-right',
      value: { name: '--icon-chevron-right' },
    })
  })
})
