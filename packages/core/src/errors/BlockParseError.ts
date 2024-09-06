export class BlockParseError extends SyntaxError {
  public code: string

  public line: number

  public column: number

  public source: string

  constructor({
    message,
    code,
    line,
    column,
    source,
  }: {
    message: string
    code: string
    line: number
    column: number
    source: string
  }) {
    super(message)
    this.name = 'BlockParseError'
    this.code = code
    this.line = line
    this.column = column
    this.source = source
    this.stack = `BlockParseError: ${message}\n    in ${this.source}:${this.line}\n\n    ${code.replaceAll('\n', '\n    ')}`
  }
}
