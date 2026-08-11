export class TagTransformerError extends Error {
  public tag: string

  public column?: number

  public line?: number

  constructor(
    message: string,
    tag: string,
    { column, line }: { column?: number; line?: number } = {},
  ) {
    super(`Problem with '@${tag}' - ${message}`)
    this.name = 'TagTransformerError'
    this.tag = tag
    this.column = column
    this.line = line
  }
}
