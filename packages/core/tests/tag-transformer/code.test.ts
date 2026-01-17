import type { Block } from '../../src/Block.types'

import { describe, expect, it } from 'vitest'
import code from '../../src/tag-transformers/code'

describe('code tag transformer', () => {
  it('should transform simple', () => {
    const comment = {
      description: '<div>test</div>',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'code',
      type: '',
    }
    let block: Partial<Block> = {}

    block = code.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block.code).toMatchObject({ content: '<div>test</div>', title: '', type: 'html' })
  })

  it('should transform type', () => {
    const comment = {
      description: '<div>test</div>',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'code',
      type: 'xhtml',
    }
    let block: Partial<Block> = {}

    block = code.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block.code).toMatchObject({ content: '<div>test</div>', title: '', type: 'xhtml' })
  })

  it('should transform name', () => {
    const comment = {
      description: '<div>test</div>',
      name: 'Test name',
      optional: false,
      problems: [],
      source: [],
      tag: 'code',
      type: '',
    }
    let block: Partial<Block> = {}

    block = code.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block.code).toMatchObject({
      content: '<div>test</div>',
      title: 'Test name',
      type: 'html',
    })
  })

  it('should ignore empty', () => {
    const comment = {
      description: '',
      name: 'Test name',
      optional: false,
      problems: [],
      source: [],
      tag: 'code',
      type: '',
    }
    let block: Partial<Block> = {}

    block = code.transform(block, comment)

    expect(block.code).toBeUndefined()
  })

  it('should override existing code', () => {
    const comment = {
      description: '<div>new code</div>',
      name: 'Test name',
      optional: false,
      problems: [],
      source: [],
      tag: 'code',
      type: '',
    }
    let block: Partial<Block> = {
      code: {
        content: '<div>existing code</div>',
        title: '',
        type: 'code-html',
      },
    }

    block = code.transform(block, comment)

    expect(block.code).toEqual({
      content: '<div>new code</div>',
      title: 'Test name',
      type: 'html',
    })
  })

  it('should not transform when hideCode', () => {
    const comment = {
      description: '<div>test</div>',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'example',
      type: '',
    }
    let block: Partial<Block> = {
      hideCode: true,
    }

    block = code.transform(block, comment)

    expect(block.code).toBeUndefined()
  })
})
