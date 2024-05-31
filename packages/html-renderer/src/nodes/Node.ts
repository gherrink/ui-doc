import type {
  HtmlRendererInterface, NodeInterface, NodeType, RenderContext,
} from '../types'

export const nodeOperators = ['==', '!=', '===', '!==', '<', '<=', '>', '>='] as const

export class Node implements NodeInterface {
  public readonly type: NodeType = 'root'

  protected childNodes: Node[] = []

  public constructor(type: NodeType) {
    this.type = type
  }

  public append(node: Node): void {
    this.childNodes.push(node)
  }

  public get children(): Node[] {
    return this.childNodes
  }

  public render(context: RenderContext, renderer: HtmlRendererInterface): string {
    return this.renderChildNodes(context, renderer)
  }

  protected renderChildNodes(context: RenderContext, renderer: HtmlRendererInterface): string {
    return this.childNodes.map(node => node.render(context, renderer)).join('')
  }
}
