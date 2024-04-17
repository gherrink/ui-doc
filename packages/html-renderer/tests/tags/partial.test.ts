import {
  describe, expect, jest, test,
} from '@jest/globals'
import { HtmlRendererInterface } from '@styleguide/html-renderer'

import tag from '../../src/tags/partial'

function execTag(content: string, context: { [key: string]: any }, renderer: HtmlRendererInterface): string {
  [...content.matchAll(tag.regex)].forEach(match => {
    content = tag.render({
      content, match, context, renderer,
    })
  })

  return content
}

describe('partial tag', () => {
  test('should match', () => {
    const contents = [
      '{{partial:index}}',
      '{{partial:default}}',
      '{{partial:foo-bar-layout}}',
      'foooo {{partial:test}} bar',
    ]

    contents.forEach(content => {
      expect(content).toMatch(tag.regex)
    })
  })

  test('should not match', () => {
    const contents = [
      '{{partial:foo.bar}}',
      '{{foo:partial}}',
      '{{foo:partial.title}}',
      'foooo {{bar:partial}} bar',
    ]

    contents.forEach(content => {
      expect(content).not.toMatch(tag.regex)
    })
  })

  test('should extract layout', () => {
    const partialMock = jest.fn<HtmlRendererInterface['partial']>(() => '')
    const context = {}
    const cases = [
      { content: '{{partial:layout}}', expectedLayout: 'layout' },
      { content: '{{partial:my-custom-layout}}', expectedLayout: 'my-custom-layout' },
    ]

    cases.forEach(({ content, expectedLayout }) => {
      execTag(content, context, { partial: partialMock as HtmlRendererInterface['partial'] } as HtmlRendererInterface)

      expect(partialMock).toBeCalledWith(expectedLayout, {})
      partialMock.mockClear()
    })
  })

  test('should not change context', () => {
    const partialMock = jest.fn<HtmlRendererInterface['partial']>(() => '')
    const content = '{{partial:layout}}'
    const context = {
      title: 'Fooo',
      partial: {
        title: 'Partial Title',
      },
    }

    execTag(content, context, { partial: partialMock as HtmlRendererInterface['partial'] } as HtmlRendererInterface)
    expect(partialMock).toBeCalledWith('layout', context)
  })

  test('should render', () => {
    const content = '{{partial:layout}}'
    const context = {
      title: 'Hello World',
    }

    const result = execTag(content, context, {
      partial: (name, ctx) => ctx?.title || '',
    } as HtmlRendererInterface)

    expect(result).toBe('Hello World')
  })
})
