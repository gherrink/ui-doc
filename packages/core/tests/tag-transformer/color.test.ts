import { describe, expect, test } from '@jest/globals'

import color from '../../src/tag-transformers/color'
import { Block } from '../../src/types'

describe('Color tag transformer', () => {
  test('should transform with hex', () => {
    const comment = {
      description: 'White',
      name: '@color-white',
      optional: false,
      problems: [],
      source: [],
      tag: 'color',
      type: '#fff',
    }
    const block: Partial<Block> = {}

    color.transform(block, comment)

    expect(block).toHaveProperty('colors')
    if (!block.colors) {
      return
    }
    expect(block.colors).toHaveLength(1)
    expect(block.colors[0]).toMatchObject({
      font: undefined,
      name: '@color-white',
      text: 'White',
      value: { hex: '#ffffff', rgb: '255 255 255' },
    })
  })

  test('should transform font color with hex', () => {
    const comment = {
      description: 'White',
      name: '@color-white',
      optional: false,
      problems: [],
      source: [],
      tag: 'color',
      type: '#fff|#000',
    }
    const block: Partial<Block> = {}

    color.transform(block, comment)

    expect(block).toHaveProperty('colors')
    if (!block.colors) {
      return
    }
    expect(block.colors).toHaveLength(1)
    expect(block.colors[0]).toMatchObject({
      font: { hex: '#000000', rgb: '0 0 0' },
      name: '@color-white',
      text: 'White',
      value: { hex: '#ffffff', rgb: '255 255 255' },
    })
  })

  test('should transform with rgb', () => {
    const comment = {
      description: 'White',
      name: '@color-white',
      optional: false,
      problems: [],
      source: [],
      tag: 'color',
      type: '255 255 255',
    }
    const block: Partial<Block> = {}

    color.transform(block, comment)

    expect(block).toHaveProperty('colors')
    if (!block.colors) {
      return
    }
    expect(block.colors).toHaveLength(1)
    expect(block.colors[0]).toMatchObject({
      font: undefined,
      name: '@color-white',
      text: 'White',
      value: { hex: '#ffffff', rgb: '255 255 255' },
    })
  })

  test('should transform font color with rgb', () => {
    const comment = {
      description: 'White',
      name: '@color-white',
      optional: false,
      problems: [],
      source: [],
      tag: 'color',
      type: '255 255 255|0 0 0',
    }
    const block: Partial<Block> = {}

    color.transform(block, comment)

    expect(block).toHaveProperty('colors')
    if (!block.colors) {
      return
    }
    expect(block.colors).toHaveLength(1)
    expect(block.colors[0]).toMatchObject({
      font: { hex: '#000000', rgb: '0 0 0' },
      name: '@color-white',
      text: 'White',
      value: { hex: '#ffffff', rgb: '255 255 255' },
    })
  })

  test('should transform hex and rgb fixed', () => {
    const comment = {
      description: 'White',
      name: '@color-white',
      optional: false,
      problems: [],
      source: [],
      tag: 'color',
      type: '255 255 255|#000',
    }
    const block: Partial<Block> = {}

    color.transform(block, comment)

    expect(block).toHaveProperty('colors')
    if (!block.colors) {
      return
    }
    expect(block.colors).toHaveLength(1)
    expect(block.colors[0]).toMatchObject({
      font: { hex: '#000000', rgb: '0 0 0' },
      name: '@color-white',
      text: 'White',
      value: { hex: '#ffffff', rgb: '255 255 255' },
    })
  })

  test('should transform multiple colors', () => {
    const block: Partial<Block> = {}

    color.transform(block, {
      description: 'White',
      name: '@color-white',
      optional: false,
      problems: [],
      source: [],
      tag: 'color',
      type: '#fff|#000',
    })

    color.transform(block, {
      description: 'Black',
      name: '@color-black',
      optional: false,
      problems: [],
      source: [],
      tag: 'color',
      type: '#000|#fff',
    })

    expect(block).toHaveProperty('colors')
    if (!block.colors) {
      return
    }
    expect(block.colors).toHaveLength(2)
    expect(block.colors[0]).toMatchObject({
      font: { hex: '#000000', rgb: '0 0 0' },
      name: '@color-white',
      text: 'White',
      value: { hex: '#ffffff', rgb: '255 255 255' },
    })
    expect(block.colors[1]).toMatchObject({
      font: { hex: '#ffffff', rgb: '255 255 255' },
      name: '@color-black',
      text: 'Black',
      value: { hex: '#000000', rgb: '0 0 0' },
    })
  })

  test('should not transform without background color', () => {
    const comment = {
      description: 'White',
      name: '@color-white',
      optional: false,
      problems: [],
      source: [],
      tag: 'color',
      type: '',
    }
    let block: Partial<Block> = {}

    block = color.transform(block, comment)

    expect(block).not.toHaveProperty('colors')
  })

  test('should not transform without name', () => {
    const comment = {
      description: 'White',
      name: '',
      optional: false,
      problems: [],
      source: [],
      tag: 'color',
      type: '#fff',
    }
    let block: Partial<Block> = {}

    block = color.transform(block, comment)

    expect(block).not.toHaveProperty('colors')
  })

  test('should not transform without description', () => {
    const comment = {
      description: '',
      name: '@color-white',
      optional: false,
      problems: [],
      source: [],
      tag: 'color',
      type: '#fff',
    }
    let block: Partial<Block> = {}

    block = color.transform(block, comment)

    expect(block).not.toHaveProperty('colors')
  })

  test('should throw error on invalid color', () => {
    const comment = {
      description: 'White',
      name: '@color-white',
      optional: false,
      problems: [],
      source: [],
      tag: 'color',
      type: 'invalid',
    }
    const block: Partial<Block> = {}

    expect(() => color.transform(block, comment)).toThrow('Could not parse color value')
  })
})
