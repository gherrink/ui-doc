export class BlockParseError extends Error {
  public reason: string

  public code: string

  public line: number

  constructor(reason: string, code: string, line: number) {
    super(`Block parse error (near line ${line}): ${reason}\n\n${code}`)
    this.reason = reason
    this.code = code
    this.line = line
  }
}
