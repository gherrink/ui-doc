import type { DescriptionParser } from '../src/DescriptionParser.types'

import { describe, expect, it } from 'vitest'

import {
  createMarkdownDescriptionParser,
  MarkdownDescriptionParser,
} from '../src/MarkdownDescriptionParser'

describe('markdownDescriptionParser', () => {
  describe('parse', () => {
    it('should parse plain text without markdown', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('plain text')

      expect(result).toBe('<p>plain text</p>\n')
    })

    it('should parse h1 heading', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('# Title')

      expect(result).toBe('<h1>Title</h1>\n')
    })

    it('should parse h2 heading', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('## Subtitle')

      expect(result).toBe('<h2>Subtitle</h2>\n')
    })

    it('should parse bold text', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('**bold**')

      expect(result).toBe('<p><strong>bold</strong></p>\n')
    })

    it('should parse italic text', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('*italic*')

      expect(result).toBe('<p><em>italic</em></p>\n')
    })

    it('should parse markdown link', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('[text](url)')

      expect(result).toBe('<p><a href="url">text</a></p>\n')
    })

    it('should parse unordered list', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('- Item 1\n- Item 2\n- Item 3')

      expect(result).toBe('<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li>\n</ul>\n')
    })

    it('should parse ordered list', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('1. First\n2. Second\n3. Third')

      expect(result).toBe('<ol>\n<li>First</li>\n<li>Second</li>\n<li>Third</li>\n</ol>\n')
    })

    it('should parse inline code', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('This is `code` inline')

      expect(result).toBe('<p>This is <code>code</code> inline</p>\n')
    })

    it('should parse code block with language', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('```javascript\nconst x = 1;\n```')

      expect(result).toBe('<pre><code class="language-javascript">const x = 1;\n</code></pre>\n')
    })

    it('should parse blockquote', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('> Quote text')

      expect(result).toBe('<blockquote>\n<p>Quote text</p>\n</blockquote>\n')
    })

    it('should parse empty string', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('')

      expect(result).toBe('')
    })

    it('should parse multiline markdown with mixed elements', () => {
      const parser = new MarkdownDescriptionParser()
      const markdown = `# Title

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2`

      const result = parser.parse(markdown)

      expect(result).toContain('<h1>Title</h1>')
      expect(result).toContain('<p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>')
      expect(result).toContain('<ul>')
      expect(result).toContain('<li>List item 1</li>')
      expect(result).toContain('<li>List item 2</li>')
    })

    it('should parse string with only whitespace', () => {
      const parser = new MarkdownDescriptionParser()
      const result = parser.parse('   \n   ')

      expect(result).toBe('')
    })
  })

  describe('createMarkdownDescriptionParser', () => {
    it('should create new instance', () => {
      const parser = createMarkdownDescriptionParser()

      expect(parser).toBeInstanceOf(MarkdownDescriptionParser)
    })

    it('should create independent instances', () => {
      const parser1 = createMarkdownDescriptionParser()
      const parser2 = createMarkdownDescriptionParser()

      expect(parser1).toBeInstanceOf(MarkdownDescriptionParser)
      expect(parser2).toBeInstanceOf(MarkdownDescriptionParser)
      expect(parser1).not.toBe(parser2)
    })
  })

  describe('interface compliance', () => {
    it('should implement DescriptionParser interface', () => {
      const parser: DescriptionParser = new MarkdownDescriptionParser()

      expect(parser.parse).toBeDefined()
      expect(typeof parser.parse).toBe('function')
    })
  })
})
