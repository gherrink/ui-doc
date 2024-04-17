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
  test('should match', () => {
    const contents = [
      '{{if:foo}}',
      '{{if:bar}}',
      '{{if:foo.bar}}',
      'foooo {{if:foo}} bar',
    ]

    contents.forEach(content => {
      expect(content).toMatch(tag.regex)
    })
  })

  test('should render content', () => {
    const context = {
      foo: true,
      bar: false,
    }
    const cases = [
      { content: '{{if:foo}}content{{endif:foo}}', expected: 'content' },
      { content: '{{if:bar}}content{{endif:bar}}', expected: '' },
      { content: '{{if:baz}}content{{endif:baz}}', expected: '' },
    ]

    cases.forEach(({ content, expected }) => {
      expect(execTag(content, context)).toBe(expected)
    })
  })

  test('sould render nested content', () => {
    const context = {
      foo: {
        bar: true,
        baz: false,
      },
    }
    const cases = [
      { content: '{{if:foo.bar}}content{{endif:foo.bar}}', expected: 'content' },
      { content: '{{if:foo.baz}}content{{endif:foo.baz}}', expected: '' },
      { content: '{{if:foo.qux}}content{{endif:foo.qux}}', expected: '' },
    ]

    cases.forEach(({ content, expected }) => {
      expect(execTag(content, context)).toBe(expected)
    })
  })

  test('should render multiple content', () => {
    const context = {
      foo: true,
      bar: false,
      baz: true,
    }
    const cases = [
      { content: '{{if:foo}}foo{{endif:foo}} {{if:bar}}bar{{endif:bar}}', expected: 'foo ' },
      { content: '{{if:foo}}foo{{endif:foo}} {{if:baz}}baz{{endif:baz}}', expected: 'foo baz' },
    ]

    cases.forEach(({ content, expected }) => {
      expect(execTag(content, context)).toBe(expected)
    })
  })
})
