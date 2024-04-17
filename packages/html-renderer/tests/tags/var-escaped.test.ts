import { describe, expect, test } from '@jest/globals'
import { HtmlRendererInterface } from '@styleguide/html-renderer'

import tag from '../../src/tags/var-escaped'

function execTag(content: string, context: { [key: string]: any }, renderer: HtmlRendererInterface): string {
  [...content.matchAll(tag.regex)].forEach(match => {
    content = tag.render({
      content, match, context, renderer,
    })
  })

  return content
}

describe('var tag', () => {
  test('should match', () => {
    const contents = [
      '{{var-escaped:page}}',
      '{{var-escaped:page.title}}',
      '{{var-escaped:page.description.text}}',
      'foooo {{var-escaped:page}} bar',
    ]

    contents.forEach(content => {
      expect(content).toMatch(tag.regex)
    })
  })

  test('should not match', () => {
    const contents = [
      '{{foo:page}}',
      '{{foo:page.title}}',
      'foooo {{bar:page}} bar',
    ]

    contents.forEach(content => {
      expect(content).not.toMatch(tag.regex)
    })
  })

  test('should render simple variable', () => {
    const content = '{{var-escaped:text}}'
    const context = {
      text: 'Hello World',
    }

    const result = execTag(content, context, {} as HtmlRendererInterface)

    expect(result).toBe('Hello World')
  })

  test('should render multiple variable', () => {
    const content = '{{var-escaped:greeting}} {{var-escaped:target}}'
    const context = {
      greeting: 'Hello',
      target: 'World',
    }

    const result = execTag(content, context, {} as HtmlRendererInterface)

    expect(result).toBe('Hello World')
  })

  test('should render nested variable', () => {
    const content = '{{var-escaped:page.title}}'
    const context = {
      page: {
        title: 'Hello World',
      },
    }

    const result = execTag(content, context, {} as HtmlRendererInterface)

    expect(result).toBe('Hello World')
  })

  test('should ignore missing variable', () => {
    const content = '{{var-escaped:page.title}}'
    const context = {
      page: {},
    }

    const result = execTag(content, context, {} as HtmlRendererInterface)

    expect(result).toBe('')
  })

  test('should render variable in text', () => {
    const content = 'Hello {{var-escaped:target}}!'
    const context = {
      target: 'World',
    }

    const result = execTag(content, context, {} as HtmlRendererInterface)

    expect(result).toBe('Hello World!')
  })

  test('should ignore other variables in context', () => {
    const content = 'Hello {{var-escaped:target}}!'
    const context = {
      target: 'World',
      foo: 'bar',
    }

    const result = execTag(content, context, {} as HtmlRendererInterface)

    expect(result).toBe('Hello World!')
  })

  test('should escape html', () => {
    const content = '{{var-escaped:html}}'
    const cases = [
      {
        context: {
          html: '<h1>Hello World</h1>',
        },
        expected: '&lt;h1&gt;Hello World&lt;/h1&gt;',
      },
    ]

    cases.forEach(({ context, expected }) => {
      const result = execTag(content, context, {} as HtmlRendererInterface)

      expect(result).toBe(expected)
    })
  })
})
