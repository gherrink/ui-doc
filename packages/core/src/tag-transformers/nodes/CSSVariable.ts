import { CSSParseError } from '../../errors/CSSParseError'
import type { RenderValue } from './RenderValue'

export class CSSVariable implements RenderValue {
  public readonly output: string

  constructor(public readonly name: string) {
    this.output = this.toString()
  }

  public static fromString(value: string): CSSVariable {
    if (!CSSVariable.isVariableString(value)) {
      throw new CSSParseError(`Invalid CSS variable: ${value}`)
    }

    return new CSSVariable(value)
  }

  public static isVariableString(value: string): boolean {
    return /^--\w+[\w-]+$/.test(value)
  }

  public toString(): string {
    return `var(${this.name})`
  }
}
