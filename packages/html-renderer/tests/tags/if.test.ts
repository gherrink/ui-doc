import { describe, expect, test } from '@jest/globals'
import { HtmlRendererInterface } from '@styleguide/html-renderer'

import tag from '../../src/tags/if'

function execTag(content: string, context: { [key: string]: any }): string {
  [...content.matchAll(tag.regex)].forEach(match => {
    content = tag.render({
      content, match, context, renderer: {} as HtmlRendererInterface,
    })
  })

  return content
}

describe('if tag', () => {
  test.each([
    '{{if:foo}}',
    '{{if:bar}}',
    '{{if:foo.bar}}',
    'foooo {{if:foo}} bar',
    '{{if:type=="html"}}',
  ])('should match: %s', content => {
    expect(content).toMatch(tag.regex)
  })

  test.each([
    { content: '{{if:foo}}content{{endif:foo}}', expected: 'content' },
    { content: '{{if:bar}}content{{endif:bar}}', expected: '' },
    { content: '{{if:baz}}content{{endif:baz}}', expected: '' },
  ])('should render content: $content', ({ content, expected }) => {
    const context = {
      foo: true,
      bar: false,
    }

    expect(execTag(content, context)).toBe(expected)
  })

  test.each([
    { content: '{{if:foo.bar}}content{{endif:foo.bar}}', expected: 'content' },
    { content: '{{if:foo.baz}}content{{endif:foo.baz}}', expected: '' },
    { content: '{{if:foo.qux}}content{{endif:foo.qux}}', expected: '' },
  ])('should render nested content: $content', ({ content, expected }) => {
    const context = {
      foo: {
        bar: true,
        baz: false,
      },
    }

    expect(execTag(content, context)).toBe(expected)
  })

  test.each([
    { content: '{{if:foo}}foo{{endif:foo}} {{if:bar}}bar{{endif:bar}}', expected: 'foo ' },
    { content: '{{if:foo}}foo{{endif:foo}} {{if:baz}}baz{{endif:baz}}', expected: 'foo baz' },
  ])('should render multiple content: $content', ({ content, expected }) => {
    const context = {
      foo: true,
      bar: false,
      baz: true,
    }

    expect(execTag(content, context)).toBe(expected)
  })

  test.each([
    { content: '{{if:foo==1}}content{{endif:foo}}', expected: 'content' },
    { content: '{{if:foo==2}}content{{endif:foo}}', expected: '' },
    { content: '{{if:foo!=1}}content{{endif:foo}}', expected: '' },
    { content: '{{if:foo!=2}}content{{endif:foo}}', expected: 'content' },
    { content: '{{if:bar==1}}content{{endif:bar}}', expected: '' },
    { content: '{{if:bar==2}}content{{endif:bar}}', expected: 'content' },
    { content: '{{if:bar!=1}}content{{endif:bar}}', expected: 'content' },
    { content: '{{if:bar!=2}}content{{endif:bar}}', expected: '' },
  ])('should render content with number comparison: $content', ({ content, expected }) => {
    const context = {
      foo: 1,
      bar: 2,
    }

    expect(execTag(content, context)).toBe(expected)
  })

  test.each([
    { content: '{{if:foo=="foo"}}content{{endif:foo}}', expected: 'content' },
    { content: '{{if:foo=="bar"}}content{{endif:foo}}', expected: '' },
    { content: '{{if:foo!="foo"}}content{{endif:foo}}', expected: '' },
    { content: '{{if:foo!="bar"}}content{{endif:foo}}', expected: 'content' },
    { content: '{{if:bar=="foo"}}content{{endif:bar}}', expected: '' },
    { content: '{{if:bar=="bar"}}content{{endif:bar}}', expected: 'content' },
    { content: '{{if:bar!="foo"}}content{{endif:bar}}', expected: 'content' },
    { content: '{{if:bar!="bar"}}content{{endif:bar}}', expected: '' },
  ])('should render content with string comparison: $content', ({ content, expected }) => {
    const context = {
      foo: 'foo',
      bar: 'bar',
    }

    expect(execTag(content, context)).toBe(expected)
  })
})
