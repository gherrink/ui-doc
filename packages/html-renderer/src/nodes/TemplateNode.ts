import type { RenderContext, Renderer } from '../Renderer.types'
import { Node } from './Node'

export class TemplateNode extends Node<'template'> {
  public readonly content: string

  public constructor(content: string) {
    super('template')
    this.content = content
  }

  public render(_context?: RenderContext, _renderer?: Renderer): string {
    return this.content
  }
}
