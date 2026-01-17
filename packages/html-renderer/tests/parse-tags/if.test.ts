import { describe, expect, it } from 'vitest'

import { InlineReader } from '../../src/InlineReader'
import { NodeParser } from '../../src/NodeParser'
import { parseTagIfNode, TagIfNode } from '../../src/nodes/tags/if'
import { TemplateNode } from '../../src/nodes/TemplateNode'

describe('parser tag if', () => {
  const parser = new NodeParser()

  parser.registerTagParser(parseTagIfNode)

  it('only context key', () => {
    const reader = new InlineReader('{{ if:bar }}foo{{ /if }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagIfNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagIfNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.options.firstContextKey).toEqual('bar')
    expect(tag.options.firstValue).toBeUndefined()
    expect(tag.options.operator).toBeUndefined()
    expect(tag.options.secondContextKey).toBeUndefined()
    expect(tag.options.secondValue).toBeUndefined()
  })

  it('context key === context key', () => {
    const reader = new InlineReader('{{ if:bar === baz }}foo{{ /if }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagIfNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagIfNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.options.firstContextKey).toEqual('bar')
    expect(tag.options.firstValue).toBeUndefined()
    expect(tag.options.operator).toEqual('===')
    expect(tag.options.secondContextKey).toEqual('baz')
    expect(tag.options.secondValue).toBeUndefined()
  })

  it('context key === string', () => {
    const reader = new InlineReader('{{ if:bar === "baz" }}foo{{ /if }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagIfNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagIfNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.options.firstContextKey).toEqual('bar')
    expect(tag.options.firstValue).toBeUndefined()
    expect(tag.options.operator).toEqual('===')
    expect(tag.options.secondContextKey).toBeUndefined()
    expect(tag.options.secondValue).toEqual('baz')
  })

  it('string === context key', () => {
    const reader = new InlineReader('{{ if:"baz" === bar }}foo{{ /if }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagIfNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagIfNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.options.firstContextKey).toBeUndefined()
    expect(tag.options.firstValue).toEqual('baz')
    expect(tag.options.operator).toEqual('===')
    expect(tag.options.secondContextKey).toEqual('bar')
    expect(tag.options.secondValue).toBeUndefined()
  })

  it('context key === number', () => {
    const reader = new InlineReader('{{ if:bar === 123.456 }}foo{{ /if }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagIfNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagIfNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.options.firstContextKey).toEqual('bar')
    expect(tag.options.firstValue).toBeUndefined()
    expect(tag.options.operator).toEqual('===')
    expect(tag.options.secondContextKey).toBeUndefined()
    expect(tag.options.secondValue).toEqual(123.456)
  })

  it('number === context key', () => {
    const reader = new InlineReader('{{ if:123.456 === bar }}foo{{ /if }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagIfNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagIfNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.options.firstContextKey).toBeUndefined()
    expect(tag.options.firstValue).toEqual(123.456)
    expect(tag.options.operator).toEqual('===')
    expect(tag.options.secondContextKey).toEqual('bar')
    expect(tag.options.secondValue).toBeUndefined()
  })

  it('context key === true', () => {
    const reader = new InlineReader('{{ if:bar === true }}foo{{ /if }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagIfNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagIfNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.options.firstContextKey).toEqual('bar')
    expect(tag.options.firstValue).toBeUndefined()
    expect(tag.options.operator).toEqual('===')
    expect(tag.options.secondContextKey).toBeUndefined()
    expect(tag.options.secondValue).toEqual(true)
  })

  it('true === context key', () => {
    const reader = new InlineReader('{{ if:true === bar }}foo{{ /if }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagIfNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagIfNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.options.firstContextKey).toBeUndefined()
    expect(tag.options.firstValue).toEqual(true)
    expect(tag.options.operator).toEqual('===')
    expect(tag.options.secondContextKey).toEqual('bar')
    expect(tag.options.secondValue).toBeUndefined()
  })

  it('context key === false', () => {
    const reader = new InlineReader('{{ if:bar === false }}foo{{ /if }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagIfNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagIfNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.options.firstContextKey).toEqual('bar')
    expect(tag.options.firstValue).toBeUndefined()
    expect(tag.options.operator).toEqual('===')
    expect(tag.options.secondContextKey).toBeUndefined()
    expect(tag.options.secondValue).toEqual(false)
  })

  it('false === context key', () => {
    const reader = new InlineReader('{{ if:false === bar }}foo{{ /if }}')
    const res = parser.parse(reader)
    const tag = res.children[0] as TagIfNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagIfNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.options.firstContextKey).toBeUndefined()
    expect(tag.options.firstValue).toEqual(false)
    expect(tag.options.operator).toEqual('===')
    expect(tag.options.secondContextKey).toEqual('bar')
    expect(tag.options.secondValue).toBeUndefined()
  })

  it.each(['==', '===', '!=', '!==', '>', '>=', '<', '<='])('operator %s', operator => {
    const reader = new InlineReader(`{{ if:bar ${operator} baz }}foo{{ /if }}`)
    const res = parser.parse(reader)
    const tag = res.children[0] as TagIfNode

    expect(res.children.length).toBe(1)
    expect(res.children[0]).toBeInstanceOf(TagIfNode)
    expect(tag.children.length).toBe(1)
    expect(tag.children[0]).toBeInstanceOf(TemplateNode)
    expect(tag.options.firstContextKey).toEqual('bar')
    expect(tag.options.firstValue).toBeUndefined()
    expect(tag.options.operator).toEqual(operator)
    expect(tag.options.secondContextKey).toEqual('baz')
    expect(tag.options.secondValue).toBeUndefined()
  })

  it('throws when first missing', () => {
    const reader = new InlineReader('{{ if: }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected first context key or value/)
  })

  it('throws when separator is missing', () => {
    const reader = new InlineReader('{{ if foo }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected separator/)
  })

  it('throws when invalid identifier is given', () => {
    const reader = new InlineReader('{{ if:=== }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected identifier or value/)
  })

  it('throws when first is not context key', () => {
    const reader = new InlineReader('{{ if:123 }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected context key when no operator is given/)
  })

  it('throws when missing second', () => {
    const reader = new InlineReader('{{ if:foo === }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected second context key or value when operator is given/)
  })

  it('throws when invalid operator', () => {
    const reader = new InlineReader('{{ if:foo <== bar }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Invalid operator <==/)
  })
})
