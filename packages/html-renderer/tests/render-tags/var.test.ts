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

  describe('escape functionality', () => {
    it('should not escape HTML when escape is false', () => {
      const htmlContext = { content: '<script>alert("XSS")</script>' }
      const node = new TagVarNode({ contextKey: 'content', escape: false })

      expect(node.render(htmlContext)).toBe('<script>alert("XSS")</script>')
    })

    it('should escape HTML when escape is true', () => {
      const htmlContext = { content: '<script>alert("XSS")</script>' }
      const node = new TagVarNode({ contextKey: 'content', escape: true })

      expect(node.render(htmlContext)).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
      )
    })

    it('should escape ampersand', () => {
      const htmlContext = { content: 'Tom & Jerry' }
      const node = new TagVarNode({ contextKey: 'content', escape: true })

      expect(node.render(htmlContext)).toBe('Tom &amp; Jerry')
    })

    it('should escape single quotes', () => {
      const htmlContext = { content: 'It\'s working' }
      const node = new TagVarNode({ contextKey: 'content', escape: true })

      expect(node.render(htmlContext)).toBe('It&#039;s working')
    })

    it('should escape multiple special characters', () => {
      const htmlContext = { content: '<div class="test">Hello & \'World\'</div>' }
      const node = new TagVarNode({ contextKey: 'content', escape: true })

      expect(node.render(htmlContext)).toBe(
        '&lt;div class=&quot;test&quot;&gt;Hello &amp; &#039;World&#039;&lt;/div&gt;',
      )
    })
  })

  describe('edge cases', () => {
    it('should convert number to string', () => {
      const numContext = { value: 42 }
      const node = new TagVarNode({ contextKey: 'value' })

      expect(node.render(numContext)).toBe('42')
    })

    it('should convert boolean to string', () => {
      const boolContext = { active: true }
      const node = new TagVarNode({ contextKey: 'active' })

      expect(node.render(boolContext)).toBe('true')
    })

    it('should return empty string for null value', () => {
      const nullContext = { value: null }
      const node = new TagVarNode({ contextKey: 'value' })

      expect(node.render(nullContext)).toBe('')
    })

    it('should return empty string for undefined value', () => {
      const undefinedContext = { value: undefined }
      const node = new TagVarNode({ contextKey: 'value' })

      expect(node.render(undefinedContext)).toBe('')
    })

    it('should handle empty string value', () => {
      const emptyContext = { value: '' }
      const node = new TagVarNode({ contextKey: 'value' })

      expect(node.render(emptyContext)).toBe('')
    })

    it('should handle zero value', () => {
      const zeroContext = { value: 0 }
      const node = new TagVarNode({ contextKey: 'value' })

      expect(node.render(zeroContext)).toBe('0')
    })
  })
})
