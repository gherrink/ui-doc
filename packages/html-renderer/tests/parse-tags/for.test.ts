import { describe, expect, test } from '@jest/globals'

import { InlineReader } from '../../src/InlineReader'
import { NodeParser } from '../../src/NodeParser'
import { parseTagForNode, TagForNode } from '../../src/nodes/tags/for'
import { TemplateNode } from '../../src/nodes/TemplateNode'

describe('Parser tag for', () => {
  const parser = new NodeParser()

  parser.registerTagParser(parseTagForNode)

  test('simple tag', () => {
    const reader = new InlineReader('{{ for }}foo{{ /for }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagForNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagForNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.contextKey).toEqual('this')
  })

  test('with context', () => {
    const reader = new InlineReader('{{ for:foo }}foo{{ /for }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagForNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagForNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.contextKey).toEqual('foo')
  })

  test('ignores missing identifier and falls back to this', () => {
    const reader = new InlineReader('{{ for: }}foo{{ /for }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagForNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagForNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.contextKey).toEqual('this')
  })

  test('throws when separator is missing', () => {
    const reader = new InlineReader('{{ for foo }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected separator/)
  })

  test('throws when invalid identifier is given', () => {
    const reader = new InlineReader('{{ for:=== }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected tag identifier/)
  })
})
