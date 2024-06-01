import { describe, expect, test } from '@jest/globals'

import { parseTagIfNode, TagIfNode } from '../../src/nodes/tags/if'
import { TemplateNode } from '../../src/nodes/TemplateNode'
import { Parser } from '../../src/Parser'
import { Reader } from '../../src/Reader'

describe('Parser tag if', () => {
  const parser = new Parser()

  parser.registerTagParser(parseTagIfNode)

  test('only context key', () => {
    const reader = new Reader('{{ if:bar }}foo{{ /if }}')
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

  test('context key === context key', () => {
    const reader = new Reader('{{ if:bar === baz }}foo{{ /if }}')
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

  test('context key === string', () => {
    const reader = new Reader('{{ if:bar === "baz" }}foo{{ /if }}')
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

  test('string === context key', () => {
    const reader = new Reader('{{ if:"baz" === bar }}foo{{ /if }}')
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

  test('context key === number', () => {
    const reader = new Reader('{{ if:bar === 123.456 }}foo{{ /if }}')
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

  test('number === context key', () => {
    const reader = new Reader('{{ if:123.456 === bar }}foo{{ /if }}')
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

  test('context key === true', () => {
    const reader = new Reader('{{ if:bar === true }}foo{{ /if }}')
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

  test('true === context key', () => {
    const reader = new Reader('{{ if:true === bar }}foo{{ /if }}')
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

  test('context key === false', () => {
    const reader = new Reader('{{ if:bar === false }}foo{{ /if }}')
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

  test('false === context key', () => {
    const reader = new Reader('{{ if:false === bar }}foo{{ /if }}')
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

  test.each(['==', '===', '!=', '!==', '>', '>=', '<', '<='])('operator %s', operator => {
    const reader = new Reader(`{{ if:bar ${operator} baz }}foo{{ /if }}`)
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

  test('throws when first missing', () => {
    const reader = new Reader('{{ if: }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected first context key or value/)
  })

  test('throws when separator is missing', () => {
    const reader = new Reader('{{ if foo }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected separator/)
  })

  test('throws when invalid identifier is given', () => {
    const reader = new Reader('{{ if:=== }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected identifier or value/)
  })

  test('throws when first is not context key', () => {
    const reader = new Reader('{{ if:123 }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected context key when no operator is given/)
  })

  test('throws when missing second', () => {
    const reader = new Reader('{{ if:foo === }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Expected second context key or value when operator is given/)
  })

  test('throws when invalid operator', () => {
    const reader = new Reader('{{ if:foo <== bar }}')

    expect(() => {
      parser.parse(reader)
    }).toThrow(/Invalid operator <==/)
  })
})
