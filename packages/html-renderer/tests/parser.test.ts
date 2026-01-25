import { describe, expect, it } from 'vitest'

import { ParserError } from '../src/errors'
import { InlineReader } from '../src/InlineReader'
import { NodeParser } from '../src/NodeParser'
import { CommentNode, TagDebugNode, TagForNode, TemplateNode } from '../src/nodes'

describe('parser', () => {
  it('template', () => {
    const parser = NodeParser.init()
    const reader = new InlineReader('foo bar')
    const res = parser.parse(reader)
    const tag = res.children[0] as TemplateNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.children.length).toBe(0)
    expect(tag.content).toEqual('foo bar')
  })

  it('template multiline', () => {
    const parser = NodeParser.init()
    const reader = new InlineReader('foo bar\nbaz\nfoobar')
    const res = parser.parse(reader)
    const tag = res.children[0] as TemplateNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.children.length).toBe(0)
    expect(tag.content).toEqual('foo bar\nbaz\nfoobar')
  })

  it('comment', () => {
    const parser = NodeParser.init()
    const reader = new InlineReader('<!-- foo bar -->')
    const res = parser.parse(reader)
    const tag = res.children[0] as CommentNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(CommentNode)
    expect(tag.children.length).toBe(0)
    expect(tag.content).toEqual('foo bar')
  })

  it('comment not closed', () => {
    const parser = NodeParser.init()
    const reader = new InlineReader('<!-- foo bar ->')
    const res = parser.parse(reader)
    const tag = res.children[0] as CommentNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(CommentNode)
    expect(tag.children.length).toBe(0)
    expect(tag.content).toEqual('foo bar ->')
  })

  it('tag', () => {
    const parser = NodeParser.init()
    const reader = new InlineReader('{{ debug }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagDebugNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagDebugNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('this')
  })

  it('to throw when tag not closed', () => {
    const parser = NodeParser.init()
    const reader = new InlineReader('{{ debug }')

    expect(() => {
      parser.parse(reader)
    }).toThrow(ParserError)
  })

  it('to throw when tag not ended', () => {
    const parser = NodeParser.init()
    const reader = new InlineReader('{{ for }}inner')

    expect(() => {
      parser.parse(reader)
    }).toThrow(ParserError)
  })

  it('template with tag', () => {
    const parser = NodeParser.init()
    const reader = new InlineReader('foo {{ debug }} bar')
    const res = parser.parse(reader)

    expect(res.children.length).toBe(3)
    expect(res.children[0]).toBeInstanceOf(TemplateNode)
    expect((res.children[0] as TemplateNode).content).toEqual('foo ')
    expect(res.children[1]).toBeInstanceOf(TagDebugNode)
    expect((res.children[1] as TagDebugNode).contextKey).toEqual('this')
    expect(res.children[2]).toBeInstanceOf(TemplateNode)
    expect((res.children[2] as TemplateNode).content).toEqual(' bar')
  })

  it('template with tag multiline', () => {
    const parser = NodeParser.init()
    const reader = new InlineReader('foo\n{{ debug }}\nbar')
    const res = parser.parse(reader)

    expect(res.children.length).toBe(3)
    expect(res.children[0]).toBeInstanceOf(TemplateNode)
    expect((res.children[0] as TemplateNode).content).toEqual('foo\n')
    expect(res.children[1]).toBeInstanceOf(TagDebugNode)
    expect((res.children[1] as TagDebugNode).contextKey).toEqual('this')
    expect(res.children[2]).toBeInstanceOf(TemplateNode)
    expect((res.children[2] as TemplateNode).content).toEqual('\nbar')
  })

  it('template, comment and tag multiline', () => {
    const parser = NodeParser.init()
    const reader = new InlineReader('foo\n{{ debug }}\n<!-- bar -->\nbaz')
    const res = parser.parse(reader)

    expect(res.children.length).toBe(5)
    expect(res.children[0]).toBeInstanceOf(TemplateNode)
    expect((res.children[0] as TemplateNode).content).toEqual('foo\n')
    expect(res.children[1]).toBeInstanceOf(TagDebugNode)
    expect((res.children[1] as TagDebugNode).contextKey).toEqual('this')
    expect(res.children[2]).toBeInstanceOf(TemplateNode)
    expect((res.children[2] as TemplateNode).content).toEqual('\n')
    expect(res.children[3]).toBeInstanceOf(CommentNode)
    expect((res.children[3] as CommentNode).content).toEqual('bar')
    expect(res.children[4]).toBeInstanceOf(TemplateNode)
    expect((res.children[4] as TemplateNode).content).toEqual('\nbaz')
  })

  it('inner content', () => {
    const parser = NodeParser.init()
    const reader = new InlineReader('bar\n{{ for }}foo{{ /for }}\nbaz')
    const res = parser.parse(reader)

    expect(res.children.length).toBe(3)
    expect(res.children[0]).toBeInstanceOf(TemplateNode)
    expect((res.children[0] as TemplateNode).content).toEqual('bar\n')
    expect(res.children[1]).toBeInstanceOf(TagForNode)
    expect((res.children[1] as TagForNode).children.length).toBe(1)
    expect(res.children[1].children[0]).toBeInstanceOf(TemplateNode)
    expect((res.children[1].children[0] as TemplateNode).content).toEqual('foo')
    expect(res.children[2]).toBeInstanceOf(TemplateNode)
    expect((res.children[2] as TemplateNode).content).toEqual('\nbaz')
  })

  describe('edge cases', () => {
    it('empty input', () => {
      const parser = NodeParser.init()
      const reader = new InlineReader('')
      const res = parser.parse(reader)

      expect(res.children.length).toBe(0)
      expect(res.type).toBe('root')
    })

    it('nested tags', () => {
      const parser = NodeParser.init()
      const reader = new InlineReader('{{ for }}{{ if:foo }}bar{{ /if }}{{ /for }}')
      const res = parser.parse(reader)

      expect(res.children.length).toBe(1)
      expect(res.children[0]).toBeInstanceOf(TagForNode)
      expect(res.children[0].children.length).toBe(1)
    })

    it('multiple root level tags', () => {
      const parser = NodeParser.init()
      const reader = new InlineReader('{{ debug }}{{ debug }}{{ debug }}')
      const res = parser.parse(reader)

      expect(res.children.length).toBe(3)
      expect(res.children[0]).toBeInstanceOf(TagDebugNode)
      expect(res.children[1]).toBeInstanceOf(TagDebugNode)
      expect(res.children[2]).toBeInstanceOf(TagDebugNode)
    })

    it('whitespace only', () => {
      const parser = NodeParser.init()
      const reader = new InlineReader('   \n\t   ')
      const res = parser.parse(reader)

      expect(res.children.length).toBe(1)
      expect(res.children[0]).toBeInstanceOf(TemplateNode)
      expect((res.children[0] as TemplateNode).content).toEqual('   \n\t   ')
    })

    it('comment inside tag content', () => {
      const parser = NodeParser.init()
      const reader = new InlineReader('{{ for }}<!-- comment -->content{{ /for }}')
      const res = parser.parse(reader)

      expect(res.children.length).toBe(1)
      expect(res.children[0]).toBeInstanceOf(TagForNode)
      expect(res.children[0].children.length).toBe(2)
      expect(res.children[0].children[0]).toBeInstanceOf(CommentNode)
      expect(res.children[0].children[1]).toBeInstanceOf(TemplateNode)
    })

    it('root node has type root', () => {
      const parser = NodeParser.init()
      const reader = new InlineReader('hello')
      const res = parser.parse(reader)

      expect(res.type).toBe('root')
    })
  })
})
