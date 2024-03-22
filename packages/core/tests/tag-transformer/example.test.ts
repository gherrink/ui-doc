import { describe, expect, test } from '@jest/globals'
import { Block } from '@styleguide/core'

import example from '../../src/tag-transformers/example'

function exampleToCode(data: { content: string, title: string, type: string }) {
  return {
    content: data.content,
    title: data.title,
    type: data.type,
  }
}

describe('Example tag transformer', () => {
  test('should transform simple', () => {
    const comment = {
      tag: 'example',
      name: '',
      type: '',
      description: '<div>test</div>',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}
    const expected = {
      content: '<div>test</div>',
      title: '',
      type: 'html',
      modifier: undefined,
    }

    block = example.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block).toHaveProperty('example')
    expect(block.code).toMatchObject(exampleToCode(expected))
    expect(block.example).toMatchObject(expected)
  })

  test('should transform type with modifier', () => {
    const comment = {
      tag: 'example',
      name: '',
      type: 'simple-modifier',
      description: '<div>test</div>',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}
    const expected = {
      content: '<div>test</div>',
      title: '',
      type: 'html',
      modifier: 'simple-modifier',
    }

    block = example.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block).toHaveProperty('example')
    expect(block.code).toMatchObject(exampleToCode(expected))
    expect(block.example).toMatchObject(expected)
  })

  test('should transform type with modifier and type', () => {
    const comment = {
      tag: 'example',
      name: '',
      type: 'simple-modifier|xhtml',
      description: '<div>test</div>',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}
    const expected = {
      content: '<div>test</div>',
      title: '',
      type: 'xhtml',
      modifier: 'simple-modifier',
    }

    block = example.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block).toHaveProperty('example')
    expect(block.code).toMatchObject(exampleToCode(expected))
    expect(block.example).toMatchObject(expected)
  })

  test('should not transform code when hideCode', () => {
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
    const expected = {
      content: '<div>test</div>',
      title: '',
      type: 'html',
    }

    block = example.transform(block, comment)

    expect(block).not.toHaveProperty('code')
    expect(block).toHaveProperty('example')
    expect(block.example).toMatchObject(expected)
  })

  test('should not be undefined on empty content', () => {
    const comment = {
      tag: 'example',
      name: '',
      type: '',
      description: '',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {}

    block = example.transform(block, comment)

    expect(block.code).toBeUndefined()
    expect(block.example).toBeUndefined()
  })

  test('should not override existing code', () => {
    const comment = {
      tag: 'example',
      name: '',
      type: '',
      description: '<div>example test</div>',
      optional: false,
      problems: [],
      source: [],
    }
    let block: Partial<Block> = {
      code: {
        content: '<div>code test</div>',
        title: '',
        type: 'code-html',
      },
    }

    block = example.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block).toHaveProperty('example')
    expect(block.code).toMatchObject({
      content: '<div>code test</div>',
      title: '',
      type: 'code-html',
    })
    expect(block.example).toMatchObject({
      content: '<div>example test</div>',
      title: '',
      type: 'html',
    })
  })
})
