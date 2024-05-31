import {
  beforeEach, describe, expect, jest,
  test,
} from '@jest/globals'

import { TagPageNode } from '../../src/nodes/tags/page'
import type { HtmlRendererInterface } from '../../src/types'

describe('render tag page', () => {
  const pageMock = jest.fn<HtmlRendererInterface['page']>(() => '').mockReturnValue('')
  const renderer = { page: pageMock as HtmlRendererInterface['page'] } as HtmlRendererInterface
  const context = { title: 'Hello', page: { title: 'World', foo: { bar: 'foo-bar' } } }

  beforeEach(() => {
    pageMock.mockClear()
  })

  test('expect call page function', () => {
    const node = new TagPageNode({})

    node.render({}, renderer)

    expect(pageMock).toHaveBeenCalledTimes(1)
    expect(pageMock).toHaveBeenCalledWith('default', {})
  })

  test('expect call page function with name', () => {
    const node = new TagPageNode({ name: 'foo' })

    node.render({}, renderer)

    expect(pageMock).toHaveBeenCalledTimes(1)
    expect(pageMock).toHaveBeenCalledWith('foo', {})
  })

  test('expect call page function with context', () => {
    const node = new TagPageNode({ name: 'foo-bar' })

    node.render(context, renderer)

    expect(pageMock).toHaveBeenCalledTimes(1)
    expect(pageMock).toHaveBeenCalledWith('foo-bar', context)
  })

  test('expect call page function with changed context', () => {
    const node = new TagPageNode({ name: 'foo-bar', contextKey: 'page' })

    node.render(context, renderer)

    expect(pageMock).toHaveBeenCalledTimes(1)
    expect(pageMock).toHaveBeenCalledWith('foo-bar', context.page)
  })

  test('expect call page function with changed context deep', () => {
    const node = new TagPageNode({ name: 'foo-bar', contextKey: 'page.foo' })

    node.render(context, renderer)

    expect(pageMock).toHaveBeenCalledTimes(1)
    expect(pageMock).toHaveBeenCalledWith('foo-bar', context.page.foo)
  })
})
