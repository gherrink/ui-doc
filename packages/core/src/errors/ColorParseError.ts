export class ColorParseError extends Error {
  constructor(color: string) {
    super(`Could not parse color value "${color}".`)
    this.name = 'ColorParseError'
  }
}
