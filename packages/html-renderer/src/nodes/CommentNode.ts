import type { RenderContext, Renderer } from '../Renderer.types'
import { Node } from './Node'

export class CommentNode extends Node {
  public readonly content: string

  public constructor(content: string) {
    super('comment')
    this.content = content
  }

  public render(_context?: RenderContext, _renderer?: Renderer): string {
    return `<!-- ${this.content} -->`
  }
}
