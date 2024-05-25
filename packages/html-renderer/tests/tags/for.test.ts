import {
  describe, expect, jest, test,
} from '@jest/globals'
import { HtmlRendererInterface } from '@styleguide/html-renderer'

import tag from '../../src/tags/for'

function execTag(content: string, context: { [key: string]: any }, renderer: HtmlRendererInterface): string {
  [...content.matchAll(tag.regex)].forEach(match => {
    content = tag.render({
      content, match, context, renderer,
    })
  })

  return content
}

describe('for tag', () => {
  test('should match', () => {
    const contents = [
      '{{for:foo}}',
      '{{for:bar}}',
      '{{for:foo.bar}}',
      'foooo {{for:foo}} bar',
    ]

    contents.forEach(content => {
      expect(content).toMatch(tag.regex)
    })
  })

  test('should render content', () => {
    const renderMock = jest.fn<HtmlRendererInterface['render']>((content: string) => content)
    const context = {
      foo: [1, 2, 3],
      bar: [],
    }
    const cases = [
      { content: '{{for}}content {{endfor}}', expected: 'content content ' },
      { content: '{{for:foo}}content {{endfor:foo}}', expected: 'content content content ' },
      { content: '{{for:bar}}content{{endfor:bar}}', expected: '' },
      { content: '{{for:baz}}content{{endfor:baz}}', expected: '' },
    ]

    cases.forEach(({ content, expected }) => {
      expect(execTag(content, context, { render: renderMock as HtmlRendererInterface['render'] } as HtmlRendererInterface)).toBe(expected)
    })
  })

  test('should replace for loop but leave the other content', () => {
    const renderMock = jest.fn<HtmlRendererInterface['render']>((content: string) => content)
    const context = {}
    const cases = [
      { content: 'before {{for:foo}}content{{endfor:foo}} after', expected: 'before  after' },
      { content: 'before\n{{for:bar}}content{{endfor:bar}}\nafter', expected: 'before\n\nafter' },
      { content: '{{for:baz}}content{{endfor:baz}}', expected: '' },
    ]

    cases.forEach(({ content, expected }) => {
      expect(execTag(content, context, { render: renderMock as HtmlRendererInterface['render'] } as HtmlRendererInterface)).toBe(expected)
    })
  })

  test('should give correct array context', () => {
    const renderMock = jest.fn<HtmlRendererInterface['render']>((content: string) => content)
    const context = [1, 2, 3]
    const content = '{{for}}content{{endfor}}'

    expect(execTag(content, context, { render: renderMock as HtmlRendererInterface['render'] } as HtmlRendererInterface)).toBe('contentcontentcontent')
    expect(renderMock).toHaveBeenCalledTimes(3)
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'this', _loop: { index: 0, value: 1 } })
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'this', _loop: { index: 1, value: 2 } })
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'this', _loop: { index: 2, value: 3 } })
  })

  test('should give correct object context', () => {
    const renderMock = jest.fn<HtmlRendererInterface['render']>((content: string) => content)
    const context = { foo: 1, bar: 2, baz: 3 }
    const content = '{{for}}content{{endfor}}'

    expect(execTag(content, context, { render: renderMock as HtmlRendererInterface['render'] } as HtmlRendererInterface)).toBe('contentcontentcontent')
    expect(renderMock).toHaveBeenCalledTimes(3)
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'this', _loop: { index: 0, key: 'foo', value: 1 } })
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'this', _loop: { index: 1, key: 'bar', value: 2 } })
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'this', _loop: { index: 2, key: 'baz', value: 3 } })
  })

  test('should handle simple key', () => {
    const renderMock = jest.fn<HtmlRendererInterface['render']>((content: string) => content)
    const context = {
      foo: [1, 2, 3],
    }
    const content = '{{for:foo}}content{{endfor:foo}}'

    expect(execTag(content, context, { render: renderMock as HtmlRendererInterface['render'] } as HtmlRendererInterface)).toBe('contentcontentcontent')
    expect(renderMock).toHaveBeenCalledTimes(3)
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'foo', _loop: { index: 0, value: 1 } })
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'foo', _loop: { index: 1, value: 2 } })
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'foo', _loop: { index: 2, value: 3 } })
  })

  test('should handle nested keys', () => {
    const renderMock = jest.fn<HtmlRendererInterface['render']>((content: string) => content)
    const context = {
      foo: {
        bar: [1, 2, 3],
      },
    }
    const content = '{{for:foo.bar}}content{{endfor:foo.bar}}'

    expect(execTag(content, context, { render: renderMock as HtmlRendererInterface['render'] } as HtmlRendererInterface)).toBe('contentcontentcontent')
    expect(renderMock).toHaveBeenCalledTimes(3)
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'foo.bar', _loop: { index: 0, value: 1 } })
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'foo.bar', _loop: { index: 1, value: 2 } })
    expect(renderMock).toHaveBeenCalledWith('content', { _parent: context, _contextKey: 'foo.bar', _loop: { index: 2, value: 3 } })
  })

  test('should handle object array', () => {
    const renderMock = jest.fn<HtmlRendererInterface['render']>((content: string) => content)
    const context = [{ test: 1 }, { test: 2 }, { test: 3 }]
    const content = '{{for}}content{{endfor}}'

    expect(execTag(content, context, { render: renderMock as HtmlRendererInterface['render'] } as HtmlRendererInterface)).toBe('contentcontentcontent')
    expect(renderMock).toHaveBeenCalledTimes(3)
    expect(renderMock).toHaveBeenCalledWith('content', {
      test: 1, _parent: context, _contextKey: 'this', _loop: { index: 0, value: { test: 1 } },
    })
    expect(renderMock).toHaveBeenCalledWith('content', {
      test: 2,
      _parent: context,
      _contextKey: 'this',
      _loop: { index: 1, value: { test: 2 } },
    })
    expect(renderMock).toHaveBeenCalledWith('content', {
      test: 3,
      _parent: context,
      _contextKey: 'this',
      _loop: { index: 2, value: { test: 3 } },
    })
  })

  test('should handle object with objects', () => {
    const renderMock = jest.fn<HtmlRendererInterface['render']>((content: string) => content)
    const context = { foo: { test: 1 }, bar: { test: 2 }, baz: { test: 3 } }
    const content = '{{for}}content{{endfor}}'

    expect(execTag(content, context, { render: renderMock as HtmlRendererInterface['render'] } as HtmlRendererInterface)).toBe('contentcontentcontent')
    expect(renderMock).toHaveBeenCalledTimes(3)
    expect(renderMock).toHaveBeenCalledWith('content', {
      test: 1,
      _parent: context,
      _contextKey: 'this',
      _loop: { index: 0, key: 'foo', value: { test: 1 } },
    })
    expect(renderMock).toHaveBeenCalledWith('content', {
      test: 2,
      _parent: context,
      _contextKey: 'this',
      _loop: { index: 1, key: 'bar', value: { test: 2 } },
    })
    expect(renderMock).toHaveBeenCalledWith('content', {
      test: 3,
      _parent: context,
      _contextKey: 'this',
      _loop: { index: 2, key: 'baz', value: { test: 3 } },
    })
  })

  test('should render multiple content', () => {
    const renderMock = jest.fn<HtmlRendererInterface['render']>((content: string) => content)
    const context = {
      foo: [1, 2, 3],
      bar: [1, 2],
    }
    const content = '{{for:foo}}foo{{endfor:foo}} {{for:bar}}bar{{endfor:bar}}'
    const expected = 'foofoofoo barbar'

    expect(execTag(content, context, { render: renderMock as HtmlRendererInterface['render'] } as HtmlRendererInterface)).toBe(expected)
  })
})
