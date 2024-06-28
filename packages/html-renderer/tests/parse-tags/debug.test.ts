import { describe, expect, test } from '@jest/globals'

import { InlineReader } from '../../src/InlineReader'
import { NodeParser } from '../../src/NodeParser'
import { parseTagDebugNode, TagDebugNode } from '../../src/nodes/tags/debug'

describe('Parser tag debug', () => {
  const parser = new NodeParser()

  parser.registerTagParser(parseTagDebugNode)

  test('simple tag', () => {
    const reader = new InlineReader('{{ debug }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagDebugNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagDebugNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('this')
  })

  test('with context', () => {
    const reader = new InlineReader('{{ debug:foo }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagDebugNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagDebugNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('foo')
  })

  test('ignores missing identifier and falls back to this', () => {
    const reader = new InlineReader('{{ debug: }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagDebugNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagDebugNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('this')
  })

  test('throws when separator is missing', () => {
    const reader = new InlineReader('{{ debug foo }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected separator/)
  })

  test('throws when invalid identifier is given', () => {
    const reader = new InlineReader('{{ debug:=== }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected tag identifier/)
  })
})
