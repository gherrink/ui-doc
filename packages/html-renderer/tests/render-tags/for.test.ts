import { describe, expect, jest, test } from '@jest/globals'

import { Node } from '../../src/nodes'
import { TagForNode } from '../../src/nodes/tags/for'
import type { Renderer } from '../../src/Renderer.types'

describe('render tag for', () => {
  const renderer = {} as Renderer

  test('using array context expect call content node', () => {
    const context = [1]
    const contentNodeRenderMock = jest.fn<Node['render']>().mockReturnValue('content')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagForNode({})

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('content')
    expect(contentNodeRenderMock).toHaveBeenCalledTimes(1)
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      { _contextKey: 'this', _loop: { index: 0, value: 1 }, _parent: context },
      renderer,
    )
  })

  test('using array context expect call content node multiple times', () => {
    const context = [1, 2, 3]
    const contentNodeRenderMock = jest.fn<Node['render']>().mockReturnValue('content ')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagForNode({})

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('content content content ')
    expect(contentNodeRenderMock).toHaveBeenCalledTimes(context.length)
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      { _contextKey: 'this', _loop: { index: 0, value: context[0] }, _parent: context },
      renderer,
    )
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      { _contextKey: 'this', _loop: { index: 1, value: context[1] }, _parent: context },
      renderer,
    )
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      { _contextKey: 'this', _loop: { index: 2, value: context[2] }, _parent: context },
      renderer,
    )
  })

  test('using array context with objects should make the object content available in for context', () => {
    const context = [{ foo: 1 }, { foo: 2 }, { foo: 3 }]
    const contentNodeRenderMock = jest.fn<Node['render']>().mockReturnValue('content ')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagForNode({})

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('content content content ')
    expect(contentNodeRenderMock).toHaveBeenCalledTimes(context.length)
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      {
        _contextKey: 'this',
        _loop: { index: 0, value: context[0] },
        _parent: context,
        foo: 1,
      },
      renderer,
    )
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      {
        _contextKey: 'this',
        _loop: { index: 1, value: context[1] },
        _parent: context,
        foo: 2,
      },
      renderer,
    )
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      {
        _contextKey: 'this',
        _loop: { index: 2, value: context[2] },
        _parent: context,
        foo: 3,
      },
      renderer,
    )
  })

  test('using object context expect call content node multiple times', () => {
    // eslint-disable-next-line sort-keys
    const context = { foo: 1, bar: 2, baz: 3 }
    const contentNodeRenderMock = jest.fn<Node['render']>().mockReturnValue('content ')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagForNode({})

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('content content content ')
    expect(contentNodeRenderMock).toHaveBeenCalledTimes(Object.keys(context).length)
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      {
        _contextKey: 'this',
        _loop: { index: 0, key: 'foo', value: context.foo },
        _parent: context,
      },
      renderer,
    )
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      {
        _contextKey: 'this',
        _loop: { index: 1, key: 'bar', value: context.bar },
        _parent: context,
      },
      renderer,
    )
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      {
        _contextKey: 'this',
        _loop: { index: 2, key: 'baz', value: context.baz },
        _parent: context,
      },
      renderer,
    )
  })

  test('using object context with objects should make the object content available in for context', () => {
    // eslint-disable-next-line sort-keys
    const context = { foo: { test: 1 }, bar: { test: 2 }, baz: { test: 3 } }
    const contentNodeRenderMock = jest.fn<Node['render']>().mockReturnValue('content ')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagForNode({})

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('content content content ')
    expect(contentNodeRenderMock).toHaveBeenCalledTimes(Object.keys(context).length)
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      {
        _contextKey: 'this',
        _loop: { index: 0, key: 'foo', value: context.foo },
        _parent: context,
        test: 1,
      },
      renderer,
    )
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      {
        _contextKey: 'this',
        _loop: { index: 1, key: 'bar', value: context.bar },
        _parent: context,
        test: 2,
      },
      renderer,
    )
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      {
        _contextKey: 'this',
        _loop: { index: 2, key: 'baz', value: context.baz },
        _parent: context,
        test: 3,
      },
      renderer,
    )
  })

  test('should render empty if context is empty', () => {
    const contextArray: any[] = []
    const contextObject = {}
    const contentNodeRenderMock = jest.fn<Node['render']>().mockReturnValue('content')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagForNode({})

    node.append(contentNode)

    expect(node.render(contextArray, renderer)).toBe('')
    expect(contentNodeRenderMock).not.toHaveBeenCalled()

    contentNodeRenderMock.mockClear()

    expect(node.render(contextObject, renderer)).toBe('')
    expect(contentNodeRenderMock).not.toHaveBeenCalled()
  })

  test('should change to array context with context key', () => {
    // eslint-disable-next-line sort-keys
    const context = { foo: [1], baz: 2 }
    const contentNodeRenderMock = jest.fn<Node['render']>().mockReturnValue('content')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagForNode({ contextKey: 'foo' })

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('content')
    expect(contentNodeRenderMock).toHaveBeenCalledTimes(1)
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      { _contextKey: 'foo', _loop: { index: 0, value: 1 }, _parent: context },
      renderer,
    )
  })

  test('should change to object context with context key', () => {
    // eslint-disable-next-line sort-keys
    const context = { foo: { bar: 1 }, baz: 2 }
    const contentNodeRenderMock = jest.fn<Node['render']>().mockReturnValue('content')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagForNode({ contextKey: 'foo' })

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('content')
    expect(contentNodeRenderMock).toHaveBeenCalledTimes(1)
    expect(contentNodeRenderMock).toHaveBeenCalledWith(
      { _contextKey: 'foo', _loop: { index: 0, key: 'bar', value: 1 }, _parent: context },
      renderer,
    )
  })

  test.each([
    new TagForNode({ contextKey: 'foo' }),
    new TagForNode({ contextKey: 'bar' }),
    new TagForNode({ contextKey: 'baz' }),
    new TagForNode({ contextKey: 'fooBar' }),
    new TagForNode({ contextKey: 'barFoo' }),
    new TagForNode({ contextKey: 'nonExist' }),
  ])('should render empty if context is not an array or object', node => {
    const context = {
      bar: 123,
      barFoo: undefined,
      baz: false,
      foo: 'Hello World',
      fooBar: true,
    }
    const contentNodeRenderMock = jest.fn<Node['render']>().mockReturnValue('content')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('')
    expect(contentNodeRenderMock).not.toHaveBeenCalled()
  })
})
