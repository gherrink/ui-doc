import {
  describe, expect, jest, test,
} from '@jest/globals'
import { HtmlRendererInterface } from '@styleguide/html-renderer'

import tag from '../../src/tags/debug'

function execTag(content: string, context: { [key: string]: any }): string {
  [...content.matchAll(tag.regex)].forEach(match => {
    content = tag.render({
      content, match, context, renderer: {} as HtmlRendererInterface,
    })
  })

  return content
}

describe('debug tag', () => {
  test('should match', () => {
    const contents = [
      '{{debug}}',
      '{{debug:index}}',
      '{{debug:default}}',
      '{{debug:foo-bar-debug}}',
      '{{debug:foo.bar}}',
      'foooo {{debug:test}} bar',
    ]

    contents.forEach(content => {
      expect(content).toMatch(tag.regex)
    })
  })

  test('should not match', () => {
    const contents = [
      '{{foo:debug}}',
      '{{foo:debug.title}}',
      'foooo {{bar:debug}} bar',
    ]

    contents.forEach(content => {
      expect(content).not.toMatch(tag.regex)
    })
  })

  test('should render', () => {
    const context = {
      title: 'Hello World',
      page: {
        title: 'Page Title',
      },
    }
    const cases = [
      { content: '{{debug}}', expectedValue: JSON.stringify(context) },
      { content: '{{debug:title}}', expectedValue: JSON.stringify(context.title) },
      { content: '{{debug:page}}', expectedValue: JSON.stringify(context.page) },
      { content: '{{debug:page.title}}', expectedValue: JSON.stringify(context.page.title) },
      { content: '{{debug:foo}}', expectedValue: 'undefined' },
    ]

    cases.forEach(({ content, expectedValue }) => {
      expect(execTag(content, context)).toBe(expectedValue)
    })
  })
})
