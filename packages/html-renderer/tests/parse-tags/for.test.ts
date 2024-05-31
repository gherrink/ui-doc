import { describe, expect, test } from '@jest/globals'

import { parseTagForNode, TagForNode } from '../../src/nodes/tags/for'
import { TemplateNode } from '../../src/nodes/TemplateNode'
import { Parser } from '../../src/Parser'
import { Reader } from '../../src/Reader'

describe('Parser tag for', () => {
  const parser = new Parser()

  parser.registerTagParser(parseTagForNode)

  test('simple tag', () => {
    const reader = new Reader('{{ for }}foo{{ /for }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagForNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagForNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.contextKey).toEqual('this')
  })

  test('with context', () => {
    const reader = new Reader('{{ for:foo }}foo{{ /for }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagForNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagForNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.contextKey).toEqual('foo')
  })

  test('ignores missing identifier and falls back to this', () => {
    const reader = new Reader('{{ for: }}foo{{ /for }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagForNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagForNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.contextKey).toEqual('this')
  })

  test('throws when separator is missing', () => {
    const reader = new Reader('{{ for foo }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected separator/)
  })

  test('throws when invalid identifier is given', () => {
    const reader = new Reader('{{ for:=== }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected tag identifier/)
  })
})
