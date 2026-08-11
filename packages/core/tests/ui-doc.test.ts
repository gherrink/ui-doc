import { describe, expect, it, vi } from 'vitest'

import type { BlockParser } from '../src/BlockParser.types'
import type { EventListener } from '../src/EventEmitter.types'
import type { Renderer } from '../src/Renderer.types'
import { UIDoc } from '../src/UIDoc'
import type { GenerateFunctions, OutputCallback } from '../src/UIDoc.types'
import type { UIDocEventMap } from '../src/UIDocEvent.types'

interface UidocMockResult {
  blockParser: BlockParser
  renderer: { generate: ReturnType<typeof vi.fn<Renderer['generate']>> }
  uidoc: UIDoc
}

describe('uI-Doc', () => {
  const uidocMock = ({
    rendererGenerate = vi.fn<Renderer['generate']>(),
    blockParserParse = vi.fn<BlockParser['parse']>().mockReturnValue([]),
    blockParserRegisterTagTransformer = vi.fn<BlockParser['registerTagTransformer']>(),
  }): UidocMockResult => {
    const renderer = {
      generate: rendererGenerate,
    }

    const blockParser = {
      parse: blockParserParse,
      registerTagTransformer: blockParserRegisterTagTransformer,
    }

    const uidoc = new UIDoc({
      blockParser,
      renderer,
    })

    return {
      blockParser,
      renderer,
      uidoc,
    }
  }

  it('should register', () => {
    const { uidoc } = uidocMock({
      blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
        {
          key: 'foo',
          order: 0,
          title: 'Foo',
        },
        {
          description: 'Bar description',
          key: 'bar',
          order: 0,
          title: 'Bar',
        },
        {
          key: 'foo.bar',
          order: 0,
          title: 'Foo Bar',
        },
      ]),
    })

    uidoc.sourceCreate('file.css', '')
    const entries = uidoc.entries()
    const pageIds = Object.keys(uidoc.pages())

    expect(Object.keys(entries)).toEqual(['foo', 'bar', 'foo.bar'])
    expect(entries.foo).toEqual({
      id: 'foo',
      order: 0,
      sections: [
        {
          id: 'bar',
          order: 0,
          sections: [],
          title: 'Foo Bar',
          titleLevel: 2,
        },
      ],
      title: 'Foo',
      titleLevel: 1,
    })
    expect(entries.bar).toEqual({
      description: 'Bar description',
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Bar',
      titleLevel: 1,
    })
    expect(entries['foo.bar']).toEqual({
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 2,
    })

    expect(pageIds.length).toBe(3)
    expect(pageIds.sort()).toEqual(['bar', 'foo', 'index'])
  })

  it('changes should be applied', () => {
    const { uidoc } = uidocMock({
      blockParserParse: vi
        .fn<BlockParser['parse']>()
        .mockReturnValueOnce([
          {
            key: 'foo',
            order: 0,
            title: 'Foo',
          },
          {
            description: 'Foo Bar description',
            key: 'foo.bar',
            order: 0,
            title: 'Foo Bar',
          },
        ])
        .mockReturnValueOnce([
          {
            key: 'foo',
            order: 0,
            title: 'Foo',
          },
          {
            key: 'foo.bar',
            order: 0,
            title: 'Foo Bar 2',
          },
        ]),
    })

    uidoc.sourceCreate('file.css', '')

    const entriesFirst = uidoc.entries()

    expect(Object.keys(entriesFirst)).toEqual(['foo', 'foo.bar'])
    expect(entriesFirst.foo).toEqual({
      id: 'foo',
      order: 0,
      sections: [
        {
          description: 'Foo Bar description',
          id: 'bar',
          order: 0,
          sections: [],
          title: 'Foo Bar',
          titleLevel: 2,
        },
      ],
      title: 'Foo',
      titleLevel: 1,
    })
    expect(entriesFirst['foo.bar']).toEqual({
      description: 'Foo Bar description',
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 2,
    })

    uidoc.sourceUpdate('file.css', '')

    const entriesSecond = uidoc.entries()

    expect(Object.keys(entriesSecond)).toEqual(['foo', 'foo.bar'])
    expect(entriesSecond.foo).toEqual({
      id: 'foo',
      order: 0,
      sections: [
        {
          id: 'bar',
          order: 0,
          sections: [],
          title: 'Foo Bar 2',
          titleLevel: 2,
        },
      ],
      title: 'Foo',
      titleLevel: 1,
    })
    expect(entriesSecond['foo.bar']).toEqual({
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar 2',
      titleLevel: 2,
    })
  })

  it('when blocks get removed they should be removed from context', () => {
    const { uidoc } = uidocMock({
      blockParserParse: vi
        .fn<BlockParser['parse']>()
        .mockReturnValueOnce([
          {
            key: 'foo',
            order: 0,
            title: 'Foo',
          },
          {
            description: 'Foo Bar description',
            key: 'foo.bar',
            order: 0,
            title: 'Foo Bar',
          },
        ])
        .mockReturnValueOnce([
          {
            key: 'foo',
            order: 0,
            title: 'Foo',
          },
        ]),
    })

    uidoc.sourceCreate('file.css', '')

    const entriesFirst = uidoc.entries()

    expect(Object.keys(entriesFirst)).toEqual(['foo', 'foo.bar'])
    expect(entriesFirst.foo).toEqual({
      id: 'foo',
      order: 0,
      sections: [
        {
          description: 'Foo Bar description',
          id: 'bar',
          order: 0,
          sections: [],
          title: 'Foo Bar',
          titleLevel: 2,
        },
      ],
      title: 'Foo',
      titleLevel: 1,
    })
    expect(entriesFirst['foo.bar']).toEqual({
      description: 'Foo Bar description',
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 2,
    })

    uidoc.sourceUpdate('file.css', '')

    const entriesSecond = uidoc.entries()

    expect(Object.keys(entriesSecond)).toEqual(['foo'])
    expect(entriesSecond.foo).toEqual({
      id: 'foo',
      order: 0,
      sections: [],
      title: 'Foo',
      titleLevel: 1,
    })
  })

  it('when top level blocks get removed they should be removed from context', () => {
    const { uidoc } = uidocMock({
      blockParserParse: vi
        .fn<BlockParser['parse']>()
        .mockReturnValueOnce([
          {
            key: 'foo',
            order: 0,
            title: 'Foo',
          },
          {
            description: 'Bar description',
            key: 'bar',
            order: 0,
            title: 'Bar',
          },
        ])
        .mockReturnValueOnce([
          {
            key: 'foo',
            order: 0,
            title: 'Foo',
          },
        ])
        .mockReturnValueOnce([]),
    })

    uidoc.sourceCreate('file.css', '')

    const entriesFirst = uidoc.entries()
    const pageIdsFirst = Object.keys(uidoc.pages())

    expect(Object.keys(entriesFirst)).toEqual(['foo', 'bar'])
    expect(entriesFirst.foo).toEqual({
      id: 'foo',
      order: 0,
      sections: [],
      title: 'Foo',
      titleLevel: 1,
    })
    expect(entriesFirst.bar).toEqual({
      description: 'Bar description',
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Bar',
      titleLevel: 1,
    })
    expect(pageIdsFirst.length).toBe(3)
    expect(pageIdsFirst.sort()).toEqual(['bar', 'foo', 'index'])

    uidoc.sourceUpdate('file.css', '')

    const entriesSecond = uidoc.entries()
    const pageIdsSecond = Object.keys(uidoc.pages())

    expect(Object.keys(entriesSecond)).toEqual(['foo'])
    expect(entriesSecond.foo).toEqual({
      id: 'foo',
      order: 0,
      sections: [],
      title: 'Foo',
      titleLevel: 1,
    })
    expect(pageIdsSecond.length).toBe(2)
    expect(pageIdsSecond.sort()).toEqual(['foo', 'index'])

    uidoc.sourceUpdate('file.css', '')

    const entriesThird = uidoc.entries()
    const pageIdsThird = Object.keys(uidoc.pages())

    expect(Object.keys(entriesThird)).toEqual([])
    expect(pageIdsThird.length).toBe(1)
    expect(pageIdsThird.sort()).toEqual(['index'])
  })

  it('when blocks get witch has children they should only reset', () => {
    const { uidoc } = uidocMock({
      blockParserParse: vi
        .fn<BlockParser['parse']>()
        .mockReturnValueOnce([
          {
            description: 'Foo description',
            key: 'foo',
            order: 0,
            title: 'Foo',
          },
          {
            key: 'foo.bar',
            order: 0,
            title: 'Foo Bar',
          },
        ])
        .mockReturnValueOnce([
          {
            key: 'foo.bar',
            order: 0,
            title: 'Foo Bar',
          },
        ]),
    })

    uidoc.sourceCreate('file.css', '')

    const entriesFirst = uidoc.entries()

    expect(Object.keys(entriesFirst)).toEqual(['foo', 'foo.bar'])
    expect(entriesFirst.foo).toEqual({
      description: 'Foo description',
      id: 'foo',
      order: 0,
      sections: [
        {
          id: 'bar',
          order: 0,
          sections: [],
          title: 'Foo Bar',
          titleLevel: 2,
        },
      ],
      title: 'Foo',
      titleLevel: 1,
    })
    expect(entriesFirst['foo.bar']).toEqual({
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 2,
    })

    uidoc.sourceUpdate('file.css', '')

    expect(Object.keys(entriesFirst)).toEqual(['foo', 'foo.bar'])
    expect(entriesFirst.foo).toEqual({
      id: 'foo',
      order: 0,
      sections: [
        {
          id: 'bar',
          order: 0,
          sections: [],
          title: 'Foo Bar',
          titleLevel: 2,
        },
      ],
      title: 'foo',
      titleLevel: 1,
    })
    expect(entriesFirst['foo.bar']).toEqual({
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 2,
    })
  })

  it('should remove blocks when source is deleted', () => {
    const { uidoc } = uidocMock({
      blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
        {
          key: 'foo',
          order: 0,
          title: 'Foo',
        },
        {
          description: 'Foo Bar description',
          key: 'foo.bar',
          order: 0,
          title: 'Foo Bar',
        },
      ]),
    })

    uidoc.sourceCreate('file.css', '')

    const entries = uidoc.entries()

    expect(Object.keys(entries)).toEqual(['foo', 'foo.bar'])
    expect(entries.foo).toEqual({
      id: 'foo',
      order: 0,
      sections: [
        {
          description: 'Foo Bar description',
          id: 'bar',
          order: 0,
          sections: [],
          title: 'Foo Bar',
          titleLevel: 2,
        },
      ],
      title: 'Foo',
      titleLevel: 1,
    })
    expect(entries['foo.bar']).toEqual({
      description: 'Foo Bar description',
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 2,
    })

    uidoc.sourceDelete('file.css')

    const entriesDeleted = uidoc.entries()
    const pageIds = Object.keys(uidoc.pages())

    expect(Object.keys(entriesDeleted)).toEqual([])
    expect(entriesDeleted.foo).toBeUndefined()
    expect(entriesDeleted['foo.bar']).toBeUndefined()
    expect(pageIds.length).toBe(1)
    expect(pageIds).toEqual(['index'])
  })

  it('sourceUpdate should create source when it does not exist', () => {
    const { uidoc, blockParser } = uidocMock({
      blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
        {
          key: 'foo',
          order: 0,
          title: 'Foo',
        },
      ]),
    })

    expect(uidoc.sourceExists('file.css')).toBe(false)

    uidoc.sourceUpdate('file.css', '')

    expect(uidoc.sourceExists('file.css')).toBe(true)
    expect(blockParser.parse).toHaveBeenCalledTimes(1)
    expect(Object.keys(uidoc.entries())).toEqual(['foo'])
  })

  it('sourceDelete should do nothing when source does not exist', () => {
    const { uidoc, blockParser } = uidocMock({})

    expect(uidoc.sourceExists('nonexistent.css')).toBe(false)

    uidoc.sourceDelete('nonexistent.css')

    expect(uidoc.sourceExists('nonexistent.css')).toBe(false)
    expect(blockParser.parse).not.toHaveBeenCalled()
  })

  it('should emit source events on create, update, and delete', () => {
    const sourceListener = vi.fn<EventListener<UIDocEventMap, 'source'>>()
    const { uidoc } = uidocMock({
      blockParserParse: vi
        .fn<BlockParser['parse']>()
        .mockReturnValueOnce([{ key: 'foo', order: 0, title: 'Foo' }])
        .mockReturnValueOnce([{ key: 'foo', order: 0, title: 'Foo Updated' }]),
    })

    uidoc.on('source', sourceListener)

    uidoc.sourceCreate('file.css', '')
    expect(sourceListener).toHaveBeenCalledWith(
      expect.objectContaining({ file: 'file.css', type: 'create' }),
    )

    uidoc.sourceUpdate('file.css', '')
    expect(sourceListener).toHaveBeenCalledWith(
      expect.objectContaining({ file: 'file.css', type: 'update' }),
    )

    uidoc.sourceDelete('file.css')
    expect(sourceListener).toHaveBeenCalledWith(
      expect.objectContaining({ file: 'file.css', type: 'delete' }),
    )

    expect(sourceListener).toHaveBeenCalledTimes(3)
  })

  it('should emit context-entry events on block changes', () => {
    const contextEntryListener = vi.fn<EventListener<UIDocEventMap, 'context-entry'>>()
    const { uidoc } = uidocMock({
      blockParserParse: vi
        .fn<BlockParser['parse']>()
        .mockReturnValue([{ key: 'foo', order: 0, title: 'Foo' }]),
    })

    uidoc.on('context-entry', contextEntryListener)

    uidoc.sourceCreate('file.css', '')

    expect(contextEntryListener).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'foo',
        type: 'create',
        entry: expect.objectContaining({ id: 'foo', title: 'Foo' }),
      }),
    )
  })

  describe('replaceGenerate', () => {
    it('should replace generate function', () => {
      const { uidoc, renderer } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue(''),
        blockParserParse: vi
          .fn<BlockParser['parse']>()
          .mockReturnValue([{ key: 'foo', order: 0, title: 'Foo' }]),
      })

      const customLogo = vi.fn<GenerateFunctions['logo']>().mockReturnValue('CUSTOM LOGO')
      uidoc.replaceGenerate('logo', customLogo)

      uidoc.sourceCreate('test.css', '')
      uidoc.page('foo')

      expect(customLogo).toHaveBeenCalled()
      expect(renderer.generate).toHaveBeenCalledWith(
        expect.objectContaining({ logo: 'CUSTOM LOGO' }),
        undefined,
      )
    })
  })

  describe('addAsset', () => {
    it('should add page asset with resolved src', () => {
      const { uidoc, renderer } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue(''),
        blockParserParse: vi
          .fn<BlockParser['parse']>()
          .mockReturnValue([{ key: 'foo', order: 0, title: 'Foo' }]),
      })

      uidoc.addAsset({ src: 'styles.css', type: 'style' })
      uidoc.sourceCreate('file.css', '')

      uidoc.page('foo')

      expect(renderer.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          assets: expect.arrayContaining([
            expect.objectContaining({ src: 'styles.css', type: 'style' }),
          ]),
        }),
        undefined,
      )
    })
  })

  describe('addExampleAsset', () => {
    it('should add example asset with resolved src', () => {
      const { uidoc, renderer } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue(''),
        blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
          {
            key: 'foo',
            order: 0,
            title: 'Foo',
            example: { content: '<div>test</div>', type: 'html', title: 'Test' },
          },
        ]),
      })

      uidoc.addExampleAsset({ src: 'example-styles.css', type: 'style' })
      uidoc.sourceCreate('file.css', '')

      uidoc.example('foo')

      expect(renderer.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          assets: expect.arrayContaining([
            expect.objectContaining({ src: 'example-styles.css', type: 'style' }),
          ]),
        }),
        'example',
      )
    })
  })

  describe('output', () => {
    it('should write all pages using output callback', async () => {
      const outputCallback = vi.fn<OutputCallback>()
      const { uidoc } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue('<html>content</html>'),
        blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
          { key: 'foo', order: 0, title: 'Foo' },
          { key: 'bar', order: 0, title: 'Bar' },
        ]),
      })

      uidoc.sourceCreate('file.css', '')

      await uidoc.output(outputCallback)

      expect(outputCallback).toHaveBeenCalledWith('index.html', '<html>content</html>')
      expect(outputCallback).toHaveBeenCalledWith('foo.html', '<html>content</html>')
      expect(outputCallback).toHaveBeenCalledWith('bar.html', '<html>content</html>')
      expect(outputCallback).toHaveBeenCalledTimes(3)
    })

    it('should handle async output callback', async () => {
      const outputCallback = vi.fn<OutputCallback>().mockResolvedValue(undefined)
      const { uidoc } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue('<html></html>'),
        blockParserParse: vi
          .fn<BlockParser['parse']>()
          .mockReturnValue([{ key: 'foo', order: 0, title: 'Foo' }]),
      })

      uidoc.sourceCreate('file.css', '')

      await uidoc.output(outputCallback)

      expect(outputCallback).toHaveBeenCalledTimes(2)
    })

    it('should emit output event', async () => {
      const outputListener = vi.fn<EventListener<UIDocEventMap, 'output'>>()
      const { uidoc } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue(''),
        blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([]),
      })

      uidoc.on('output', outputListener)
      uidoc.sourceCreate('file.css', '')

      await uidoc.output(vi.fn())

      expect(outputListener).toHaveBeenCalledWith(
        expect.objectContaining({
          promises: expect.any(Array),
          write: expect.any(Function),
        }),
      )
    })
  })

  describe('page', () => {
    it('should return page content for existing page', () => {
      const { uidoc } = uidocMock({
        rendererGenerate: vi
          .fn<Renderer['generate']>()
          .mockReturnValue('<html>page content</html>'),
        blockParserParse: vi
          .fn<BlockParser['parse']>()
          .mockReturnValue([{ key: 'foo', order: 0, title: 'Foo' }]),
      })

      uidoc.sourceCreate('file.css', '')

      const content = uidoc.page('foo')

      expect(content).toBe('<html>page content</html>')
    })

    it('should return null for non-existing page', () => {
      const { uidoc } = uidocMock({})

      uidoc.sourceCreate('file.css', '')

      const content = uidoc.page('nonexistent')

      expect(content).toBeNull()
    })

    it('should emit page event', () => {
      const pageListener = vi.fn<EventListener<UIDocEventMap, 'page'>>()
      const { uidoc } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue(''),
        blockParserParse: vi
          .fn<BlockParser['parse']>()
          .mockReturnValue([{ key: 'foo', order: 0, title: 'Foo' }]),
      })

      uidoc.on('page', pageListener)
      uidoc.sourceCreate('file.css', '')

      uidoc.page('foo')

      expect(pageListener).toHaveBeenCalledWith(
        expect.objectContaining({
          page: expect.objectContaining({ id: 'foo' }),
        }),
      )
    })
  })

  describe('example', () => {
    it('should return example content for existing example', () => {
      const { uidoc } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue('<html>example</html>'),
        blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
          {
            key: 'foo',
            order: 0,
            title: 'Foo',
            example: { content: '<div>test</div>', type: 'html', title: 'Test' },
          },
        ]),
      })

      uidoc.sourceCreate('file.css', '')

      const content = uidoc.example('foo')

      expect(content).toBe('<html>example</html>')
    })

    it('should return null for non-existing example', () => {
      const { uidoc } = uidocMock({})

      uidoc.sourceCreate('file.css', '')

      const content = uidoc.example('nonexistent')

      expect(content).toBeNull()
    })

    it('should emit example event', () => {
      const exampleListener = vi.fn<EventListener<UIDocEventMap, 'example'>>()
      const { uidoc } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue(''),
        blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
          {
            key: 'foo',
            order: 0,
            title: 'Foo',
            example: { content: '<div>test</div>', type: 'html', title: 'Test' },
          },
        ]),
      })

      uidoc.on('example', exampleListener)
      uidoc.sourceCreate('file.css', '')

      uidoc.example('foo')

      expect(exampleListener).toHaveBeenCalledWith(
        expect.objectContaining({
          example: expect.objectContaining({ content: '<div>test</div>' }),
          layout: 'example',
        }),
      )
    })
  })

  describe('menu generation', () => {
    it('should sort menu items by order then alphabetically', () => {
      const { uidoc, renderer } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue(''),
        blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
          { key: 'charlie', order: 1, title: 'Charlie' },
          { key: 'alpha', order: 2, title: 'Alpha' },
          { key: 'bravo', order: 1, title: 'Bravo' },
        ]),
      })

      uidoc.sourceCreate('file.css', '')

      uidoc.page('charlie')

      expect(renderer.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          menu: [
            expect.objectContaining({ text: 'Bravo', order: 1 }),
            expect.objectContaining({ text: 'Charlie', order: 1 }),
            expect.objectContaining({ text: 'Alpha', order: 2 }),
          ],
        }),
        undefined,
      )
    })

    it('should not include index page in menu', () => {
      const { uidoc, renderer } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue(''),
        blockParserParse: vi
          .fn<BlockParser['parse']>()
          .mockReturnValue([{ key: 'foo', order: 0, title: 'Foo' }]),
      })

      uidoc.sourceCreate('file.css', '')

      uidoc.page('index')

      const call = renderer.generate.mock.calls[0]
      const context = call[0] as { menu: Array<{ text: string }> }
      const menuTexts = context.menu.map(item => item.text)

      expect(menuTexts).not.toContain('UI-Doc')
      expect(menuTexts).toContain('Foo')
    })

    it('should mark active menu item', () => {
      const { uidoc, renderer } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue(''),
        blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
          { key: 'foo', order: 0, title: 'Foo' },
          { key: 'bar', order: 0, title: 'Bar' },
        ]),
      })

      uidoc.sourceCreate('file.css', '')

      uidoc.page('foo')

      const call = renderer.generate.mock.calls[0]
      const context = call[0] as { menu: Array<{ text: string; active: boolean }> }
      const fooItem = context.menu.find(item => item.text === 'Foo')
      const barItem = context.menu.find(item => item.text === 'Bar')

      expect(fooItem?.active).toBe(true)
      expect(barItem?.active).toBe(false)
    })
  })

  describe('deep nested sections', () => {
    it('should handle 3 levels of nesting', () => {
      const { uidoc } = uidocMock({
        blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
          { key: 'page', order: 0, title: 'Page' },
          { key: 'page.section1', order: 0, title: 'Section 1' },
          { key: 'page.section1.subsection', order: 0, title: 'Subsection' },
        ]),
      })

      uidoc.sourceCreate('file.css', '')

      const entries = uidoc.entries()

      expect(entries.page.sections).toHaveLength(1)
      expect(entries.page.sections[0].id).toBe('section1')
      expect(entries.page.sections[0].titleLevel).toBe(2)
      expect(entries['page.section1'].sections).toHaveLength(1)
      // The id is generated from the full key minus the first part: section1.subsection -> section1-subsection
      expect(entries['page.section1'].sections[0].id).toBe('section1-subsection')
      expect(entries['page.section1.subsection'].titleLevel).toBe(3)
    })
  })

  describe('example listeners', () => {
    it('should auto-generate example id from key', () => {
      const { uidoc } = uidocMock({
        blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
          {
            key: 'page.section',
            order: 0,
            title: 'Section',
            example: { content: '<div>test</div>', type: 'html', title: '' },
          },
        ]),
      })

      uidoc.sourceCreate('file.css', '')

      const entries = uidoc.entries()

      expect(entries['page.section'].example?.id).toBe('page-section')
    })

    it('should auto-generate example file and src', () => {
      const { uidoc } = uidocMock({
        blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
          {
            key: 'foo',
            order: 0,
            title: 'Foo',
            example: { content: '<div>test</div>', type: 'html', title: '' },
          },
        ]),
      })

      uidoc.sourceCreate('file.css', '')

      const entries = uidoc.entries()

      expect(entries.foo.example?.file).toBe('examples/foo.html')
      expect(entries.foo.example?.src).toBe('examples/foo.html')
    })

    it('should remove example from context when entry is deleted', () => {
      const { uidoc } = uidocMock({
        blockParserParse: vi
          .fn<BlockParser['parse']>()
          .mockReturnValueOnce([
            {
              key: 'foo',
              order: 0,
              title: 'Foo',
              example: { content: '<div>test</div>', type: 'html', title: '' },
            },
          ])
          .mockReturnValueOnce([]),
      })

      uidoc.sourceCreate('file.css', '')

      expect(uidoc.example('foo')).not.toBeNull()

      uidoc.sourceUpdate('file.css', '')

      expect(uidoc.example('foo')).toBeNull()
    })

    it('should not process non-html examples', () => {
      const { uidoc } = uidocMock({
        blockParserParse: vi.fn<BlockParser['parse']>().mockReturnValue([
          {
            key: 'foo',
            order: 0,
            title: 'Foo',
            example: { content: 'console.log("test")', type: 'javascript', title: '' },
          },
        ]),
      })

      uidoc.sourceCreate('file.css', '')

      const content = uidoc.example('foo')

      expect(content).toBeNull()
    })
  })

  describe('constructor options', () => {
    it('should use default block parser when not provided', () => {
      const renderer = { generate: vi.fn<Renderer['generate']>() }
      const uidoc = new UIDoc({ renderer })

      expect(uidoc.blockParser).toBeDefined()
    })

    it('should use custom texts', () => {
      const { uidoc, renderer } = uidocMock({
        rendererGenerate: vi.fn<Renderer['generate']>().mockReturnValue(''),
      })

      const customUidoc = new UIDoc({
        blockParser: uidoc.blockParser,
        renderer,
        texts: { title: 'Custom Title', copyright: 'Custom Copyright' },
      })

      customUidoc.sourceCreate('file.css', '')
      customUidoc.page('index')

      expect(renderer.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Custom Title',
          title: 'Custom Title',
        }),
        undefined,
      )
    })
  })
})
