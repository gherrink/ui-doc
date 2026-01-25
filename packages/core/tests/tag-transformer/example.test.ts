import type { Block } from '../../src/Block.types'

import { describe, expect, it } from 'vitest'
import example from '../../src/tag-transformers/example'

interface CodeData { content: string, title: string, type: string }

function exampleToCode(data: CodeData): CodeData {
  return {
    content: data.content,
    title: data.title,
    type: data.type,
  }
}

describe('example tag transformer', () => {
  it('should transform simple', () => {
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

  it('should transform type with modifier', () => {
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

  it('should transform type with modifier and type', () => {
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

  it('should not transform code when hideCode', () => {
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

  it('should not be undefined on empty content', () => {
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

  it('should not override existing code', () => {
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

  it('should throw error when invalid html is given', () => {
    const comment = {
      description: '<div>example test',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'example',
      type: '',
    }
    const block: Partial<Block> = {}

    expect(() => {
      example.transform(block, comment)
    }).toThrowError('Invalid HTML content.')
  })

  it('should use block title as example title when example title is empty', () => {
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
      title: 'Block Title',
    }

    block = example.transform(block, comment)

    expect(block.example?.title).toBe('Block Title')
  })

  it('should keep example title when provided', () => {
    const comment = {
      description: '<div>test</div>',
      name: 'Example Title',
      optional: false,
      problems: [],
      source: [],
      tag: 'example',
      type: '',
    }
    let block: Partial<Block> = {
      title: 'Block Title',
    }

    block = example.transform(block, comment)

    expect(block.example?.title).toBe('Example Title')
  })

  it('should not validate HTML for explicit non-html types with pipe separator', () => {
    const comment = {
      description: 'console.log("test")',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'example',
      type: 'modifier|javascript',
    }
    let block: Partial<Block> = {}

    // When type is explicitly set to non-html via pipe separator, no HTML validation occurs
    expect(() => {
      block = example.transform(block, comment)
    }).not.toThrow()

    expect(block.example?.content).toBe('console.log("test")')
    expect(block.example?.type).toBe('javascript')
    expect(block.example?.modifier).toBe('modifier')
  })

  it('should parse type with pipe separator and set both modifier and type', () => {
    const comment = {
      description: '<div>test</div>',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'example',
      type: 'dark-theme|xhtml',
    }
    let block: Partial<Block> = {}

    block = example.transform(block, comment)

    expect(block.example?.modifier).toBe('dark-theme')
    expect(block.example?.type).toBe('xhtml')
  })

  it('should set modifier to undefined when type is html without explicit type', () => {
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

    block = example.transform(block, comment)

    expect(block.example?.modifier).toBeUndefined()
    expect(block.example?.type).toBe('html')
  })

  it('should set modifier when type is not html', () => {
    const comment = {
      description: '<div>test</div>',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'example',
      type: 'preview',
    }
    let block: Partial<Block> = {}

    block = example.transform(block, comment)

    expect(block.example?.modifier).toBe('preview')
    expect(block.example?.type).toBe('html')
  })
})
