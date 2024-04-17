import {
  describe, expect, jest, test,
} from '@jest/globals'
import { HtmlRendererInterface } from '@styleguide/html-renderer'

import tag from '../../src/tags/partial-context'

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
      '{{partial-context:index}}',
      '{{partial-context:default}}',
      '{{partial-context:layout:context-key}}',
      '{{partial-context:layout:context.key}}',
      '{{partial-context:foo-bar-layout}}',
      'foooo {{partial-context:test}} bar',
    ]

    contents.forEach(content => {
      expect(content).toMatch(tag.regex)
    })
  })

  test('should not match', () => {
    const contents = [
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
      { content: '{{partial-context:name}}', expectedName: 'name' },
      { content: '{{partial-context:my-custom-name}}', expectedName: 'my-custom-name' },
    ]

    cases.forEach(({ content, expectedName }) => {
      execTag(content, context, { partial: partialMock as HtmlRendererInterface['partial'] } as HtmlRendererInterface)

      expect(partialMock).toBeCalledWith(expectedName, undefined)
      partialMock.mockClear()
    })
  })

  test('should change context with name', () => {
    const partialMock = jest.fn<HtmlRendererInterface['partial']>(() => '')
    const content = '{{partial-context:foo}}'
    const context = {
      title: 'Fooo',
      foo: {
        title: 'Partial Title',
      },
    }

    execTag(content, context, { partial: partialMock as HtmlRendererInterface['partial'] } as HtmlRendererInterface)
    expect(partialMock).toBeCalledWith('foo', context.foo)
  })

  test('should change context with name deep', () => {
    const partialMock = jest.fn<HtmlRendererInterface['partial']>(() => '')
    const content = '{{partial-context:foo.bar}}'
    const context = {
      title: 'Fooo',
      foo: {
        bar: {
          title: 'Partial Title',
        },
      },
    }

    execTag(content, context, { partial: partialMock as HtmlRendererInterface['partial'] } as HtmlRendererInterface)
    expect(partialMock).toBeCalledWith('foo-bar', context.foo.bar)
  })

  test('should change context with key', () => {
    const partialMock = jest.fn<HtmlRendererInterface['partial']>(() => '')
    const content = '{{partial-context:foo:bar}}'
    const context = {
      title: 'Fooo',
      bar: {
        title: 'Partial Title',
      },
    }

    execTag(content, context, { partial: partialMock as HtmlRendererInterface['partial'] } as HtmlRendererInterface)
    expect(partialMock).toBeCalledWith('foo', context.bar)
  })

  test('should change context with key deep', () => {
    const partialMock = jest.fn<HtmlRendererInterface['partial']>(() => '')
    const content = '{{partial-context:foo:bar.baz}}'
    const context = {
      title: 'Fooo',
      bar: {
        baz: {
          title: 'Partial Title',
        },
      },
    }

    execTag(content, context, { partial: partialMock as HtmlRendererInterface['partial'] } as HtmlRendererInterface)
    expect(partialMock).toBeCalledWith('foo', context.bar.baz)
  })

  test('should give undefined context', () => {
    const partialMock = jest.fn<HtmlRendererInterface['partial']>(() => '')
    const context = {}
    const cases = [
      { content: '{{partial-context:foo}}', expectedName: 'foo' },
      { content: '{{partial-context:foo.bar}}', expectedName: 'foo-bar' },
      { content: '{{partial-context:foo:bar}}', expectedName: 'foo' },
      { content: '{{partial-context:foo:bar.baz}}', expectedName: 'foo' },
    ]

    cases.forEach(({ content, expectedName }) => {
      execTag(content, context, { partial: partialMock as HtmlRendererInterface['partial'] } as HtmlRendererInterface)
      expect(partialMock).toBeCalledWith(expectedName, undefined)
      partialMock.mockClear()
    })
  })

  test('should render', () => {
    const content = '{{partial-context:foo}}'
    const context = {
      foo: {
        title: 'Hello World',
      },
    }

    const result = execTag(content, context, {
      partial: (name, ctx) => ctx?.title || '',
    } as HtmlRendererInterface)

    expect(result).toBe('Hello World')
  })
})
