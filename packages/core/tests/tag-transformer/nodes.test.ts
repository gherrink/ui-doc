/* eslint-disable sort-keys */
import { describe, expect, test } from '@jest/globals'

import { ColorParseError } from '../../src/errors/ColorParseError'
import { CSSParseError } from '../../src/errors/CSSParseError'
import { CSSColor } from '../../src/tag-transformers/nodes/CSSColor'
import { CSSVariable } from '../../src/tag-transformers/nodes/CSSVariable'

describe('variable node', () => {
  test('should parse variable name', () => {
    expect(CSSVariable.fromString('--foo').name).toBe('--foo')
    expect(CSSVariable.fromString('--foo-bar').name).toBe('--foo-bar')
    expect(CSSVariable.fromString('--foo-bar-baz').name).toBe('--foo-bar-baz')
  })

  test('should throw error for invalid variable', () => {
    expect(() => CSSVariable.fromString('foo')).toThrow(CSSParseError)
    expect(() => CSSVariable.fromString('foo-bar')).toThrow(CSSParseError)
    expect(() => CSSVariable.fromString('foo-bar-baz')).toThrow(CSSParseError)
    expect(() => CSSVariable.fromString('foo-bar-baz-')).toThrow(CSSParseError)
    expect(() => CSSVariable.fromString('foo-bar-baz-1')).toThrow(CSSParseError)
    expect(() => CSSVariable.fromString('foo-bar-baz-1-')).toThrow(CSSParseError)
    expect(() => CSSVariable.fromString('foo-bar-baz-1-2')).toThrow(CSSParseError)
  })
})

describe('color node', () => {
  test('should parse hex color value', () => {
    expect(CSSColor.hexToValue('#fff')).toMatchObject({ r: 255, g: 255, b: 255 })
    expect(CSSColor.hexToValue('#000')).toMatchObject({ r: 0, g: 0, b: 0 })
    expect(CSSColor.hexToValue('#f00')).toMatchObject({ r: 255, g: 0, b: 0 })
    expect(CSSColor.hexToValue('#00f')).toMatchObject({ r: 0, g: 0, b: 255 })
    expect(CSSColor.hexToValue('#0f0')).toMatchObject({ r: 0, g: 255, b: 0 })
    expect(CSSColor.hexToValue('#ff0')).toMatchObject({ r: 255, g: 255, b: 0 })
    expect(CSSColor.hexToValue('#f0f')).toMatchObject({ r: 255, g: 0, b: 255 })
    expect(CSSColor.hexToValue('#0ff')).toMatchObject({ r: 0, g: 255, b: 255 })
    expect(CSSColor.hexToValue('#123456')).toMatchObject({ r: 18, g: 52, b: 86 })
  })

  test('should parse rgb color value', () => {
    expect(CSSColor.rgbToValue('255 255 255')).toMatchObject({ r: 255, g: 255, b: 255 })
    expect(CSSColor.rgbToValue('0 0 0')).toMatchObject({ r: 0, g: 0, b: 0 })
    expect(CSSColor.rgbToValue('255 0 0')).toMatchObject({ r: 255, g: 0, b: 0 })
    expect(CSSColor.rgbToValue('0 0 255')).toMatchObject({ r: 0, g: 0, b: 255 })
    expect(CSSColor.rgbToValue('0 255 0')).toMatchObject({ r: 0, g: 255, b: 0 })
    expect(CSSColor.rgbToValue('255 255 0')).toMatchObject({ r: 255, g: 255, b: 0 })
    expect(CSSColor.rgbToValue('255 0 255')).toMatchObject({ r: 255, g: 0, b: 255 })
    expect(CSSColor.rgbToValue('0 255 255')).toMatchObject({ r: 0, g: 255, b: 255 })
    expect(CSSColor.rgbToValue('18 52 86')).toMatchObject({ r: 18, g: 52, b: 86 })
  })

  test('should parse color value hex to rgb', () => {
    expect(CSSColor.fromString('#fff')).toMatchObject({ hex: '#ffffff', rgb: '255 255 255' })
    expect(CSSColor.fromString('#000')).toMatchObject({ hex: '#000000', rgb: '0 0 0' })
    expect(CSSColor.fromString('#f00')).toMatchObject({ hex: '#ff0000', rgb: '255 0 0' })
    expect(CSSColor.fromString('#00f')).toMatchObject({ hex: '#0000ff', rgb: '0 0 255' })
    expect(CSSColor.fromString('#0f0')).toMatchObject({ hex: '#00ff00', rgb: '0 255 0' })
    expect(CSSColor.fromString('#ff0')).toMatchObject({ hex: '#ffff00', rgb: '255 255 0' })
    expect(CSSColor.fromString('#f0f')).toMatchObject({ hex: '#ff00ff', rgb: '255 0 255' })
    expect(CSSColor.fromString('#0ff')).toMatchObject({ hex: '#00ffff', rgb: '0 255 255' })
    expect(CSSColor.fromString('#123456')).toMatchObject({ hex: '#123456', rgb: '18 52 86' })
  })

  test('should parse color value rgb to hex', () => {
    expect(CSSColor.fromString('255 255 255')).toMatchObject({ hex: '#ffffff', rgb: '255 255 255' })
    expect(CSSColor.fromString('0 0 0')).toMatchObject({ hex: '#000000', rgb: '0 0 0' })
    expect(CSSColor.fromString('255 0 0')).toMatchObject({ hex: '#ff0000', rgb: '255 0 0' })
    expect(CSSColor.fromString('0 0 255')).toMatchObject({ hex: '#0000ff', rgb: '0 0 255' })
    expect(CSSColor.fromString('0 255 0')).toMatchObject({ hex: '#00ff00', rgb: '0 255 0' })
    expect(CSSColor.fromString('255 255 0')).toMatchObject({ hex: '#ffff00', rgb: '255 255 0' })
    expect(CSSColor.fromString('255 0 255')).toMatchObject({ hex: '#ff00ff', rgb: '255 0 255' })
    expect(CSSColor.fromString('0 255 255')).toMatchObject({ hex: '#00ffff', rgb: '0 255 255' })
    expect(CSSColor.fromString('18 52 86')).toMatchObject({ hex: '#123456', rgb: '18 52 86' })
  })

  test('should throw error for invalid color', () => {
    expect(() => CSSColor.fromString('invalid')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('#ff')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('fff')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('ffg')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('255 255')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('255 255 255 255')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('255 255 255 255 255')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('255 255 256')).toThrow(ColorParseError)
  })
})
