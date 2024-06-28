import { describe, expect, test } from '@jest/globals'

import { InlineReader } from '../../src/InlineReader'
import { NodeParser } from '../../src/NodeParser'
import { parseTagVarNode, TagVarNode } from '../../src/nodes/tags/var'

describe('Parser tag var', () => {
  const parser = new NodeParser()

  parser.registerTagParser(parseTagVarNode)

  test('should set simple context key', () => {
    const reader = new InlineReader('{{ var:test }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagVarNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagVarNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('test')
    expect(tag.escape).toBeFalsy()
  })

  test('should set nested context key', () => {
    const reader = new InlineReader('{{ var:foo.bar }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagVarNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagVarNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('foo.bar')
    expect(tag.escape).toBeFalsy()
  })

  test('should set escaped', () => {
    const reader = new InlineReader('{{ var:test escape }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagVarNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagVarNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('test')
    expect(tag.escape).toBeTruthy()
  })

  test('should set escaped with nested context key', () => {
    const reader = new InlineReader('{{ var:foo.bar escape }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagVarNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagVarNode)
    expect(tag.children.length).toBe(0)
    expect(tag.contextKey).toEqual('foo.bar')
    expect(tag.escape).toBeTruthy()
  })

  test('throws when context missing', () => {
    const reader = new InlineReader('{{ var }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected context key/)
  })

  test('throws when separator is missing', () => {
    const reader = new InlineReader('{{ var foo }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected separator/)
  })

  test('throws when invalid identifier is given', () => {
    const reader = new InlineReader('{{ var:=== }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected tag identifier/)
  })

  test('throws when context key is given but invalid escape', () => {
    const reader = new InlineReader('{{ var:foo.bar baz }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected escape/)
  })

  test('throws when context key and escape are given and more is added', () => {
    const reader = new InlineReader('{{ var:foo.bar escape baz }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected only context key followed by optional escape/)
  })
})
