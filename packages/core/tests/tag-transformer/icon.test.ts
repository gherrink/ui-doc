import { describe, expect, it } from 'vitest'

import type { Block } from '../../src/Block.types'
import icon from '../../src/tag-transformers/icon'

describe('icon tag transformer', () => {
  it('should transform', () => {
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

  it('should transform with variable', () => {
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

  it('should transform with name as variable', () => {
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

  it('should not transform without description', () => {
    const comment = {
      description: '',
      name: '--icon-chevron',
      optional: false,
      problems: [],
      source: [],
      tag: 'icon',
      type: 'e900',
    }
    const block: Partial<Block> = {}

    icon.transform(block, comment)

    expect(block).not.toHaveProperty('icons')
  })

  it('should not transform without name', () => {
    const comment = {
      description: 'chevron-right',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'icon',
      type: 'e900',
    }
    const block: Partial<Block> = {}

    icon.transform(block, comment)

    expect(block).not.toHaveProperty('icons')
  })

  it('should not transform without type and non-variable name', () => {
    const comment = {
      description: 'chevron-right',
      name: 'regular-name',
      optional: false,
      problems: [],
      source: [],
      tag: 'icon',
      type: '',
    }
    const block: Partial<Block> = {}

    icon.transform(block, comment)

    expect(block).not.toHaveProperty('icons')
  })

  it('should transform multiple icons', () => {
    const block: Partial<Block> = {}

    icon.transform(block, {
      description: 'chevron-right',
      name: '--icon-chevron-right',
      optional: false,
      problems: [],
      source: [],
      tag: 'icon',
      type: 'e900',
    })

    icon.transform(block, {
      description: 'chevron-left',
      name: '--icon-chevron-left',
      optional: false,
      problems: [],
      source: [],
      tag: 'icon',
      type: 'e901',
    })

    expect(block.icons).toHaveLength(2)
    expect(block.icons?.[0]).toMatchObject({ name: '--icon-chevron-right', text: 'chevron-right' })
    expect(block.icons?.[1]).toMatchObject({ name: '--icon-chevron-left', text: 'chevron-left' })
  })

  it('should format icon code with &#x prefix', () => {
    const comment = {
      description: 'arrow',
      name: '--icon-arrow',
      optional: false,
      problems: [],
      source: [],
      tag: 'icon',
      type: 'f001',
    }
    const block: Partial<Block> = {}

    icon.transform(block, comment)

    expect(block.icons?.[0].value).toMatchObject({ output: '&#xf001' })
  })

  it('should trim leading dash from description', () => {
    const comment = {
      description: '- Arrow Icon',
      name: '--icon-arrow',
      optional: false,
      problems: [],
      source: [],
      tag: 'icon',
      type: 'e900',
    }
    const block: Partial<Block> = {}

    icon.transform(block, comment)

    expect(block.icons?.[0].text).toBe('Arrow Icon')
  })
})
