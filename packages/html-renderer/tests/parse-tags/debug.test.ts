import { describe, expect, it } from 'vitest'

import { InlineReader } from '../../src/InlineReader'
import { NodeParser } from '../../src/NodeParser'
import { parseTagDebugNode, TagDebugNode } from '../../src/nodes/tags/debug'

describe('parser tag debug', () => {
  const parser = new NodeParser()

  parser.registerTagParser(parseTagDebugNode)

  it('simple tag', () => {
    const reader = new InlineReader('{{ debug }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagDebugNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagDebugNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('this')
  })

  it('with context', () => {
    const reader = new InlineReader('{{ debug:foo }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagDebugNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagDebugNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('foo')
  })

  it('ignores missing identifier and falls back to this', () => {
    const reader = new InlineReader('{{ debug: }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagDebugNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagDebugNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('this')
  })

  it('throws when separator is missing', () => {
    const reader = new InlineReader('{{ debug foo }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected separator/)
  })

  it('throws when invalid identifier is given', () => {
    const reader = new InlineReader('{{ debug:=== }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected tag identifier/)
  })
})
