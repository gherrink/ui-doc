import type { RenderValue } from './RenderValue'
import { ColorParseError } from '../../errors/ColorParseError'

interface CSSColorValue {
  r: number
  g: number
  b: number
}

function unifyHex(hex: string): string {
  return hex.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    (_m: string, r: string, g: string, b: string) => `#${r}${r}${g}${g}${b}${b}`,
  )
}

function isValidColorValue(value: unknown): value is CSSColorValue {
  return (
    typeof value === 'object'
    && value.r !== undefined
    && value.g !== undefined
    && value.b !== undefined
    && value.r >= 0
    && value.r <= 255
    && value.g >= 0
    && value.g <= 255
    && value.b >= 0
    && value.b <= 255
  )
}

export function valueToHex(value: CSSColorValue): string {
  return `#${[value.r, value.g, value.b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}

export function valueToRgb(value: CSSColorValue): string {
  return `${value.r} ${value.g} ${value.b}`
}

export class CSSColor implements RenderValue {
  public readonly output: string

  public readonly hex: string

  public readonly rgb: string

  constructor(public readonly value: CSSColorValue) {
    this.hex = valueToHex(value)
    this.rgb = valueToRgb(value)
    this.output = this.toString()
  }

  public static fromString(value: string): CSSColor {
    if (CSSColor.isHexString(value)) {
      return new CSSColor(CSSColor.hexToValue(value))
    }

    if (CSSColor.isRgbString(value)) {
      return new CSSColor(CSSColor.rgbToValue(value))
    }

    throw new ColorParseError(value)
  }

  public static isHexString(color: string): boolean {
    return color.startsWith('#')
  }

  public static isRgbString(color: string): boolean {
    return color.includes(' ')
  }

  public static rgbToValue(color: string): CSSColorValue {
    const values = color.split(' ').map(x => Number.parseInt(x, 10))

    if (values.length !== 3) {
      throw new ColorParseError(color)
    }

    const [r, g, b] = values

    const value = { r, g, b }

    if (!isValidColorValue(value)) {
      throw new ColorParseError(color)
    }

    return value
  }

  public static hexToValue(color: string): CSSColorValue {
    const [r, g, b]
      = (unifyHex(color).substring(1).match(/.{2}/g) ?? [])
        .map(x => Number.parseInt(x, 16))

    const value = { r, g, b }

    if (!isValidColorValue(value)) {
      throw new ColorParseError(color)
    }

    return value
  }

  public toString(): string {
    return `${this.rgb}`
  }
}
