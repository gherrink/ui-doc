import { describe, expect, jest, test } from '@jest/globals'

import type { BlockParser, Renderer } from '../src/types'
import { UIDoc } from '../src/UIDoc'

describe('UI-Doc', () => {
  const uidocMock = ({
    rendererGenerate = jest.fn<Renderer['generate']>(),
    blockParserParse = jest.fn<BlockParser['parse']>().mockReturnValue([]),
    blockParserRegisterTagTransformer = jest.fn<BlockParser['registerTagTransformer']>(),
  }) => {
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

  test('should register', () => {
    const { uidoc } = uidocMock({
      blockParserParse: jest.fn<BlockParser['parse']>().mockReturnValue([
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

  test('changes should be applied', () => {
    const { uidoc } = uidocMock({
      blockParserParse: jest
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

  test('when blocks get removed they should be removed from context', () => {
    const { uidoc } = uidocMock({
      blockParserParse: jest
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

  test('when top level blocks get removed they should be removed from context', () => {
    const { uidoc } = uidocMock({
      blockParserParse: jest
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

  test('when blocks get witch has children they should only reset', () => {
    const { uidoc } = uidocMock({
      blockParserParse: jest
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

  test('when blocks get removed they should be removed from context', () => {
    const { uidoc } = uidocMock({
      blockParserParse: jest.fn<BlockParser['parse']>().mockReturnValue([
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
})
