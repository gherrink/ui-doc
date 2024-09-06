export class CSSParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CSSParseError'
  }
}
