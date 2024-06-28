import { describe, expect, jest, test } from '@jest/globals'

import type { Node, NodeOperator } from '../../src/nodes/Node'
import { TagIfNode } from '../../src/nodes/tags/if'
import type { Renderer } from '../../src/types'

describe('render tag if', () => {
  const renderer = {} as Renderer

  test('using value true condition expect call content node', () => {
    const context = {}
    const contentNodeRenderMock = jest.fn().mockReturnValue('content')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagIfNode({ firstValue: true })

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('content')
    expect(contentNodeRenderMock).toHaveBeenCalledTimes(1)
    expect(contentNodeRenderMock).toHaveBeenCalledWith(context, renderer)
  })

  test('using value false condition expect not call content node', () => {
    const context = {}
    const contentNodeRenderMock = jest.fn().mockReturnValue('content')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagIfNode({ firstValue: false })

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('')
    expect(contentNodeRenderMock).not.toHaveBeenCalled()
  })

  test('using context true condition expect call content node', () => {
    const context = { foo: true }
    const contentNodeRenderMock = jest.fn().mockReturnValue('content')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagIfNode({ firstContextKey: 'foo' })

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('content')
    expect(contentNodeRenderMock).toHaveBeenCalledTimes(1)
    expect(contentNodeRenderMock).toHaveBeenCalledWith(context, renderer)
  })

  test('using context false condition expect not call content node', () => {
    const context = { foo: false }
    const contentNodeRenderMock = jest.fn().mockReturnValue('content')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagIfNode({ firstContextKey: 'foo' })

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('')
    expect(contentNodeRenderMock).not.toHaveBeenCalled()
  })

  test('using non existent context key expect not call content node', () => {
    const context = {}
    const contentNodeRenderMock = jest.fn().mockReturnValue('content')
    const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
    const node = new TagIfNode({ firstContextKey: 'foo' })

    node.append(contentNode)

    expect(node.render(context, renderer)).toBe('')
    expect(contentNodeRenderMock).not.toHaveBeenCalled()
  })

  test.each([true, 1, '1', 'a string'])(
    'using values that result in true condition expect call content node',
    firstValue => {
      const context = {}
      const contentNodeRenderMock = jest.fn().mockReturnValue('content')
      const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
      const node = new TagIfNode({ firstValue })

      node.append(contentNode)

      expect(node.render(context, renderer)).toBe('content')
      expect(contentNodeRenderMock).toHaveBeenCalledTimes(1)
      expect(contentNodeRenderMock).toHaveBeenCalledWith(context, renderer)
    },
  )

  test.each([false, undefined, 0, ''])(
    'using values that result in false condition expect not call content node',
    firstValue => {
      const context = {}
      const contentNodeRenderMock = jest.fn().mockReturnValue('content')
      const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
      const node = new TagIfNode({ firstValue })

      node.append(contentNode)

      expect(node.render(context, renderer)).toBe('')
      expect(contentNodeRenderMock).not.toHaveBeenCalled()
    },
  )

  test.each([
    [true, '===', true],
    [true, '==', true],
    [1, '===', 1],
    [1, '==', 1],
    ['1', '===', '1'],
    ['1', '==', '1'],
    ['foo', '===', 'foo'],
    ['bar', '==', 'bar'],
    [true, '!==', false],
    [true, '!=', false],
    [1, '!==', 2],
    [1, '!=', 2],
    ['1', '!==', '2'],
    ['1', '!=', '2'],
    ['foo', '!==', 'bar'],
    ['foo', '!=', 'bar'],
    [1, '>', 0],
    [1, '>=', 1],
    [1, '<', 2],
    [1, '<=', 1],
    [1, '>', -1],
    [1, '>=', -1],
    [1, '<', 2],
    [1, '<=', 2],
    ['1', '>', '0'],
    ['1', '>=', '1'],
    ['1', '<', '2'],
    ['1', '<=', '1'],
    ['1', '>', '-1'],
    ['1', '>=', '-1'],
    ['1', '<', '2'],
    ['1', '<=', '2'],
  ])(
    'using values that result in true condition with operator %s %s %s expect call content node',
    (firstValue, operator, secondValue) => {
      const context = {}
      const contentNodeRenderMock = jest.fn().mockReturnValue('content')
      const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
      const node = new TagIfNode({ firstValue, operator: operator as NodeOperator, secondValue })

      node.append(contentNode)

      expect(node.render(context, renderer)).toBe('content')
      expect(contentNodeRenderMock).toHaveBeenCalledTimes(1)
      expect(contentNodeRenderMock).toHaveBeenCalledWith(context, renderer)
    },
  )

  test.each([
    [true, '===', false],
    [true, '==', false],
    [1, '===', 2],
    [1, '==', 2],
    ['1', '===', '2'],
    ['1', '==', '2'],
    ['foo', '===', 'bar'],
    ['bar', '==', 'foo'],
    [true, '!==', true],
    [true, '!=', true],
    [1, '!==', 1],
    [1, '!=', 1],
    ['1', '!==', '1'],
    ['1', '!=', '1'],
    ['foo', '!==', 'foo'],
    ['foo', '!=', 'foo'],
    [1, '>', 1],
    [1, '>=', 2],
    [1, '<', 1],
    [1, '<=', 0],
    [1, '>', 2],
    [1, '>=', 2],
    [1, '<', -1],
    [1, '<=', -1],
    ['1', '>', '1'],
    ['1', '>=', '2'],
    ['1', '<', '1'],
    ['1', '<=', '0'],
    ['1', '>', '2'],
    ['1', '>=', '2'],
    ['1', '<', '-1'],
    ['1', '<=', '-1'],
  ])(
    'using values that result in false condition with operator %s %s %s expect not call content node',
    (firstValue, operator, secondValue) => {
      const context = {}
      const contentNodeRenderMock = jest.fn().mockReturnValue('content')
      const contentNode = { render: contentNodeRenderMock as Node['render'] } as Node
      const node = new TagIfNode({ firstValue, operator: operator as NodeOperator, secondValue })

      node.append(contentNode)

      expect(node.render(context, renderer)).toBe('')
      expect(contentNodeRenderMock).not.toHaveBeenCalled()
    },
  )
})
