import { describe, expect, it } from 'vitest'

import { InlineReader } from '../../src/InlineReader'
import { NodeParser } from '../../src/NodeParser'
import { parseTagPartialNode, TagPartialNode } from '../../src/nodes/tags/partial'

describe('parser tag partial', () => {
  const parser = new NodeParser()

  parser.registerTagParser(parseTagPartialNode)

  it('simple tag', () => {
    const reader = new InlineReader('{{ partial:foo-bar }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagPartialNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagPartialNode)
    expect(tag.children.length).toBe(0)
    expect(tag.name).toEqual('foo-bar')
    expect(tag.contextKey).toEqual('this')
  })

  it('with context', () => {
    const reader = new InlineReader('{{ partial:foo-bar baz }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagPartialNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagPartialNode)
    expect(tag.children.length).toBe(0)
    expect(tag.name).toEqual('foo-bar')
    expect(tag.contextKey).toEqual('baz')
  })

  it('throws when name missing', () => {
    const reader = new InlineReader('{{ partial }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected partial name/)
  })

  it('throws when separator is missing', () => {
    const reader = new InlineReader('{{ partial foo }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected separator/)
  })

  it('throws when invalid name is given', () => {
    const reader = new InlineReader('{{ partial:=== }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected tag identifier/)
  })
})
