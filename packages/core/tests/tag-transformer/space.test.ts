import type { Block } from '../../src/Block.types'

import { describe, expect, it } from 'vitest'
import space from '../../src/tag-transformers/space'

describe('space tag transformer', () => {
  it('should transform', () => {
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

  it('should transform with variable', () => {
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

  it('should transform with name as vairable', () => {
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

  it('should not transform without description', () => {
    const comment = {
      description: '',
      name: '--space-xs',
      optional: false,
      problems: [],
      source: [],
      tag: 'space',
      type: '0.5rem',
    }
    const block: Partial<Block> = {}

    space.transform(block, comment)

    expect(block).not.toHaveProperty('spaces')
  })

  it('should not transform without name', () => {
    const comment = {
      description: 'XS',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'space',
      type: '0.5rem',
    }
    const block: Partial<Block> = {}

    space.transform(block, comment)

    expect(block).not.toHaveProperty('spaces')
  })

  it('should not transform without type and non-variable name', () => {
    const comment = {
      description: 'XS',
      name: 'regular-name',
      optional: false,
      problems: [],
      source: [],
      tag: 'space',
      type: '',
    }
    const block: Partial<Block> = {}

    space.transform(block, comment)

    expect(block).not.toHaveProperty('spaces')
  })

  it('should transform multiple spaces', () => {
    const block: Partial<Block> = {}

    space.transform(block, {
      description: 'XS',
      name: '--space-xs',
      optional: false,
      problems: [],
      source: [],
      tag: 'space',
      type: '0.25rem',
    })

    space.transform(block, {
      description: 'SM',
      name: '--space-sm',
      optional: false,
      problems: [],
      source: [],
      tag: 'space',
      type: '0.5rem',
    })

    expect(block.spaces).toHaveLength(2)
    expect(block.spaces?.[0]).toMatchObject({ name: '--space-xs', text: 'XS' })
    expect(block.spaces?.[1]).toMatchObject({ name: '--space-sm', text: 'SM' })
  })

  it('should trim leading dash from description', () => {
    const comment = {
      description: '- Extra Small',
      name: '--space-xs',
      optional: false,
      problems: [],
      source: [],
      tag: 'space',
      type: '0.25rem',
    }
    const block: Partial<Block> = {}

    space.transform(block, comment)

    expect(block.spaces?.[0].text).toBe('Extra Small')
  })
})
