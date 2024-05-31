import { describe, expect, test } from '@jest/globals'

import { Lexer } from '../src/Lexer'
import { Reader } from '../src/Reader'

describe('Lexer', () => {
  test('basic peek', () => {
    const reader = new Reader('Hello World')
    const lexer = new Lexer(reader)

    expect(lexer.peek()).toStrictEqual({ type: 'template', content: 'Hello World' })
    expect(lexer.peek()).toStrictEqual({ type: 'template', content: 'Hello World' })
  })

  test('basic peek over eof', () => {
    const reader = new Reader('Hello World')
    const lexer = new Lexer(reader)

    expect(lexer.peek(2)).toStrictEqual([{ type: 'template', content: 'Hello World' }, undefined])
    expect(lexer.peek(2)).toStrictEqual([{ type: 'template', content: 'Hello World' }, undefined])
  })

  test('basic consume', () => {
    const reader = new Reader('Hello World')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'template', content: 'Hello World' })
    expect(lexer.consume()).toStrictEqual(undefined)
  })

  test('basic consume over eof', () => {
    const reader = new Reader('Hello World')
    const lexer = new Lexer(reader)

    expect(lexer.consume(2)).toStrictEqual([{ type: 'template', content: 'Hello World' }, undefined])
    expect(lexer.consume()).toStrictEqual(undefined)
  })

  test('consume template', () => {
    const reader = new Reader('Hello World')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'template', content: 'Hello World' })
  })

  test('consume comment', () => {
    const reader = new Reader('<!-- Foo Bar -->')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'comment', content: 'Foo Bar' })
  })

  test('consume multiple comments', () => {
    const reader = new Reader('<!-- Foo --><!-- Bar --><!-- Foo Bar -->')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'comment', content: 'Foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'comment', content: 'Bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'comment', content: 'Foo Bar' })
  })

  test('consume empty comment', () => {
    const reader = new Reader('<!--  --><!----><!-- -->')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'comment', content: '' })
    expect(lexer.consume()).toStrictEqual({ type: 'comment', content: '' })
    expect(lexer.consume()).toStrictEqual({ type: 'comment', content: '' })
  })

  test('consume template + comment + template', () => {
    const reader = new Reader('Foo\n<!-- Comment -->\nBar')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'template', content: 'Foo\n' })
    expect(lexer.consume()).toStrictEqual({ type: 'comment', content: 'Comment' })
    expect(lexer.consume()).toStrictEqual({ type: 'template', content: '\nBar' })
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
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume tag with separator', () => {
    const reader = new Reader('{{ foo : }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-separator' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume tag with identifier', () => {
    const reader = new Reader('{{ foo:bar }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-separator' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume tag end', () => {
    const reader = new Reader('{{ /foo }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-end' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag with two identifiers', () => {
    const reader = new Reader('{{ if foo === bar }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'operator', operator: '===' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier === string(")', () => {
    const reader = new Reader('{{ if foo === "bar" }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'operator', operator: '===' })
    expect(lexer.consume()).toStrictEqual({ type: 'string', value: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier === string(\')', () => {
    const reader = new Reader('{{ if foo === \'bar\' }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'operator', operator: '===' })
    expect(lexer.consume()).toStrictEqual({ type: 'string', value: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier === int', () => {
    const reader = new Reader('{{ if foo === 123 }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'operator', operator: '===' })
    expect(lexer.consume()).toStrictEqual({ type: 'number', value: 123 })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier === float', () => {
    const reader = new Reader('{{ if foo === 123.4567 }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'operator', operator: '===' })
    expect(lexer.consume()).toStrictEqual({ type: 'number', value: 123.4567 })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier === true', () => {
    const reader = new Reader('{{ if foo === true }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'operator', operator: '===' })
    expect(lexer.consume()).toStrictEqual({ type: 'boolean', value: true })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier === false', () => {
    const reader = new Reader('{{ if foo === false }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'operator', operator: '===' })
    expect(lexer.consume()).toStrictEqual({ type: 'boolean', value: false })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier !== identifier', () => {
    const reader = new Reader('{{ if foo !== bar }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'operator', operator: '!==' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier <= identifier', () => {
    const reader = new Reader('{{ if foo <= bar }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'operator', operator: '<=' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume conditional-tag identifier >= identifier', () => {
    const reader = new Reader('{{ if foo >= bar }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'operator', operator: '>=' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  test('consume tag with template', () => {
    const reader = new Reader('{{ if foo }}bar{{ /if }}')
    const lexer = new Lexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'identifier', name: 'foo' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
    expect(lexer.consume()).toStrictEqual({ type: 'template', content: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-end' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-identifier', name: 'if' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

})
