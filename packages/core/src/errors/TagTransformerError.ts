export class TagTransformerError extends Error {
  public tag: string

  constructor(message: string, tag: string) {
    super(`Problem with '@${tag}': ${message}`)
    this.name = 'TagTransformerError'
    this.tag = tag
  }
}
