import { describe, expect, it } from 'vitest'

import { escapeHtml, readNestedValue } from '../src/utils/index'

describe('readNestedValue', () => {
  describe('basic access', () => {
    it('should return target directly when name is empty string', () => {
      const target = { foo: 'bar' }

      const result = readNestedValue('', target)

      expect(result).toBe(target)
    })

    it('should access simple property without dots', () => {
      const target = { name: 'value' }

      const result = readNestedValue('name', target)

      expect(result).toBe('value')
    })

    it('should access nested property with single dot', () => {
      const target = { user: { name: 'John' } }

      const result = readNestedValue('user.name', target)

      expect(result).toBe('John')
    })

    it('should access deeply nested property with multiple dots', () => {
      const target = {
        data: {
          user: {
            profile: {
              name: 'Jane',
            },
          },
        },
      }

      const result = readNestedValue('data.user.profile.name', target)

      expect(result).toBe('Jane')
    })
  })

  describe('undefined and null handling', () => {
    it('should return undefined when target is undefined', () => {
      const result = readNestedValue('name', undefined)

      expect(result).toBeUndefined()
    })

    it('should return undefined when target is null', () => {
      const result = readNestedValue('name', null)

      expect(result).toBeUndefined()
    })

    it('should return undefined when property does not exist on target', () => {
      const target = { foo: 'bar' }

      const result = readNestedValue('missing', target)

      expect(result).toBeUndefined()
    })

    it('should return undefined when intermediate property is null', () => {
      const target = { user: null }

      const result = readNestedValue('user.name', target)

      expect(result).toBeUndefined()
    })

    it('should return undefined when intermediate property is undefined', () => {
      const target = { user: undefined }

      const result = readNestedValue('user.name', target)

      expect(result).toBeUndefined()
    })

    it('should return undefined for any property on empty target object', () => {
      const target = {}

      const result = readNestedValue('any.nested.property', target)

      expect(result).toBeUndefined()
    })
  })

  describe('array access', () => {
    it('should access array element by index', () => {
      const target = { items: [{ name: 'first' }, { name: 'second' }] }

      const result = readNestedValue('items.0.name', target)

      expect(result).toBe('first')
    })
  })
})

describe('escapeHtml', () => {
  describe('individual character escaping', () => {
    it('should escape ampersand character', () => {
      const result = escapeHtml('&')

      expect(result).toBe('&amp;')
    })

    it('should escape less-than character', () => {
      const result = escapeHtml('<')

      expect(result).toBe('&lt;')
    })

    it('should escape greater-than character', () => {
      const result = escapeHtml('>')

      expect(result).toBe('&gt;')
    })

    it('should escape double quote character', () => {
      const result = escapeHtml('"')

      expect(result).toBe('&quot;')
    })

    it('should escape single quote character', () => {
      const result = escapeHtml('\'')

      expect(result).toBe('&#039;')
    })
  })

  describe('complex strings', () => {
    it('should escape multiple special characters in one string', () => {
      const result = escapeHtml('A & B < C > D " E \' F')

      expect(result).toBe('A &amp; B &lt; C &gt; D &quot; E &#039; F')
    })

    it('should return empty string when input is empty', () => {
      const result = escapeHtml('')

      expect(result).toBe('')
    })

    it('should return unchanged string with no special characters', () => {
      const input = 'Hello World 123'

      const result = escapeHtml(input)

      expect(result).toBe(input)
    })

    it('should escape string with only special characters', () => {
      const result = escapeHtml('<>&"\'')

      expect(result).toBe('&lt;&gt;&amp;&quot;&#039;')
    })

    it('should double-escape already escaped content', () => {
      const result = escapeHtml('&amp;')

      expect(result).toBe('&amp;amp;')
    })

    it('should escape HTML tag with attributes', () => {
      const result = escapeHtml('<div class="container" id=\'main\'>')

      expect(result).toBe(
        '&lt;div class=&quot;container&quot; id=&#039;main&#039;&gt;',
      )
    })

    it('should preserve newlines and tabs in string', () => {
      const input = 'Line 1\nLine 2\tTabbed'

      const result = escapeHtml(input)

      expect(result).toBe('Line 1\nLine 2\tTabbed')
    })
  })
})
