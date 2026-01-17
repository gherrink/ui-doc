import type { Renderer } from '../../src/Renderer.types'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TagPageNode } from '../../src/nodes/tags/page'

describe('render tag page', () => {
  const pageMock = vi.fn<Renderer['page']>(() => '').mockReturnValue('')
  const renderer = { page: pageMock as Renderer['page'] } as Renderer
  const context = { page: { foo: { bar: 'foo-bar' }, title: 'World' }, title: 'Hello' }

  beforeEach(() => {
    pageMock.mockClear()
  })

  it('expect call page function', () => {
    const node = new TagPageNode({})

    node.render({}, renderer)

    expect(pageMock).toHaveBeenCalledTimes(1)
    expect(pageMock).toHaveBeenCalledWith('default', {})
  })

  it('expect call page function with name', () => {
    const node = new TagPageNode({ name: 'foo' })

    node.render({}, renderer)

    expect(pageMock).toHaveBeenCalledTimes(1)
    expect(pageMock).toHaveBeenCalledWith('foo', {})
  })

  it('expect call page function with context', () => {
    const node = new TagPageNode({ name: 'foo-bar' })

    node.render(context, renderer)

    expect(pageMock).toHaveBeenCalledTimes(1)
    expect(pageMock).toHaveBeenCalledWith('foo-bar', context)
  })

  it('expect call page function with changed context', () => {
    const node = new TagPageNode({ contextKey: 'page', name: 'foo-bar' })

    node.render(context, renderer)

    expect(pageMock).toHaveBeenCalledTimes(1)
    expect(pageMock).toHaveBeenCalledWith('foo-bar', context.page)
  })

  it('expect call page function with changed context deep', () => {
    const node = new TagPageNode({ contextKey: 'page.foo', name: 'foo-bar' })

    node.render(context, renderer)

    expect(pageMock).toHaveBeenCalledTimes(1)
    expect(pageMock).toHaveBeenCalledWith('foo-bar', context.page.foo)
  })
})
