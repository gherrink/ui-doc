import { describe, expect, test } from '@jest/globals'
import { Block } from '@styleguide/core'

import code from '../../src/tag-transformers/code'

describe('Code tag transformer', () => {
  test('should transform simple', () => {
    const comment = {
      tag: 'code',
      name: '',
      type: '',
      description: '<div>test</div>',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = code.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block.code).toMatchObject({ content: '<div>test</div>', title: '', type: 'html' })
  })

  test('should transform type', () => {
    const comment = {
      tag: 'code',
      name: '',
      type: 'xhtml',
      description: '<div>test</div>',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = code.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block.code).toMatchObject({ content: '<div>test</div>', title: '', type: 'xhtml' })
  })

  test('should transform name', () => {
    const comment = {
      tag: 'code',
      name: 'Test name',
      type: '',
      description: '<div>test</div>',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = code.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block.code).toMatchObject({ content: '<div>test</div>', title: 'Test name', type: 'html' })
  })

  test('should ignore empty', () => {
    const comment = {
      tag: 'code',
      name: 'Test name',
      type: '',
      description: '',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = code.transform(block, comment)

    expect(block.code).toBeUndefined()
  })

  test('should override existing code', () => {
    const comment = {
      tag: 'code',
      name: 'Test name',
      type: '',
      description: '<div>new code</div>',
      optional: false,
      problems: [],
      source: [],
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
      tag: 'example',
      name: '',
      type: '',
      description: '<div>test</div>',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {
      hideCode: true,
    }

    block = code.transform(block, comment)

    expect(block.code).toBeUndefined()
  })
})
