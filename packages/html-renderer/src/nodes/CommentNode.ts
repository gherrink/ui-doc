import { Node } from './Node'

export class CommentNode extends Node {
  public readonly content: string

  public constructor(content: string) {
    super('comment')
    this.content = content
  }

  public render(): string {
    return `<!-- ${this.content} -->`
  }
}
