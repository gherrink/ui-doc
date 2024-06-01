import { describe, expect, test } from '@jest/globals'

import { Lexer } from '../src/Lexer'
import { Reader } from '../src/Reader'

describe('Lexer', () => {
  test('basic peek', () => {
    const reader = new Reader('Hello World')
    const lexer = new Lexer(reader)

    expect(lexer.peek()).toStrictEqual({ content: 'Hello World', type: 'template' })
    expect(lexer.peek()).toStrictEqual({ content: 'Hello World', type: 'template' })
  })

  test('basic peek over eof', () => {
    const reader = new Reader('Hello World')
    const lexer = new Lexer(reader)

    expect(lexer.peek(2)).toStrictEqual([{ content: 'Hello World', type: 'template' }, undefined])
    expect(lexer.peek(2)).toStrictEqual([{ content: 'Hello World', type: 'template' }, undefined])
  })

  test('basic consume', () => {
    const reader = new Reader('Hello World')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: 'Hello World', type: 'template' })
    expect(lexer.consume()).toStrictEqual(undefined)
  })

  test('basic consume over eof', () => {
    const reader = new Reader('Hello World')
    const lexer = new Lexer(reader)

    expect(lexer.consume(2)).toStrictEqual([
      { content: 'Hello World', type: 'template' },
      undefined,
    ])
    expect(lexer.consume()).toStrictEqual(undefined)
  })

  test('consume template', () => {
    const reader = new Reader('Hello World')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: 'Hello World', type: 'template' })
  })

  test('consume comment', () => {
    const reader = new Reader('<!-- Foo Bar -->')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: 'Foo Bar', type: 'comment' })
  })

  test('consume multiple comments', () => {
    const reader = new Reader('<!-- Foo --><!-- Bar --><!-- Foo Bar -->')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: 'Foo', type: 'comment' })
    expect(lexer.consume()).toStrictEqual({ content: 'Bar', type: 'comment' })
    expect(lexer.consume()).toStrictEqual({ content: 'Foo Bar', type: 'comment' })
  })

  test('consume empty comment', () => {
    const reader = new Reader('<!--  --><!----><!-- -->')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: '', type: 'comment' })
    expect(lexer.consume()).toStrictEqual({ content: '', type: 'comment' })
    expect(lexer.consume()).toStrictEqual({ content: '', type: 'comment' })
  })

  test('consume template + comment + template', () => {
    const reader = new Reader('Foo\n<!-- Comment -->\nBar')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: 'Foo\n', type: 'template' })
    expect(lexer.consume()).toStrictEqual({ content: 'Comment', type: 'comment' })
    expect(lexer.consume()).toStrictEqual({ content: '\nBar', type: 'template' })
  })

  test('consume tag open close', () => {
    const reader = new Reader('{{ }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume tag identified', () => {
    const reader = new Reader('{{ foo }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume tag with separator', () => {
    const reader = new Reader('{{ foo : }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-separator' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume tag with identifier', () => {
    const reader = new Reader('{{ foo:bar }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', ype: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-separator' })
    expect(lexer.consume()).toStrictEqual({ name: 'bar', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume tag end', () => {
    const reader = new Reader('{{ /foo }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-end' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag with two identifiers', () => {
    const reader = new Reader('{{ if foo === bar }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ name: 'bar', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier === string(")', () => {
    const reader = new Reader('{{ if foo === "bar" }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'string', value: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test("consume conditional-tag identifier === string(')", () => {
    const reader = new Reader("{{ if foo === 'bar' }}")
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'string', value: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier === int', () => {
    const reader = new Reader('{{ if foo === 123 }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'number', value: 123 })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier === float', () => {
    const reader = new Reader('{{ if foo === 123.4567 }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'number', value: 123.4567 })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier === true', () => {
    const reader = new Reader('{{ if foo === true }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'boolean', value: true })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier === false', () => {
    const reader = new Reader('{{ if foo === false }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'boolean', value: false })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier !== identifier', () => {
    const reader = new Reader('{{ if foo !== bar }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '!==', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ name: 'bar', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier <= identifier', () => {
    const reader = new Reader('{{ if foo <= bar }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '<=', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ name: 'bar', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier >= identifier', () => {
    const reader = new Reader('{{ if foo >= bar }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '>=', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ name: 'bar', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume tag with template', () => {
    const reader = new Reader('{{ if foo }}bar{{ /if }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
    expect(lexer.consume()).toStrictEqual({ content: 'bar', type: 'template' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-end' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })
})
