import {
  describe, expect, jest, test,
} from '@jest/globals'
import { HtmlRendererInterface } from '@styleguide/html-renderer'

import tag from '../../src/tags/page'

function execTag(content: string, context: { [key: string]: any }, renderer: HtmlRendererInterface): string {
  [...content.matchAll(tag.regex)].forEach(match => {
    content = tag.render({
      content, match, context, renderer,
    })
  })

  return content
}

describe('page tag', () => {
  test('should match', () => {
    const contents = [
      '{{page}}',
      '{{page:index}}',
      '{{page:default}}',
      '{{page:foo-bar-page}}',
      'foooo {{page:test}} bar',
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

  test('should extract layout', () => {
    const pageMock = jest.fn<HtmlRendererInterface['page']>(() => '')
    const context = {}
    const cases = [
      { content: '{{page}}', expectedLayout: 'default' },
      { content: '{{page:page.id}}', expectedLayout: 'page.id' },
      { content: '{{page:layout}}', expectedLayout: 'layout' },
      { content: '{{page:my-custom-layout}}', expectedLayout: 'my-custom-layout' },
    ]

    cases.forEach(({ content, expectedLayout }) => {
      execTag(content, context, { page: pageMock as HtmlRendererInterface['page'] } as HtmlRendererInterface)

      expect(pageMock).toBeCalledWith(expectedLayout, {})
      pageMock.mockClear()
    })
  })

  test('should use page context', () => {
    const pageMock = jest.fn<HtmlRendererInterface['page']>(() => '')
    const content = '{{page:layout}}'
    const context = {
      title: 'Fooo',
      page: {
        title: 'Page Title',
      },
    }

    execTag(content, context, { page: pageMock as HtmlRendererInterface['page'] } as HtmlRendererInterface)
    expect(pageMock).toBeCalledWith('layout', context.page)
  })

  test('should use page layout name', () => {
    const pageMock = jest.fn<HtmlRendererInterface['page']>(() => '')
    const content = '{{page:pageLayoutName}}'
    const context = {
      title: 'Fooo',
      pageLayoutName: 'layout',
      page: {
        title: 'Page Title',
      },
    }

    execTag(content, context, { page: pageMock as HtmlRendererInterface['page'] } as HtmlRendererInterface)
    expect(pageMock).toBeCalledWith('layout', context.page)
  })

  test('should render', () => {
    const content = '{{page:layout}}'
    const context = {
      page: {
        title: 'Hello World',
      },
    }

    const result = execTag(content, context, {
      page: (name, ctx) => ctx?.title || '',
    } as HtmlRendererInterface)

    expect(result).toBe('Hello World')
  })
})
