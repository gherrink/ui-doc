import type { Block } from '../../src/Block.types'

import { describe, expect, it } from 'vitest'
import showcase from '../../src/tag-transformers/showcase'

describe('showcase tag transformer', () => {
  it('should set showcase to referenced block key', () => {
    const comment = {
      description: '',
      name: 'buttons.primary',
      optional: false,
      problems: [],
      source: [],
      tag: 'showcase',
      type: '',
    }
    let block: Partial<Block> = {}

    block = showcase.transform(block, comment)

    expect(block.showcase).toBe('buttons.primary')
  })

  it('should lowercase the block key', () => {
    const comment = {
      description: '',
      name: 'Buttons.Primary',
      optional: false,
      problems: [],
      source: [],
      tag: 'showcase',
      type: '',
    }
    let block: Partial<Block> = {}

    block = showcase.transform(block, comment)

    expect(block.showcase).toBe('buttons.primary')
  })

  it('should throw error when target is missing', () => {
    const comment = {
      description: '',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'showcase',
      type: '',
    }
    const block: Partial<Block> = {}

    expect(() => {
      showcase.transform(block, comment)
    }).toThrowError('Missing showcase target')
  })

  it('should handle simple page reference', () => {
    const comment = {
      description: '',
      name: 'buttons',
      optional: false,
      problems: [],
      source: [],
      tag: 'showcase',
      type: '',
    }
    let block: Partial<Block> = {}

    block = showcase.transform(block, comment)

    expect(block.showcase).toBe('buttons')
  })

  it('should handle deeply nested references', () => {
    const comment = {
      description: '',
      name: 'components.forms.inputs.text',
      optional: false,
      problems: [],
      source: [],
      tag: 'showcase',
      type: '',
    }
    let block: Partial<Block> = {}

    block = showcase.transform(block, comment)

    expect(block.showcase).toBe('components.forms.inputs.text')
  })
})
