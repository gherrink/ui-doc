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

  // These pin the exact HTML marked produces for constructs the rest of the
  // suite never exercises. They exist so that a marked upgrade shows up as a
  // failing assertion with both strings printed, rather than as a silent change
  // in the rendered documentation. Snapshots would be the wrong tool here:
  // `vitest -u` rewrites them, so a real regression could land as a green diff.
  describe('rendered html contract', () => {
    it('should render a link with a title', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('[text](url "Title")')).toBe(
        '<p><a href="url" title="Title">text</a></p>\n',
      )
    })

    it('should render a fenced code block without a language', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('```\nconst x = 1;\n```')).toBe(
        '<pre><code>const x = 1;\n</code></pre>\n',
      )
    })

    it('should render a gfm table', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('| a | b |\n| --- | --- |\n| 1 | 2 |')).toBe(
        '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>1</td>\n<td>2</td>\n</tr>\n</tbody></table>\n',
      )
    })

    it('should render table column alignment', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('| a | b |\n| :-- | --: |\n| 1 | 2 |')).toBe(
        '<table>\n<thead>\n<tr>\n<th align="left">a</th>\n<th align="right">b</th>\n</tr>\n</thead>\n<tbody><tr>\n<td align="left">1</td>\n<td align="right">2</td>\n</tr>\n</tbody></table>\n',
      )
    })

    it('should autolink a bare url', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('https://example.com')).toBe(
        '<p><a href="https://example.com">https://example.com</a></p>\n',
      )
    })

    it('should autolink an angle-bracketed url', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('<https://example.com>')).toBe(
        '<p><a href="https://example.com">https://example.com</a></p>\n',
      )
    })

    it('should autolink an email address', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('foo@bar.com')).toBe(
        '<p><a href="mailto:foo@bar.com">foo@bar.com</a></p>\n',
      )
    })

    // Raw HTML in a doc comment reaches the rendered page unescaped, so a
    // <script> in a source file's comment block becomes a script on the page.
    // This asserts that behaviour deliberately - it is not an oversight.
    it('should pass raw html through unescaped and without a trailing newline', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('<div>raw</div>')).toBe('<div>raw</div>')
    })

    it('should escape angle brackets and ampersands in text', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('a < b & c > d')).toBe('<p>a &lt; b &amp; c &gt; d</p>\n')
    })

    it('should render a task list', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('- [ ] todo\n- [x] done')).toBe(
        '<ul>\n<li><input disabled="" type="checkbox"> todo</li>\n<li><input checked="" disabled="" type="checkbox"> done</li>\n</ul>\n',
      )
    })

    it('should render strikethrough', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('~~gone~~')).toBe('<p><del>gone</del></p>\n')
    })

    it('should render a thematic break', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('---')).toBe('<hr>\n')
    })

    it('should render a hard line break', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('line1  \nline2')).toBe('<p>line1<br>line2</p>\n')
    })

    it('should render an h6 heading', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('###### h6')).toBe('<h6>h6</h6>\n')
    })

    it('should render a setext heading', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('Title\n=====')).toBe('<h1>Title</h1>\n')
    })

    it('should render a nested list', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('- a\n  - b')).toBe(
        '<ul>\n<li>a<ul>\n<li>b</li>\n</ul>\n</li>\n</ul>\n',
      )
    })

    it('should render a loose list with wrapped paragraphs', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('- a\n\n- b')).toBe(
        '<ul>\n<li><p>a</p>\n</li>\n<li><p>b</p>\n</li>\n</ul>\n',
      )
    })

    it('should render an image', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('![alt](img.png)')).toBe('<p><img src="img.png" alt="alt"></p>\n')
    })

    it('should render a reference link', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('[a][b]\n\n[b]: /url')).toBe('<p><a href="/url">a</a></p>\n')
    })

    it('should preserve html entities', () => {
      const parser = new MarkdownDescriptionParser()

      expect(parser.parse('&copy; &amp;')).toBe('<p>&copy; &amp;</p>\n')
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
