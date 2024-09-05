import { ColorParseError } from '../../errors/ColorParseError'
import type { Color } from '../../types'

function unifyHex(hex: string): string {
  return hex.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    // @ts-ignore
    (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`,
  )
}

function isHexString(color: string): boolean {
  return color.startsWith('#')
}

function isRgbString(color: string): boolean {
  return color.includes(' ')
}

function isValidColorValue(value: any): boolean {
  return (
    typeof value === 'object' &&
    value.r !== undefined &&
    value.g !== undefined &&
    value.b !== undefined &&
    value.r >= 0 &&
    value.r <= 255 &&
    value.g >= 0 &&
    value.g <= 255 &&
    value.b >= 0 &&
    value.b <= 255
  )
}

export function colorValueFromRgb(color: string): Color['value'] {
  const values = color.split(' ').map(x => parseInt(x, 10))

  if (values.length !== 3) {
    throw new ColorParseError(color)
  }

  const [r, g, b] = values
  // eslint-disable-next-line sort-keys
  const value = { r, g, b }

  if (!isValidColorValue(value)) {
    throw new ColorParseError(color)
  }

  return value
}

export function colorValueFromHex(color: string): Color['value'] {
  const [r, g, b] = (unifyHex(color).substring(1).match(/.{2}/g) ?? []).map(x => parseInt(x, 16))
  // eslint-disable-next-line sort-keys
  const value = { r, g, b }

  if (!isValidColorValue(value)) {
    throw new ColorParseError(color)
  }

  return value
}

export function colorToValue(color: string) {
  if (isHexString(color)) {
    return colorValueFromHex(color)
  }

  if (isRgbString(color)) {
    return colorValueFromRgb(color)
  }

  throw new ColorParseError(color)
}

export function colorValueToHex(value: Color['value']): string {
  return `#${[value.r, value.g, value.b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}

export function colorValueToRgb(value: Color['value']): string {
  return `${value.r} ${value.g} ${value.b}`
}

export function colorValue(color: string): Color {
  const value = colorToValue(color)

  return {
    hex: colorValueToHex(value),
    rgb: colorValueToRgb(value),
    value,
  }
}
