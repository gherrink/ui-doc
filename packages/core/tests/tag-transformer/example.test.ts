import { describe, expect, test } from '@jest/globals'

import example from '../../src/tag-transformers/example'
import { Block } from '../../src/types'

function exampleToCode(data: { content: string; title: string; type: string }) {
  return {
    content: data.content,
    title: data.title,
    type: data.type,
  }
}

describe('Example tag transformer', () => {
  test('should transform simple', () => {
    const comment = {
      description: '<div>test</div>',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'example',
      type: '',
    }
    let block: Partial<Block> = {}
    const expected = {
      content: '<div>test</div>',
      modifier: undefined,
      title: '',
      type: 'html',
    }

    block = example.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block).toHaveProperty('example')
    expect(block.code).toMatchObject(exampleToCode(expected))
    expect(block.example).toMatchObject(expected)
  })

  test('should transform type with modifier', () => {
    const comment = {
      description: '<div>test</div>',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'example',
      type: 'simple-modifier',
    }
    let block: Partial<Block> = {}
    const expected = {
      content: '<div>test</div>',
      modifier: 'simple-modifier',
      title: '',
      type: 'html',
    }

    block = example.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block).toHaveProperty('example')
    expect(block.code).toMatchObject(exampleToCode(expected))
    expect(block.example).toMatchObject(expected)
  })

  test('should transform type with modifier and type', () => {
    const comment = {
      description: '<div>test</div>',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'example',
      type: 'simple-modifier|xhtml',
    }
    let block: Partial<Block> = {}
    const expected = {
      content: '<div>test</div>',
      modifier: 'simple-modifier',
      title: '',
      type: 'xhtml',
    }

    block = example.transform(block, comment)

    expect(block).toHaveProperty('code')
    expect(block).toHaveProperty('example')
    expect(block.code).toMatchObject(exampleToCode(expected))
    expect(block.example).toMatchObject(expected)
  })

  test('should not transform code when hideCode', () => {
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
      description: '',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'example',
      type: '',
    }
    let block: Partial<Block> = {}

    block = example.transform(block, comment)

    expect(block.code).toBeUndefined()
    expect(block.example).toBeUndefined()
  })

  test('should not override existing code', () => {
    const comment = {
      description: '<div>example test</div>',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'example',
      type: '',
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
