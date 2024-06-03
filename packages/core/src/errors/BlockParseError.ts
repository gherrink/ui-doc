export class BlockParseError extends SyntaxError {
  public reason: string

  public code: string

  public line: number

  public source: string

  constructor({
    reason,
    code,
    line,
    source,
  }: {
    reason: string
    code: string
    line: number
    source: string
  }) {
    super(reason)
    this.name = 'BlockParseError'
    this.reason = reason
    this.code = code
    this.line = line
    this.source = source
    this.stack = `${this.source}:${this.line}\n\n${code}`
  }
}
