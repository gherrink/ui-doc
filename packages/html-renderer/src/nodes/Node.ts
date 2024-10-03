import type { RenderContext, Renderer } from '../Renderer.types'
import type { TagNodeType } from './TagNode'

export const nodeOperators = ['==', '!=', '===', '!==', '<', '<=', '>', '>='] as const
export type NodeOperator = (typeof nodeOperators)[number]

export type NodeType = 'root' | 'template' | 'comment' | TagNodeType

export class Node<T extends NodeType = NodeType> {
  public readonly type: T

  protected childNodes: Node[] = []

  public constructor(type: T) {
    this.type = type
  }

  public append(node: Node): void {
    this.childNodes.push(node)
  }

  public get children(): Node[] {
    return this.childNodes
  }

  public render(context: RenderContext, renderer: Renderer): string {
    return this.renderChildNodes(context, renderer)
  }

  protected renderChildNodes(context: RenderContext, renderer: Renderer): string {
    return this.childNodes.map(node => node.render(context, renderer)).join('')
  }
}
