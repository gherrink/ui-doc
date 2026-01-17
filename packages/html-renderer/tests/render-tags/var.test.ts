import { describe, expect, it } from 'vitest'

import { TagVarNode } from '../../src/nodes/tags/var'

describe('render tag var', () => {
  const context = { page: { title: 'World' }, title: 'Hello' }

  it('output', () => {
    const node = new TagVarNode({ contextKey: 'title' })

    expect(node.render(context)).toBe('Hello')
  })

  it('output deep', () => {
    const node = new TagVarNode({ contextKey: 'page.title' })

    expect(node.render(context)).toBe('World')
  })

  it('output nothing when not exist', () => {
    const node = new TagVarNode({ contextKey: 'foo' })

    expect(node.render(context)).toBe('')
  })
})
