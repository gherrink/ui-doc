import { describe, expect, it } from 'vitest'

import { TagDebugNode } from '../../src/nodes/tags/debug'

describe('render tag debug', () => {
  const context = { page: { title: 'World' }, title: 'Hello' }

  const debugOutput = (debug: unknown): string => `<pre>${JSON.stringify(debug, null, 2)}</pre>`

  it('output this context', () => {
    const node = new TagDebugNode({})

    expect(node.render(context)).toBe(debugOutput(context))
  })

  it('output simple', () => {
    const node = new TagDebugNode({ contextKey: 'title' })

    expect(node.render(context)).toBe(debugOutput(context.title))
  })

  it('output object', () => {
    const node = new TagDebugNode({ contextKey: 'page' })

    expect(node.render(context)).toBe(debugOutput(context.page))
  })

  it('output nested', () => {
    const node = new TagDebugNode({ contextKey: 'page.title' })

    expect(node.render(context)).toBe(debugOutput(context.page.title))
  })

  it('output empty message for non-existent key', () => {
    const node = new TagDebugNode({ contextKey: 'foo' })

    expect(node.render(context)).toBe('<pre>Current context for "foo" is empty</pre>')
  })
})
