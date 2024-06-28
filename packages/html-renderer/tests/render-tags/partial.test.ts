import { beforeEach, describe, expect, jest, test } from '@jest/globals'

import { TagPartialNode } from '../../src/nodes/tags/partial'
import type { Renderer } from '../../src/types'

describe('render tag partial', () => {
  const partialMock = jest.fn<Renderer['partial']>(() => '').mockReturnValue('')
  const renderer = {
    partial: partialMock as Renderer['partial'],
  } as Renderer
  const context = { page: { title: 'World' }, title: 'Hello' }

  beforeEach(() => {
    partialMock.mockClear()
  })

  test('expect call partial function', () => {
    const node = new TagPartialNode({ name: 'foo' })

    node.render({}, renderer)

    expect(partialMock).toHaveBeenCalledTimes(1)
    expect(partialMock).toHaveBeenCalledWith('foo', {})
  })

  test('expect call partial function with context', () => {
    const node = new TagPartialNode({ name: 'foo-bar' })

    node.render(context, renderer)

    expect(partialMock).toHaveBeenCalledTimes(1)
    expect(partialMock).toHaveBeenCalledWith('foo-bar', context)
  })

  test('expect call partial function with changed context', () => {
    const node = new TagPartialNode({ contextKey: 'page', name: 'foo-bar' })

    node.render(context, renderer)

    expect(partialMock).toHaveBeenCalledTimes(1)
    expect(partialMock).toHaveBeenCalledWith('foo-bar', context.page)
  })
})
