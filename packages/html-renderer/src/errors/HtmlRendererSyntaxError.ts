export class HTMLRendererSyntaxError extends SyntaxError {
  public code: string

  public line: number

  public column: number

  public source: string

  constructor({
    message,
    code,
    column,
    line,
    source,
  }: {
    message: string
    code: string
    column: number
    line: number
    source: string
  }) {
    super(message)
    this.name = 'HTMLRendererSyntaxError'
    this.code = code
    this.line = line
    this.column = column
    this.source = source
    this.stack = `HTMLRendererSyntaxError: ${message}\n    in ${this.source}:${this.line}:${this.column}\n\n    ${code.replaceAll('\n', '\n    ')}`
  }
}
