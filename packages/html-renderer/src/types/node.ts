import type { nodeOperators } from '../nodes'
import type { HtmlRendererInterface, RenderContext } from './renderer'

export type TagNodeType = 'tag' | 'tag-debug' | 'tag-var' | 'tag-for' | 'tag-if' | 'tag-page' | 'tag-partial'

export type NodeType = 'root' | 'template' | 'comment' | TagNodeType

export interface NodeInterface {
  readonly type: NodeType

  get children(): NodeInterface[]

  append(node: NodeInterface): void
  render(context: RenderContext, renderer: HtmlRendererInterface): string
}

export interface TagNodeInterface extends NodeInterface {
  readonly type: TagNodeType
}

export type NodeOperator = typeof nodeOperators[number]
