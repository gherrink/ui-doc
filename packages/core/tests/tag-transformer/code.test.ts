import { describe, expect, test } from '@jest/globals'

import { Block } from '../../src/Block.types'
import code from '../../src/tag-transformers/code'

describe('Code tag transformer', () => {
  test('should transform simple', () => {
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

  test('should transform type', () => {
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

  test('should transform name', () => {
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

  test('should ignore empty', () => {
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

  test('should override existing code', () => {
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

  test('should not transform when hideCode', () => {
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
