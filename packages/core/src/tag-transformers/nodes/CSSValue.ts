import type { RenderValue } from './RenderValue'

export class CSSValue implements RenderValue {
  public readonly output: string

  constructor(public readonly value: string) {
    this.output = this.toString()
  }

  public static fromString(value: string): CSSValue {
    return new CSSValue(value)
  }

  public toString(): string {
    return this.value
  }
}
