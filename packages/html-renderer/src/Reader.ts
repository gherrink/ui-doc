import type { PositiveInteger, ReaderInterface } from './types'

export class Reader implements ReaderInterface {
  protected input: string

  protected source: string

  protected currentLine = 1

  protected currentPos = 1

  protected currentContent = ''

  public constructor(input: string, source = 'inline') {
    this.input = input
    this.source = source
  }

  public peak(k: PositiveInteger = 1): string {
    return this.input.slice(0, k)
  }

  public consume(k: PositiveInteger = 1): string {
    const result = this.input.slice(0, k)

    if (result.includes('\n')) {
      const lines = result.split('\n')

      this.currentLine += lines.length - 1
      this.currentContent = lines[lines.length - 1]
      this.currentPos = this.currentContent.length + 1
    } else {
      this.currentPos += k
      this.currentContent += result
    }

    this.input = this.input.slice(k)

    return result
  }

  public isEof(): boolean {
    return this.input.length === 0
  }

  public debug() {
    const lines = this.input.split('\n', 1)

    return {
      source: this.source,
      line: this.currentLine,
      pos: this.currentPos,
      content: this.currentContent + lines[0],
    }
  }
}
