import { describe, expect, it } from 'vitest'

import { HtmlCurlyBraceLexer } from '../src/HtmlCurlyBraceLexer'
import { InlineReader } from '../src/InlineReader'

describe('lexer', () => {
  it('basic peek', () => {
    const reader = new InlineReader('Hello World')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.peek()).toStrictEqual({ content: 'Hello World', type: 'template' })
    expect(lexer.peek()).toStrictEqual({ content: 'Hello World', type: 'template' })
  })

  it('basic peek over eof', () => {
    const reader = new InlineReader('Hello World')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.peek(2)).toStrictEqual([{ content: 'Hello World', type: 'template' }, undefined])
    expect(lexer.peek(2)).toStrictEqual([{ content: 'Hello World', type: 'template' }, undefined])
  })

  it('basic consume', () => {
    const reader = new InlineReader('Hello World')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: 'Hello World', type: 'template' })
    expect(lexer.consume()).toStrictEqual(undefined)
  })

  it('basic consume over eof', () => {
    const reader = new InlineReader('Hello World')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume(2)).toStrictEqual([
      { content: 'Hello World', type: 'template' },
      undefined,
    ])
    expect(lexer.consume()).toStrictEqual(undefined)
  })

  it('consume template', () => {
    const reader = new InlineReader('Hello World')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: 'Hello World', type: 'template' })
  })

  it('consume comment', () => {
    const reader = new InlineReader('<!-- Foo Bar -->')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: 'Foo Bar', type: 'comment' })
  })

  it('consume multiple comments', () => {
    const reader = new InlineReader('<!-- Foo --><!-- Bar --><!-- Foo Bar -->')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: 'Foo', type: 'comment' })
    expect(lexer.consume()).toStrictEqual({ content: 'Bar', type: 'comment' })
    expect(lexer.consume()).toStrictEqual({ content: 'Foo Bar', type: 'comment' })
  })

  it('consume empty comment', () => {
    const reader = new InlineReader('<!--  --><!----><!-- -->')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: '', type: 'comment' })
    expect(lexer.consume()).toStrictEqual({ content: '', type: 'comment' })
    expect(lexer.consume()).toStrictEqual({ content: '', type: 'comment' })
  })

  it('consume template + comment + template', () => {
    const reader = new InlineReader('Foo\n<!-- Comment -->\nBar')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ content: 'Foo\n', type: 'template' })
    expect(lexer.consume()).toStrictEqual({ content: 'Comment', type: 'comment' })
    expect(lexer.consume()).toStrictEqual({ content: '\nBar', type: 'template' })
  })

  it('consume tag open close', () => {
    const reader = new InlineReader('{{ }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume tag identified', () => {
    const reader = new InlineReader('{{ foo }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume tag with separator', () => {
    const reader = new InlineReader('{{ foo : }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-separator' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume tag with identifier', () => {
    const reader = new InlineReader('{{ foo:bar }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-separator' })
    expect(lexer.consume()).toStrictEqual({ name: 'bar', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume tag end', () => {
    const reader = new InlineReader('{{ /foo }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-end' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume conditional-tag with two identifiers', () => {
    const reader = new InlineReader('{{ if foo === bar }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ name: 'bar', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume conditional-tag identifier === string(")', () => {
    const reader = new InlineReader('{{ if foo === "bar" }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'string', value: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume conditional-tag identifier === string(\')', () => {
    const reader = new InlineReader('{{ if foo === \'bar\' }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'string', value: 'bar' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume conditional-tag identifier === int', () => {
    const reader = new InlineReader('{{ if foo === 123 }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'number', value: 123 })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume conditional-tag identifier === float', () => {
    const reader = new InlineReader('{{ if foo === 123.4567 }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'number', value: 123.4567 })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume conditional-tag identifier === true', () => {
    const reader = new InlineReader('{{ if foo === true }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'boolean', value: true })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume conditional-tag identifier === false', () => {
    const reader = new InlineReader('{{ if foo === false }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ type: 'boolean', value: false })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume conditional-tag identifier !== identifier', () => {
    const reader = new InlineReader('{{ if foo !== bar }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '!==', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ name: 'bar', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume conditional-tag identifier <= identifier', () => {
    const reader = new InlineReader('{{ if foo <= bar }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '<=', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ name: 'bar', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume conditional-tag identifier >= identifier', () => {
    const reader = new InlineReader('{{ if foo >= bar }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

    expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
    expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
    expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ operator: '>=', type: 'operator' })
    expect(lexer.consume()).toStrictEqual({ name: 'bar', type: 'identifier' })
    expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
  })

  it('consume tag with template', () => {
    const reader = new InlineReader('{{ if foo }}bar{{ /if }}')
    const lexer = new HtmlCurlyBraceLexer(reader)

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

  describe('edge cases', () => {
    it('consume empty input', () => {
      const reader = new InlineReader('')
      const lexer = new HtmlCurlyBraceLexer(reader)

      expect(lexer.consume()).toStrictEqual(undefined)
    })

    it('consume whitespace only', () => {
      const reader = new InlineReader('   \n\t  ')
      const lexer = new HtmlCurlyBraceLexer(reader)

      expect(lexer.consume()).toStrictEqual({ content: '   \n\t  ', type: 'template' })
    })

    it('consume single curly brace not as tag', () => {
      const reader = new InlineReader('{ single brace }')
      const lexer = new HtmlCurlyBraceLexer(reader)

      expect(lexer.consume()).toStrictEqual({ content: '{ single brace }', type: 'template' })
    })

    it('consume escaped-like content in template', () => {
      const reader = new InlineReader('Price: $100 & more')
      const lexer = new HtmlCurlyBraceLexer(reader)

      expect(lexer.consume()).toStrictEqual({ content: 'Price: $100 & more', type: 'template' })
    })

    it('consume negative number as identifier (lexer limitation)', () => {
      // Note: The lexer treats negative numbers as identifiers
      // This is a known limitation - negative numbers must be handled at parser/runtime level
      const reader = new InlineReader('{{ if foo === -5 }}')
      const lexer = new HtmlCurlyBraceLexer(reader)

      expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
      expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
      expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
      expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
      expect(lexer.consume()).toStrictEqual({ name: '-5', type: 'identifier' })
      expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
    })

    it('consume string with special characters', () => {
      const reader = new InlineReader('{{ if foo === "hello world!" }}')
      const lexer = new HtmlCurlyBraceLexer(reader)

      expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
      expect(lexer.consume()).toStrictEqual({ name: 'if', type: 'tag-identifier' })
      expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
      expect(lexer.consume()).toStrictEqual({ operator: '===', type: 'operator' })
      expect(lexer.consume()).toStrictEqual({ type: 'string', value: 'hello world!' })
      expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
    })

    it('consume comment with dashes inside', () => {
      const reader = new InlineReader('<!-- foo -- bar -->')
      const lexer = new HtmlCurlyBraceLexer(reader)

      expect(lexer.consume()).toStrictEqual({ content: 'foo -- bar', type: 'comment' })
    })

    it('consume adjacent tags without space', () => {
      const reader = new InlineReader('{{ var:foo }}{{ var:bar }}')
      const lexer = new HtmlCurlyBraceLexer(reader)

      expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
      expect(lexer.consume()).toStrictEqual({ name: 'var', type: 'tag-identifier' })
      expect(lexer.consume()).toStrictEqual({ type: 'tag-separator' })
      expect(lexer.consume()).toStrictEqual({ name: 'foo', type: 'identifier' })
      expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
      expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
      expect(lexer.consume()).toStrictEqual({ name: 'var', type: 'tag-identifier' })
      expect(lexer.consume()).toStrictEqual({ type: 'tag-separator' })
      expect(lexer.consume()).toStrictEqual({ name: 'bar', type: 'identifier' })
      expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
    })

    it('consume deeply nested context key', () => {
      const reader = new InlineReader('{{ var:a.b.c.d.e }}')
      const lexer = new HtmlCurlyBraceLexer(reader)

      expect(lexer.consume()).toStrictEqual({ type: 'tag-open' })
      expect(lexer.consume()).toStrictEqual({ name: 'var', type: 'tag-identifier' })
      expect(lexer.consume()).toStrictEqual({ type: 'tag-separator' })
      expect(lexer.consume()).toStrictEqual({ name: 'a.b.c.d.e', type: 'identifier' })
      expect(lexer.consume()).toStrictEqual({ type: 'tag-close' })
    })
  })
})
