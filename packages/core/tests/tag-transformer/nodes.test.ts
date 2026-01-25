import { describe, expect, it } from 'vitest'

import { ColorParseError } from '../../src/errors/ColorParseError'
import { CSSParseError } from '../../src/errors/CSSParseError'
import { CSSColor, valueToHex, valueToRgb } from '../../src/tag-transformers/nodes/CSSColor'
import { CSSValue } from '../../src/tag-transformers/nodes/CSSValue'
import { CSSVariable } from '../../src/tag-transformers/nodes/CSSVariable'

describe('variable node', () => {
  it('should parse variable name', () => {
    expect(CSSVariable.fromString('--foo').name).toBe('--foo')
    expect(CSSVariable.fromString('--foo-bar').name).toBe('--foo-bar')
    expect(CSSVariable.fromString('--foo-bar-baz').name).toBe('--foo-bar-baz')
  })

  it('should throw error for invalid variable', () => {
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
  it('should parse hex color value', () => {
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

  it('should parse rgb color value', () => {
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

  it('should parse color value hex to rgb', () => {
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

  it('should parse color value rgb to hex', () => {
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

  it('should throw error for invalid color', () => {
    expect(() => CSSColor.fromString('invalid')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('#ff')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('fff')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('ffg')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('255 255')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('255 255 255 255')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('255 255 255 255 255')).toThrow(ColorParseError)
    expect(() => CSSColor.fromString('255 255 256')).toThrow(ColorParseError)
  })

  it('should detect hex string correctly', () => {
    expect(CSSColor.isHexString('#fff')).toBe(true)
    expect(CSSColor.isHexString('#ffffff')).toBe(true)
    expect(CSSColor.isHexString('fff')).toBe(false)
    expect(CSSColor.isHexString('255 255 255')).toBe(false)
  })

  it('should detect rgb string correctly', () => {
    expect(CSSColor.isRgbString('255 255 255')).toBe(true)
    expect(CSSColor.isRgbString('0 0 0')).toBe(true)
    expect(CSSColor.isRgbString('#fff')).toBe(false)
    expect(CSSColor.isRgbString('ffffff')).toBe(false)
  })

  it('should have correct output property', () => {
    const color = CSSColor.fromString('#ff0000')

    expect(color.output).toBe('255 0 0')
  })

  it('should return rgb string from toString', () => {
    const color = CSSColor.fromString('#00ff00')

    expect(color.toString()).toBe('0 255 0')
  })

  it('should throw ColorParseError for negative rgb values', () => {
    expect(() => CSSColor.fromString('-1 0 0')).toThrow(ColorParseError)
  })
})

describe('valueToHex', () => {
  it('should convert rgb value to hex string', () => {
    expect(valueToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000')
    expect(valueToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00')
    expect(valueToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff')
    expect(valueToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
    expect(valueToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
  })

  it('should pad single digit hex values', () => {
    expect(valueToHex({ r: 1, g: 2, b: 3 })).toBe('#010203')
  })
})

describe('valueToRgb', () => {
  it('should convert rgb value to rgb string', () => {
    expect(valueToRgb({ r: 255, g: 0, b: 0 })).toBe('255 0 0')
    expect(valueToRgb({ r: 0, g: 255, b: 0 })).toBe('0 255 0')
    expect(valueToRgb({ r: 0, g: 0, b: 255 })).toBe('0 0 255')
  })
})

describe('cSSValue node', () => {
  it('should create value from string', () => {
    const value = CSSValue.fromString('10px')

    expect(value.value).toBe('10px')
  })

  it('should return value from toString', () => {
    const value = CSSValue.fromString('1rem')

    expect(value.toString()).toBe('1rem')
  })

  it('should have output equal to value', () => {
    const value = CSSValue.fromString('2em')

    expect(value.output).toBe('2em')
  })

  it('should handle complex CSS values', () => {
    const value = CSSValue.fromString('calc(100% - 20px)')

    expect(value.value).toBe('calc(100% - 20px)')
    expect(value.output).toBe('calc(100% - 20px)')
  })
})

describe('cSSVariable node additional tests', () => {
  it('should detect variable string correctly', () => {
    expect(CSSVariable.isVariableString('--my-var')).toBe(true)
    // Note: regex requires at least 2 chars after '--' so '--a' is false
    expect(CSSVariable.isVariableString('--ab')).toBe(true)
    expect(CSSVariable.isVariableString('--foo-bar-baz')).toBe(true)
    expect(CSSVariable.isVariableString('-my-var')).toBe(false)
    expect(CSSVariable.isVariableString('my-var')).toBe(false)
    expect(CSSVariable.isVariableString('--')).toBe(false)
    expect(CSSVariable.isVariableString('--a')).toBe(false)
  })

  it('should return var() wrapped name from toString', () => {
    const variable = CSSVariable.fromString('--my-color')

    expect(variable.toString()).toBe('var(--my-color)')
  })

  it('should have output equal to var() wrapped name', () => {
    const variable = CSSVariable.fromString('--spacing')

    expect(variable.output).toBe('var(--spacing)')
  })

  it('should throw CSSParseError with descriptive message', () => {
    expect(() => CSSVariable.fromString('invalid')).toThrow('Invalid CSS variable: invalid')
  })
})
