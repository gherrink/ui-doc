import { describe, expect, test } from '@jest/globals'

import { SyntaxError } from '../src/errors/SyntaxError'
import { CommentNode, TagDebugNode, TagForNode, TemplateNode } from '../src/nodes'
import { Parser } from '../src/Parser'
import { Reader } from '../src/Reader'

describe('Parser', () => {
  test('template', () => {
    const parser = Parser.init()
    const reader = new Reader('foo bar')
    const res = parser.parse(reader)
    const tag = res.children[0] as TemplateNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.children.length).toBe(0)
    expect(tag.content).toEqual('foo bar')
  })

  test('template multiline', () => {
    const parser = Parser.init()
    const reader = new Reader('foo bar\nbaz\nfoobar')
    const res = parser.parse(reader)
    const tag = res.children[0] as TemplateNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.children.length).toBe(0)
    expect(tag.content).toEqual('foo bar\nbaz\nfoobar')
  })

  test('comment', () => {
    const parser = Parser.init()
    const reader = new Reader('<!-- foo bar -->')
    const res = parser.parse(reader)
    const tag = res.children[0] as CommentNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(CommentNode)
    expect(tag.children.length).toBe(0)
    expect(tag.content).toEqual('foo bar')
  })

  test('comment not closed', () => {
    const parser = Parser.init()
    const reader = new Reader('<!-- foo bar ->')
    const res = parser.parse(reader)
    const tag = res.children[0] as CommentNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(CommentNode)
    expect(tag.children.length).toBe(0)
    expect(tag.content).toEqual('foo bar ->')
  })

  test('tag', () => {
    const parser = Parser.init()
    const reader = new Reader('{{ debug }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagDebugNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagDebugNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('this')
  })

  test('to throw when tag not closed', () => {
    const parser = Parser.init()
    const reader = new Reader('{{ debug }')

    expect(() => {
      parser.parse(reader)
    }).toThrow(SyntaxError)
  })

  test('to throw when tag not ended', () => {
    const parser = Parser.init()
    const reader = new Reader('{{ for }}inner')

    expect(() => {
      parser.parse(reader)
    }).toThrow(SyntaxError)
  })

  test('template with tag', () => {
    const parser = Parser.init()
    const reader = new Reader('foo {{ debug }} bar')
    const res = parser.parse(reader)

    expect(res.children.length).toBe(3)
    expect(res.children[0]).toBeInstanceOf(TemplateNode)
    expect((res.children[0] as TemplateNode).content).toEqual('foo ')
    expect(res.children[1]).toBeInstanceOf(TagDebugNode)
    expect((res.children[1] as TagDebugNode).contextKey).toEqual('this')
    expect(res.children[2]).toBeInstanceOf(TemplateNode)
    expect((res.children[2] as TemplateNode).content).toEqual(' bar')
  })

  test('template with tag multiline', () => {
    const parser = Parser.init()
    const reader = new Reader('foo\n{{ debug }}\nbar')
    const res = parser.parse(reader)

    expect(res.children.length).toBe(3)
    expect(res.children[0]).toBeInstanceOf(TemplateNode)
    expect((res.children[0] as TemplateNode).content).toEqual('foo\n')
    expect(res.children[1]).toBeInstanceOf(TagDebugNode)
    expect((res.children[1] as TagDebugNode).contextKey).toEqual('this')
    expect(res.children[2]).toBeInstanceOf(TemplateNode)
    expect((res.children[2] as TemplateNode).content).toEqual('\nbar')
  })

  test('template, comment and tag multiline', () => {
    const parser = Parser.init()
    const reader = new Reader('foo\n{{ debug }}\n<!-- bar -->\nbaz')
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

  test('inner content', () => {
    const parser = Parser.init()
    const reader = new Reader('bar\n{{ for }}foo{{ /for }}\nbaz')
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
})
