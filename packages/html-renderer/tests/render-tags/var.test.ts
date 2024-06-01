import { describe, expect, test } from '@jest/globals'

import { TagVarNode } from '../../src/nodes/tags/var'

describe('render tag var', () => {
  const context = { page: { title: 'World' }, title: 'Hello' }

  test('output', () => {
    const node = new TagVarNode({ contextKey: 'title' })

    expect(node.render(context)).toBe('Hello')
  })

  test('output deep', () => {
    const node = new TagVarNode({ contextKey: 'page.title' })

    expect(node.render(context)).toBe('World')
  })

  test('output nothing when not exist', () => {
    const node = new TagVarNode({ contextKey: 'foo' })

    expect(node.render(context)).toBe('')
  })
})
