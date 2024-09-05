/* eslint-disable sort-keys */
import { describe, expect, test } from '@jest/globals'

import { ColorParseError } from '../../src/errors/ColorParseError'
import { isValidHTML } from '../../src/tag-transformers/utils'
import * as color from '../../src/tag-transformers/utils/color'

describe('tag transformer utilities', () => {
  test.each([
    '<div>test</div>',
    '<div>test</div><div>test</div>',
    '<div>test</div><div>test</div><div>test</div>',
    '<div>test</div><div>test</div><div>test</div><div>test</div>',
    '<div class="foo">test</div>',
    '<div class="foo">test</div><div class="foo">test</div>',
    '<p>test</p>',
    '<p>test</p><p>test</p>',
    '<br/>',
    '<br/><br/>',
    '<div>test</div>\n<div>test</div>',
    '<div>\n<div>test</div>\n</div>',
    '<p>Testing</p> <p>Testing</p>',
    '<div>Test<br>Test<div>foo</div><p>bar</p></div>',
    '<!-- test comment --><div>Test</div>',
    '<div>Test <!-- test comment --> </div>',
    '<input type="submit" class="btn" value="Submit button" />',
  ])('should be valid html:\n%s', html => {
    expect(isValidHTML(html)).toBe(true)
  })

  test.each(['<>', '<><>', '<div>foo<p>bar</p>', '<div>\n', '<div>foo</p>', '<div>foo</p></div>'])(
    'should be invalid html:\n%s',
    html => {
      expect(isValidHTML(html)).toBe(false)
    },
  )
})

describe('color utilities', () => {
  test('should parse hex color', () => {
    expect(color.colorValueFromHex('#fff')).toMatchObject({ r: 255, g: 255, b: 255 })
    expect(color.colorValueFromHex('#000')).toMatchObject({ r: 0, g: 0, b: 0 })
    expect(color.colorValueFromHex('#f00')).toMatchObject({ r: 255, g: 0, b: 0 })
    expect(color.colorValueFromHex('#00f')).toMatchObject({ r: 0, g: 0, b: 255 })
    expect(color.colorValueFromHex('#0f0')).toMatchObject({ r: 0, g: 255, b: 0 })
    expect(color.colorValueFromHex('#ff0')).toMatchObject({ r: 255, g: 255, b: 0 })
    expect(color.colorValueFromHex('#f0f')).toMatchObject({ r: 255, g: 0, b: 255 })
    expect(color.colorValueFromHex('#0ff')).toMatchObject({ r: 0, g: 255, b: 255 })
    expect(color.colorValueFromHex('#123456')).toMatchObject({ r: 18, g: 52, b: 86 })
  })

  test('should parse rgb color', () => {
    expect(color.colorValueFromRgb('255 255 255')).toMatchObject({ r: 255, g: 255, b: 255 })
    expect(color.colorValueFromRgb('0 0 0')).toMatchObject({ r: 0, g: 0, b: 0 })
    expect(color.colorValueFromRgb('255 0 0')).toMatchObject({ r: 255, g: 0, b: 0 })
    expect(color.colorValueFromRgb('0 0 255')).toMatchObject({ r: 0, g: 0, b: 255 })
    expect(color.colorValueFromRgb('0 255 0')).toMatchObject({ r: 0, g: 255, b: 0 })
    expect(color.colorValueFromRgb('255 255 0')).toMatchObject({ r: 255, g: 255, b: 0 })
    expect(color.colorValueFromRgb('255 0 255')).toMatchObject({ r: 255, g: 0, b: 255 })
    expect(color.colorValueFromRgb('0 255 255')).toMatchObject({ r: 0, g: 255, b: 255 })
    expect(color.colorValueFromRgb('18 52 86')).toMatchObject({ r: 18, g: 52, b: 86 })
  })

  test('should parse color value hex to rgb', () => {
    expect(color.colorValue('#fff')).toMatchObject({ hex: '#ffffff', rgb: '255 255 255' })
    expect(color.colorValue('#000')).toMatchObject({ hex: '#000000', rgb: '0 0 0' })
    expect(color.colorValue('#f00')).toMatchObject({ hex: '#ff0000', rgb: '255 0 0' })
    expect(color.colorValue('#00f')).toMatchObject({ hex: '#0000ff', rgb: '0 0 255' })
    expect(color.colorValue('#0f0')).toMatchObject({ hex: '#00ff00', rgb: '0 255 0' })
    expect(color.colorValue('#ff0')).toMatchObject({ hex: '#ffff00', rgb: '255 255 0' })
    expect(color.colorValue('#f0f')).toMatchObject({ hex: '#ff00ff', rgb: '255 0 255' })
    expect(color.colorValue('#0ff')).toMatchObject({ hex: '#00ffff', rgb: '0 255 255' })
    expect(color.colorValue('#123456')).toMatchObject({ hex: '#123456', rgb: '18 52 86' })
  })

  test('should parse color value rgb to hex', () => {
    expect(color.colorValue('255 255 255')).toMatchObject({ hex: '#ffffff', rgb: '255 255 255' })
    expect(color.colorValue('0 0 0')).toMatchObject({ hex: '#000000', rgb: '0 0 0' })
    expect(color.colorValue('255 0 0')).toMatchObject({ hex: '#ff0000', rgb: '255 0 0' })
    expect(color.colorValue('0 0 255')).toMatchObject({ hex: '#0000ff', rgb: '0 0 255' })
    expect(color.colorValue('0 255 0')).toMatchObject({ hex: '#00ff00', rgb: '0 255 0' })
    expect(color.colorValue('255 255 0')).toMatchObject({ hex: '#ffff00', rgb: '255 255 0' })
    expect(color.colorValue('255 0 255')).toMatchObject({ hex: '#ff00ff', rgb: '255 0 255' })
    expect(color.colorValue('0 255 255')).toMatchObject({ hex: '#00ffff', rgb: '0 255 255' })
    expect(color.colorValue('18 52 86')).toMatchObject({ hex: '#123456', rgb: '18 52 86' })
  })

  test('should throw error for invalid color', () => {
    expect(() => color.colorValue('invalid')).toThrow(ColorParseError)
    expect(() => color.colorValue('#ff')).toThrow(ColorParseError)
    expect(() => color.colorValue('fff')).toThrow(ColorParseError)
    expect(() => color.colorValue('ffg')).toThrow(ColorParseError)
    expect(() => color.colorValue('255 255')).toThrow(ColorParseError)
    expect(() => color.colorValue('255 255 255 255')).toThrow(ColorParseError)
    expect(() => color.colorValue('255 255 255 255 255')).toThrow(ColorParseError)
    expect(() => color.colorValue('255 255 256')).toThrow(ColorParseError)
  })
})
