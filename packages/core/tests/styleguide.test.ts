import { describe, expect, jest, test } from '@jest/globals'

import { Styleguide } from '../src/Styleguide'
import type { BlockParserInterface, RendererInterface } from '../src/types'

describe('Styleguide', () => {
  const styleguideMock = ({
    rendererGenerate = jest.fn<RendererInterface['generate']>(),
    blockParserParse = jest.fn<BlockParserInterface['parse']>().mockReturnValue([]),
    blockParserRegisterTagTransformer = jest.fn<BlockParserInterface['registerTagTransformer']>(),
  }) => {
    const renderer = {
      generate: rendererGenerate,
    }

    const blockParser = {
      parse: blockParserParse,
      registerTagTransformer: blockParserRegisterTagTransformer,
    }

    const styleguide = new Styleguide({
      blockParser,
      renderer,
    })

    return {
      blockParser,
      renderer,
      styleguide,
    }
  }

  test('should register', () => {
    const { styleguide } = styleguideMock({
      blockParserParse: jest.fn<BlockParserInterface['parse']>().mockReturnValue([
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

    styleguide.sourceCreate('file.css', '')
    const entries = styleguide.entries()
    const pages = styleguide.pages()

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
          titleLevel: 3,
        },
      ],
      title: 'Foo',
      titleLevel: 2,
    })
    expect(entries.bar).toEqual({
      description: 'Bar description',
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Bar',
      titleLevel: 2,
    })
    expect(entries['foo.bar']).toEqual({
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 3,
    })

    expect(pages.length).toBe(2)
  })

  test('changes should be applied', () => {
    const { styleguide } = styleguideMock({
      blockParserParse: jest
        .fn<BlockParserInterface['parse']>()
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

    styleguide.sourceCreate('file.css', '')

    const entriesFirst = styleguide.entries()

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
          titleLevel: 3,
        },
      ],
      title: 'Foo',
      titleLevel: 2,
    })
    expect(entriesFirst['foo.bar']).toEqual({
      description: 'Foo Bar description',
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 3,
    })

    styleguide.sourceUpdate('file.css', '')

    const entriesSecond = styleguide.entries()

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
          titleLevel: 3,
        },
      ],
      title: 'Foo',
      titleLevel: 2,
    })
    expect(entriesSecond['foo.bar']).toEqual({
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar 2',
      titleLevel: 3,
    })
  })

  test('when blocks get removed they should be removed from context', () => {
    const { styleguide } = styleguideMock({
      blockParserParse: jest
        .fn<BlockParserInterface['parse']>()
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

    styleguide.sourceCreate('file.css', '')

    const entriesFirst = styleguide.entries()

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
          titleLevel: 3,
        },
      ],
      title: 'Foo',
      titleLevel: 2,
    })
    expect(entriesFirst['foo.bar']).toEqual({
      description: 'Foo Bar description',
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 3,
    })

    styleguide.sourceUpdate('file.css', '')

    const entriesSecond = styleguide.entries()

    expect(Object.keys(entriesSecond)).toEqual(['foo'])
    expect(entriesSecond.foo).toEqual({
      id: 'foo',
      order: 0,
      sections: [],
      title: 'Foo',
      titleLevel: 2,
    })
  })

  test('when blocks get witch has children they should only reset', () => {
    const { styleguide } = styleguideMock({
      blockParserParse: jest
        .fn<BlockParserInterface['parse']>()
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

    styleguide.sourceCreate('file.css', '')

    const entriesFirst = styleguide.entries()

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
          titleLevel: 3,
        },
      ],
      title: 'Foo',
      titleLevel: 2,
    })
    expect(entriesFirst['foo.bar']).toEqual({
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 3,
    })

    styleguide.sourceUpdate('file.css', '')

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
          titleLevel: 3,
        },
      ],
      title: 'Foo',
      titleLevel: 2,
    })
    expect(entriesFirst['foo.bar']).toEqual({
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 3,
    })
  })

  test('when blocks get removed they should be removed from context', () => {
    const { styleguide } = styleguideMock({
      blockParserParse: jest.fn<BlockParserInterface['parse']>().mockReturnValue([
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

    styleguide.sourceCreate('file.css', '')

    const entries = styleguide.entries()

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
          titleLevel: 3,
        },
      ],
      title: 'Foo',
      titleLevel: 2,
    })
    expect(entries['foo.bar']).toEqual({
      description: 'Foo Bar description',
      id: 'bar',
      order: 0,
      sections: [],
      title: 'Foo Bar',
      titleLevel: 3,
    })

    styleguide.sourceDelete('file.css')

    const entriesDeleted = styleguide.entries()

    expect(Object.keys(entriesDeleted)).toEqual([])
    expect(entriesDeleted.foo).toBeUndefined()
    expect(entriesDeleted['foo.bar']).toBeUndefined()
    expect(styleguide.pages().length).toBe(0)
  })
})
