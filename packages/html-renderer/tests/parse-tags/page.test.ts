import { describe, expect, test } from '@jest/globals'

import { InlineReader } from '../../src/InlineReader'
import { NodeParser } from '../../src/NodeParser'
import { parseTagPageNode, TagPageNode } from '../../src/nodes/tags/page'

describe('Parser tag page', () => {
  const parser = new NodeParser()

  parser.registerTagParser(parseTagPageNode)

  test('simple tag', () => {
    const reader = new InlineReader('{{ page }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagPageNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagPageNode)
    expect(tag.children.length).toBe(0)
    expect(tag.name).toEqual('default')
    expect(tag.contextKey).toEqual('this')
  })

  test('with name', () => {
    const reader = new InlineReader('{{ page:foo-bar }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagPageNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagPageNode)
    expect(tag.children.length).toBe(0)
    expect(tag.name).toEqual('foo-bar')
    expect(tag.contextKey).toEqual('this')
  })

  test('with context', () => {
    const reader = new InlineReader('{{ page:foo-bar baz }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagPageNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagPageNode)
    expect(tag.children.length).toBe(0)
    expect(tag.name).toEqual('foo-bar')
    expect(tag.contextKey).toEqual('baz')
  })

  test('throws when separator is missing', () => {
    const reader = new InlineReader('{{ page foo }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected separator/)
  })

  test('throws when invalid name is given', () => {
    const reader = new InlineReader('{{ page:=== }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected tag identifier/)
  })
})
