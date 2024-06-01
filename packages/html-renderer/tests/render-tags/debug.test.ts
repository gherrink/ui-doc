import { describe, expect, test } from '@jest/globals'

import { TagDebugNode } from '../../src/nodes/tags/debug'

describe('render tag debug', () => {
  const context = { page: { title: 'World' }, title: 'Hello' }

  const debugOutput = (debug: any) => `<pre>${JSON.stringify(debug, null, 2)}</pre>`

  test('output this context', () => {
    const node = new TagDebugNode({})

    expect(node.render(context)).toBe(debugOutput(context))
  })

  test('output simple', () => {
    const node = new TagDebugNode({ contextKey: 'title' })

    expect(node.render(context)).toBe(debugOutput(context.title))
  })

  test('output object', () => {
    const node = new TagDebugNode({ contextKey: 'page' })

    expect(node.render(context)).toBe(debugOutput(context.page))
  })

  test('output nested', () => {
    const node = new TagDebugNode({ contextKey: 'page.title' })

    expect(node.render(context)).toBe(debugOutput(context.page.title))
  })

  test('output nested', () => {
    const node = new TagDebugNode({ contextKey: 'foo' })

    expect(node.render(context)).toBe('<pre>Current context for "foo" is empty</pre>')
  })
})
