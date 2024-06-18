export class BlockParseError extends SyntaxError {
  public code: string

  public line: number

  public source: string

  constructor({
    message,
    code,
    line,
    source,
  }: {
    message: string
    code: string
    line: number
    source: string
  }) {
    super(message)
    this.name = 'BlockParseError'
    this.code = code
    this.line = line
    this.source = source
    this.stack = `BlockParseError: ${message}\n    in ${this.source}:${this.line}\n\n    ${code.replaceAll('\n', '\n    ')}`
  }
}
