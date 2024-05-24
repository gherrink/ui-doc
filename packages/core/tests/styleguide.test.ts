import {
  describe, expect, jest, test,
} from '@jest/globals'

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
      renderer,
      blockParser,
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
          key: 'foo', order: 0, title: 'Foo',
        },
        {
          key: 'bar', order: 0, title: 'Bar', description: 'Bar description',
        },
        {
          key: 'foo.bar', order: 0, title: 'Foo Bar',
        },
      ]),
    })

    styleguide.sourceCreate('file.css', '')
    const entries = styleguide.entries()
    const pages = styleguide.pages()

    expect(Object.keys(entries)).toEqual(['foo', 'bar', 'foo.bar'])
    expect(entries.foo).toEqual({
      id: 'foo',
      title: 'Foo',
      order: 0,
      titleLevel: 2,
      sections: [{
        id: 'bar',
        title: 'Foo Bar',
        order: 0,
        titleLevel: 3,
        sections: [],
      }],
    })
    expect(entries.bar).toEqual({
      id: 'bar',
      title: 'Bar',
      order: 0,
      titleLevel: 2,
      description: 'Bar description',
      sections: [],
    })
    expect(entries['foo.bar']).toEqual({
      id: 'bar',
      title: 'Foo Bar',
      order: 0,
      titleLevel: 3,
      sections: [],
    })

    expect(pages.length).toBe(2)
  })

  test('changes should be applied', () => {
    const { styleguide } = styleguideMock({
      blockParserParse: jest.fn<BlockParserInterface['parse']>()
        .mockReturnValueOnce([
          {
            key: 'foo', order: 0, title: 'Foo',
          },
          {
            key: 'foo.bar', order: 0, title: 'Foo Bar', description: 'Foo Bar description',
          },
        ])
        .mockReturnValueOnce([
          {
            key: 'foo', order: 0, title: 'Foo',
          },
          {
            key: 'foo.bar', order: 0, title: 'Foo Bar 2',
          },
        ]),
    })

    styleguide.sourceCreate('file.css', '')

    const entriesFirst = styleguide.entries()

    expect(Object.keys(entriesFirst)).toEqual(['foo', 'foo.bar'])
    expect(entriesFirst.foo).toEqual({
      id: 'foo',
      title: 'Foo',
      order: 0,
      titleLevel: 2,
      sections: [{
        id: 'bar',
        title: 'Foo Bar',
        description: 'Foo Bar description',
        order: 0,
        titleLevel: 3,
        sections: [],
      }],
    })
    expect(entriesFirst['foo.bar']).toEqual({
      id: 'bar',
      title: 'Foo Bar',
      description: 'Foo Bar description',
      order: 0,
      titleLevel: 3,
      sections: [],
    })

    styleguide.sourceUpdate('file.css', '')

    const entriesSecond = styleguide.entries()

    expect(Object.keys(entriesSecond)).toEqual(['foo', 'foo.bar'])
    expect(entriesSecond.foo).toEqual({
      id: 'foo',
      title: 'Foo',
      order: 0,
      titleLevel: 2,
      sections: [{
        id: 'bar',
        title: 'Foo Bar 2',
        order: 0,
        titleLevel: 3,
        sections: [],
      }],
    })
    expect(entriesSecond['foo.bar']).toEqual({
      id: 'bar',
      title: 'Foo Bar 2',
      order: 0,
      titleLevel: 3,
      sections: [],
    })
  })

  test('when blocks get removed they should be removed from context', () => {
    const { styleguide } = styleguideMock({
      blockParserParse: jest.fn<BlockParserInterface['parse']>()
        .mockReturnValueOnce([
          {
            key: 'foo', order: 0, title: 'Foo',
          },
          {
            key: 'foo.bar', order: 0, title: 'Foo Bar', description: 'Foo Bar description',
          },
        ])
        .mockReturnValueOnce([
          {
            key: 'foo', order: 0, title: 'Foo',
          },
        ]),
    })

    styleguide.sourceCreate('file.css', '')

    const entriesFirst = styleguide.entries()

    expect(Object.keys(entriesFirst)).toEqual(['foo', 'foo.bar'])
    expect(entriesFirst.foo).toEqual({
      id: 'foo',
      title: 'Foo',
      order: 0,
      titleLevel: 2,
      sections: [{
        id: 'bar',
        title: 'Foo Bar',
        description: 'Foo Bar description',
        order: 0,
        titleLevel: 3,
        sections: [],
      }],
    })
    expect(entriesFirst['foo.bar']).toEqual({
      id: 'bar',
      title: 'Foo Bar',
      description: 'Foo Bar description',
      order: 0,
      titleLevel: 3,
      sections: [],
    })

    styleguide.sourceUpdate('file.css', '')

    const entriesSecond = styleguide.entries()

    expect(Object.keys(entriesSecond)).toEqual(['foo'])
    expect(entriesSecond.foo).toEqual({
      id: 'foo',
      title: 'Foo',
      order: 0,
      titleLevel: 2,
      sections: [],
    })
  })

  test('when blocks get witch has children they should only reset', () => {
    const { styleguide } = styleguideMock({
      blockParserParse: jest.fn<BlockParserInterface['parse']>()
        .mockReturnValueOnce([
          {
            key: 'foo', order: 0, title: 'Foo', description: 'Foo description',
          },
          {
            key: 'foo.bar', order: 0, title: 'Foo Bar',
          },
        ])
        .mockReturnValueOnce([
          {
            key: 'foo.bar', order: 0, title: 'Foo Bar',
          },
        ]),
    })

    styleguide.sourceCreate('file.css', '')

    const entriesFirst = styleguide.entries()

    expect(Object.keys(entriesFirst)).toEqual(['foo', 'foo.bar'])
    expect(entriesFirst.foo).toEqual({
      id: 'foo',
      title: 'Foo',
      order: 0,
      titleLevel: 2,
      description: 'Foo description',
      sections: [{
        id: 'bar',
        title: 'Foo Bar',
        order: 0,
        titleLevel: 3,
        sections: [],
      }],
    })
    expect(entriesFirst['foo.bar']).toEqual({
      id: 'bar',
      title: 'Foo Bar',
      order: 0,
      titleLevel: 3,
      sections: [],
    })

    styleguide.sourceUpdate('file.css', '')

    expect(Object.keys(entriesFirst)).toEqual(['foo', 'foo.bar'])
    expect(entriesFirst.foo).toEqual({
      id: 'foo',
      title: 'Foo',
      order: 0,
      titleLevel: 2,
      sections: [{
        id: 'bar',
        title: 'Foo Bar',
        order: 0,
        titleLevel: 3,
        sections: [],
      }],
    })
    expect(entriesFirst['foo.bar']).toEqual({
      id: 'bar',
      title: 'Foo Bar',
      order: 0,
      titleLevel: 3,
      sections: [],
    })
  })

  test('when blocks get removed they should be removed from context', () => {
    const { styleguide } = styleguideMock({
      blockParserParse: jest.fn<BlockParserInterface['parse']>()
        .mockReturnValue([
          {
            key: 'foo', order: 0, title: 'Foo',
          },
          {
            key: 'foo.bar', order: 0, title: 'Foo Bar', description: 'Foo Bar description',
          },
        ]),
    })

    styleguide.sourceCreate('file.css', '')

    const entries = styleguide.entries()

    expect(Object.keys(entries)).toEqual(['foo', 'foo.bar'])
    expect(entries.foo).toEqual({
      id: 'foo',
      title: 'Foo',
      order: 0,
      titleLevel: 2,
      sections: [{
        id: 'bar',
        title: 'Foo Bar',
        description: 'Foo Bar description',
        order: 0,
        titleLevel: 3,
        sections: [],
      }],
    })
    expect(entries['foo.bar']).toEqual({
      id: 'bar',
      title: 'Foo Bar',
      description: 'Foo Bar description',
      order: 0,
      titleLevel: 3,
      sections: [],
    })

    styleguide.sourceDelete('file.css')

    const entriesDeleted = styleguide.entries()

    expect(Object.keys(entriesDeleted)).toEqual([])
    expect(entriesDeleted.foo).toBeUndefined()
    expect(entriesDeleted['foo.bar']).toBeUndefined()
    expect(styleguide.pages().length).toBe(0)
  })
})
