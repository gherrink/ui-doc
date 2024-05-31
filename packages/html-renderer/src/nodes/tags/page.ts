import { TagNodeSyntaxError } from '../../errors/TagNodeSyntaxError'
import type {
  HtmlRendererInterface,
  RenderContext,
  TagNodeParse,
  TokenValue,
} from '../../types'
import { readNestedValue } from '../../utils'
import { TagNode } from '../TagNode'

export interface TagPageNodeOptions {
  name?: 'default' | string
  contextKey?: 'this' | string
}

export class TagPageNode extends TagNode {
  public readonly name: string

  public readonly contextKey: string

  public constructor({ name, contextKey }: TagPageNodeOptions) {
    super('tag-page')
    this.name = name || 'default'
    this.contextKey = contextKey || 'this'
  }

  public render(context: RenderContext, renderer: HtmlRendererInterface): string {
    const newContext = this.contextKey === 'this'
      ? context
      : readNestedValue(this.contextKey, context)

    return renderer.page(this.name, newContext)
  }
}

export const parseTagPageNode: TagNodeParse = {
  identifier: 'page',
  example: '{{ page[:page-name [contextKey]] }}',
  hasContent: false,
  parse() {
    const options: Partial<TagPageNodeOptions> = {}
    let gotSeparator = false

    return {
      addToken(token: TokenValue) {
        if (!gotSeparator) {
          if (token.type !== 'tag-separator') {
            throw new TagNodeSyntaxError('Expected separator')
          }

          gotSeparator = true
          return
        }

        if (token.type !== 'identifier') {
          throw new TagNodeSyntaxError('Expected tag identifier')
        }

        if (options.name && options.contextKey) {
          throw new TagNodeSyntaxError('Expected only one name and context key')
        }

        if (options.name) {
          options.contextKey = token.name
        } else {
          options.name = token.name
        }
      },
      create() {
        return new TagPageNode(options as TagPageNodeOptions)
      },
    }
  },
}
