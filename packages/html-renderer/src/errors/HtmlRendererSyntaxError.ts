export class HTMLRendererSyntaxError extends SyntaxError {
  public reason: string

  public code: string

  public line: number

  public column: number

  public source: string

  constructor({
    reason,
    code,
    column,
    line,
    source,
  }: {
    reason: string
    code: string
    column: number
    line: number
    source: string
  }) {
    super(reason)
    this.name = 'HTMLRendererSyntaxError'
    this.reason = reason
    this.code = code
    this.line = line
    this.column = column
    this.source = source
    this.stack = `${this.source}:${this.line}:${this.column}\n\n${code}`
  }
}
