import { CSSParseError } from './CSSParseError'

export class ColorParseError extends CSSParseError {
  constructor(color: string) {
    super(`Could not parse color value "${color}".`)
    this.name = 'ColorParseError'
  }
}
