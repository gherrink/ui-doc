import { describe, expect, test } from '@jest/globals'

import { parseTagPartialNode, TagPartialNode } from '../../src/nodes/tags/partial'
import { Parser } from '../../src/Parser'
import { Reader } from '../../src/Reader'

describe('Parser tag partial', () => {
  const parser = new Parser()

  parser.registerTagParser(parseTagPartialNode)

  test('simple tag', () => {
    const reader = new Reader('{{ partial:foo-bar }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagPartialNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagPartialNode)
    expect(tag.children.length).toBe(0)
    expect(tag.name).toEqual('foo-bar')
    expect(tag.contextKey).toEqual('this')
  })

  test('with context', () => {
    const reader = new Reader('{{ partial:foo-bar baz }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagPartialNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagPartialNode)
    expect(tag.children.length).toBe(0)
    expect(tag.name).toEqual('foo-bar')
    expect(tag.contextKey).toEqual('baz')
  })

  test('throws when name missing', () => {
    const reader = new Reader('{{ partial }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected partial name/)
  })

  test('throws when separator is missing', () => {
    const reader = new Reader('{{ partial foo }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected separator/)
  })

  test('throws when invalid name is given', () => {
    const reader = new Reader('{{ partial:=== }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected tag identifier/)
  })
})
