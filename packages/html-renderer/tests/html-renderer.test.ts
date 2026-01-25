import type { Asset, GenerateContext } from '@ui-doc/core'

import type { Node } from '../src/nodes'
import type { Parser } from '../src/Parser.types'
import type { Reader } from '../src/Reader.types'
import type { RenderContext } from '../src/Renderer.types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HTMLRendererError, HTMLRendererSyntaxError, ParserError } from '../src/errors'
import { HtmlRenderer } from '../src/HtmlRenderer'

describe('htmlRenderer', () => {
  let mockParser: Parser
  let mockNode: Node
  let mockReader: Reader
  let mockRenderFn: ReturnType<typeof vi.fn<Node['render']>>
  let mockParseFn: ReturnType<typeof vi.fn<Parser['parse']>>
  let renderer: HtmlRenderer

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock render function
    mockRenderFn = vi.fn<Node['render']>().mockReturnValue('rendered output')

    // Create mock node
    mockNode = {
      render: mockRenderFn,
    } as unknown as Node

    // Create mock reader
    mockReader = {
      consume: vi.fn<Reader['consume']>(),
      debug: vi.fn<Reader['debug']>().mockReturnValue({
        content: 'test code',
        line: 1,
        pos: 1,
        source: 'test-source',
      }),
      isEof: vi.fn<Reader['isEof']>(),
      peek: vi.fn<Reader['peek']>(),
    }

    // Create mock parser
    mockParseFn = vi.fn<Parser['parse']>().mockReturnValue(mockNode)
    mockParser = {
      parse: mockParseFn,
      registerTagParser: vi.fn<Parser['registerTagParser']>(),
    }

    renderer = new HtmlRenderer(mockParser)
  })

  describe('constructor', () => {
    it('should create instance with parser', () => {
      // Verify that parser.parse is called when adding templates
      renderer.addLayout('test', { content: '<html></html>', source: 'test.html' })
      expect(mockParseFn).toHaveBeenCalledTimes(1)
    })

    it('should start with no layouts registered', () => {
      // Verify by checking that generate throws for missing layout
      const context = { assets: [], entries: {}, menu: [], name: 'Test', pages: {}, title: 'Test' }
      expect(() => renderer.generate(context)).toThrow(HTMLRendererError)
    })

    it('should start with no partials registered', () => {
      // Verify by checking that partial throws for missing partial
      expect(() => renderer.partial('test')).toThrow(HTMLRendererError)
    })

    it('should start with no pages registered', () => {
      // Verify by checking that page throws for missing page
      expect(() => renderer.page('test', {})).toThrow(HTMLRendererError)
    })
  })

  describe('addLayout', () => {
    it('should parse string content and store layout by name', () => {
      const result = renderer.addLayout('main', { content: '<html></html>', source: 'main.html' })

      expect(mockParseFn).toHaveBeenCalledTimes(1)
      // Verify the layout was stored by successfully generating with it
      const context = { assets: [], entries: {}, menu: [], name: 'Test', pages: {}, title: 'Test' }
      expect(() => renderer.generate(context, 'main')).not.toThrow()
      expect(result).toBe(renderer)
    })

    it('should parse Reader input and store layout by name', () => {
      const result = renderer.addLayout('main', mockReader)

      expect(mockParseFn).toHaveBeenCalledWith(mockReader)
      expect(result).toBe(renderer)
    })

    it('should return this for method chaining', () => {
      const result = renderer.addLayout('main', { content: '<html></html>', source: 'main.html' })

      expect(result).toBe(renderer)
    })
  })

  describe('addPartial', () => {
    it('should parse string content and store partial by name', () => {
      const result = renderer.addPartial('header', {
        content: '<header></header>',
        source: 'header.html',
      })

      expect(mockParseFn).toHaveBeenCalledTimes(1)
      // Verify the partial was stored by successfully rendering it
      expect(() => renderer.partial('header')).not.toThrow()
      expect(result).toBe(renderer)
    })

    it('should parse Reader input and store partial by name', () => {
      const result = renderer.addPartial('header', mockReader)

      expect(mockParseFn).toHaveBeenCalledWith(mockReader)
      expect(result).toBe(renderer)
    })

    it('should return this for method chaining', () => {
      const result = renderer.addPartial('header', {
        content: '<header></header>',
        source: 'header.html',
      })

      expect(result).toBe(renderer)
    })
  })

  describe('addPage', () => {
    it('should parse string content and store page by name', () => {
      const result = renderer.addPage('index', { content: '<div></div>', source: 'index.html' })

      expect(mockParseFn).toHaveBeenCalledTimes(1)
      // Verify the page was stored by successfully rendering it
      expect(() => renderer.page('index', {})).not.toThrow()
      expect(result).toBe(renderer)
    })

    it('should parse Reader input and store page by name', () => {
      const result = renderer.addPage('index', mockReader)

      expect(mockParseFn).toHaveBeenCalledWith(mockReader)
      expect(result).toBe(renderer)
    })

    it('should return this for method chaining', () => {
      const result = renderer.addPage('index', { content: '<div></div>', source: 'index.html' })

      expect(result).toBe(renderer)
    })
  })

  describe('method chaining', () => {
    it('should support chaining across add methods', () => {
      const result = renderer
        .addLayout('main', { content: '<html></html>', source: 'main.html' })
        .addPartial('header', { content: '<header></header>', source: 'header.html' })
        .addPage('index', { content: '<div></div>', source: 'index.html' })

      expect(result).toBe(renderer)
      expect(mockParseFn).toHaveBeenCalledTimes(3)
      // Verify all templates were stored
      const context = { assets: [], entries: {}, menu: [], name: 'Test', pages: {}, title: 'Test' }
      expect(() => renderer.generate(context, 'main')).not.toThrow()
      expect(() => renderer.partial('header')).not.toThrow()
      expect(() => renderer.page('index', {})).not.toThrow()
    })
  })

  describe('generate', () => {
    const createContext = (assets: Asset[] = []): GenerateContext => ({
      assets,
      entries: {},
      menu: [],
      name: 'Test',
      pages: {},
      title: 'Test Page',
    })

    beforeEach(() => {
      renderer.addLayout('default', { content: '<html></html>', source: 'default.html' })
      renderer.addLayout('custom', { content: '<html></html>', source: 'custom.html' })
    })

    it('should use default layout when not specified', () => {
      const context = createContext()

      renderer.generate(context)

      expect(mockRenderFn).toHaveBeenCalledWith(
        expect.objectContaining({
          scripts: '',
          styles: '',
        }),
        renderer,
      )
    })

    it('should use custom layout when specified', () => {
      const context = createContext()

      renderer.generate(context, 'custom')

      expect(mockRenderFn).toHaveBeenCalled()
    })

    it('should throw HTMLRendererError when layout not found', () => {
      const context = createContext()

      expect(() => renderer.generate(context, 'nonexistent')).toThrow(HTMLRendererError)
      expect(() => renderer.generate(context, 'nonexistent')).toThrow(
        'Layout "nonexistent" not found. Please register it using "addLayout" method.',
      )
    })

    it('should transform context with styles from style assets', () => {
      const context = createContext([
        { attrs: {}, src: 'main.css', type: 'style' },
        { attrs: {}, src: 'theme.css', type: 'style' },
      ])

      renderer.generate(context)

      expect(mockRenderFn).toHaveBeenCalledWith(
        expect.objectContaining({
          styles: '<link href="main.css" rel="stylesheet">\n<link href="theme.css" rel="stylesheet">',
        }),
        renderer,
      )
    })

    it('should transform context with scripts from script assets', () => {
      const context = createContext([
        { attrs: {}, src: 'app.js', type: 'script' },
        { attrs: {}, src: 'vendor.js', type: 'script' },
      ])

      renderer.generate(context)

      expect(mockRenderFn).toHaveBeenCalledWith(
        expect.objectContaining({
          scripts: '<script src="app.js"></script>\n<script src="vendor.js"></script>',
        }),
        renderer,
      )
    })

    it('should handle empty assets array', () => {
      const context = createContext([])

      renderer.generate(context)

      expect(mockRenderFn).toHaveBeenCalledWith(
        expect.objectContaining({
          scripts: '',
          styles: '',
        }),
        renderer,
      )
    })

    it('should handle assets with attributes', () => {
      const context = createContext([
        { attrs: { async: 'true', defer: 'true' }, src: 'app.js', type: 'script' },
      ])

      renderer.generate(context)

      expect(mockRenderFn).toHaveBeenCalledWith(
        expect.objectContaining({
          scripts: '<script src="app.js" async="true" defer="true"></script>',
        }),
        renderer,
      )
    })

    it('should handle assets without attrs property', () => {
      const context: GenerateContext = {
        assets: [{ src: 'main.css', type: 'style' } as Asset],
        entries: {},
        menu: [],
        name: 'Test',
        pages: {},
        title: 'Test Page',
      }

      renderer.generate(context)

      expect(mockRenderFn).toHaveBeenCalledWith(
        expect.objectContaining({
          styles: '<link href="main.css" rel="stylesheet">',
        }),
        renderer,
      )
    })
  })

  describe('page', () => {
    beforeEach(() => {
      renderer.addPage('default', { content: '<div>default</div>', source: 'default.html' })
      renderer.addPage('about', { content: '<div>about</div>', source: 'about.html' })
    })

    it('should render named page', () => {
      const context: RenderContext = { title: 'About' }

      const result = renderer.page('about', context)

      expect(mockRenderFn).toHaveBeenCalledWith(context, renderer)
      expect(result).toBe('rendered output')
    })

    it('should fall back to default page when named page does not exist', () => {
      const context: RenderContext = { title: 'Not Found' }

      const result = renderer.page('nonexistent', context)

      expect(mockRenderFn).toHaveBeenCalledWith(context, renderer)
      expect(result).toBe('rendered output')
    })

    it('should throw HTMLRendererError when page not found', () => {
      // Create a new renderer with no pages registered
      const emptyRenderer = new HtmlRenderer(mockParser)
      const context: RenderContext = { title: 'Not Found' }

      expect(() => emptyRenderer.page('nonexistent', context)).toThrow(HTMLRendererError)
      expect(() => emptyRenderer.page('nonexistent', context)).toThrow(
        'Page "nonexistent" not found. Please register it using "addPage" method.',
      )
    })
  })

  describe('partial', () => {
    beforeEach(() => {
      renderer.addPartial('default', { content: '<div>default</div>', source: 'default.html' })
      renderer.addPartial('header', { content: '<header></header>', source: 'header.html' })
    })

    it('should render named partial', () => {
      const context: RenderContext = { title: 'Header' }

      const result = renderer.partial('header', context)

      expect(mockRenderFn).toHaveBeenCalledWith(context, renderer)
      expect(result).toBe('rendered output')
    })

    it('should fall back to default partial when named partial does not exist', () => {
      const context: RenderContext = { title: 'Fallback' }

      const result = renderer.partial('nonexistent', context)

      expect(mockRenderFn).toHaveBeenCalledWith(context, renderer)
      expect(result).toBe('rendered output')
    })

    it('should use empty context when not provided', () => {
      const result = renderer.partial('header')

      expect(mockRenderFn).toHaveBeenCalledWith({}, renderer)
      expect(result).toBe('rendered output')
    })

    it('should throw HTMLRendererError when partial not found', () => {
      // Create a new renderer with no partials registered
      const emptyRenderer = new HtmlRenderer(mockParser)

      expect(() => emptyRenderer.partial('nonexistent')).toThrow(HTMLRendererError)
      expect(() => emptyRenderer.partial('nonexistent')).toThrow(
        'Partial "nonexistent" not found. Please register it using "addPartial" method.',
      )
    })
  })

  describe('error transformation', () => {
    it('should transform ParserError to HTMLRendererSyntaxError', () => {
      mockParseFn.mockImplementation(() => {
        throw new ParserError('Syntax error in template')
      })

      // When using string content, HtmlRenderer creates an InlineReader internally
      // The debug info comes from the InlineReader, not our mockReader
      expect(() =>
        renderer.addLayout('broken', { content: '{{ invalid }}', source: 'broken.html' }),
      ).toThrow(HTMLRendererSyntaxError)
      expect(() =>
        renderer.addLayout('broken', { content: '{{ invalid }}', source: 'broken.html' }),
      ).toThrow('Syntax error in template')

      try {
        renderer.addLayout('broken', { content: '{{ invalid }}', source: 'broken.html' })
      } catch (error) {
        if (error instanceof HTMLRendererSyntaxError) {
          // The InlineReader returns the content from the input
          expect(error.code).toBe('{{ invalid }}')
          expect(error.line).toBe(1)
          expect(error.column).toBe(1)
          expect(error.source).toBe('broken.html')
        }
      }
    })

    it('should transform ParserError to HTMLRendererSyntaxError with Reader input', () => {
      mockParseFn.mockImplementation(() => {
        throw new ParserError('Syntax error in template')
      })

      // When using Reader input, the debug info comes from the provided Reader
      expect(() => renderer.addLayout('broken', mockReader)).toThrow(HTMLRendererSyntaxError)

      try {
        renderer.addLayout('broken', mockReader)
      } catch (error) {
        if (error instanceof HTMLRendererSyntaxError) {
          expect(error.code).toBe('test code')
          expect(error.line).toBe(1)
          expect(error.column).toBe(1)
          expect(error.source).toBe('test-source')
        }
      }
    })

    it('should re-throw non-ParserError unchanged', () => {
      const customError = new Error('Custom error')
      mockParseFn.mockImplementation(() => {
        throw customError
      })

      expect(() =>
        renderer.addLayout('broken', { content: '{{ invalid }}', source: 'broken.html' }),
      ).toThrow(customError)
      expect(() =>
        renderer.addLayout('broken', { content: '{{ invalid }}', source: 'broken.html' }),
      ).not.toThrow(HTMLRendererSyntaxError)
    })
  })
})
