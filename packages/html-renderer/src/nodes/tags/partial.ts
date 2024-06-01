import { TagNodeSyntaxError } from '../../errors/TagNodeSyntaxError'
import type { HtmlRendererInterface, RenderContext, TagNodeParse, TokenValue } from '../../types'
import { readNestedValue } from '../../utils'
import { TagNode } from '../TagNode'

export interface TagPartialNodeOptions {
  name: string
  contextKey?: 'this' | string
}

export class TagPartialNode extends TagNode {
  public readonly name: string

  public readonly contextKey: string

  public constructor({ name, contextKey }: TagPartialNodeOptions) {
    super('tag-partial')
    this.name = name
    this.contextKey = contextKey ?? 'this'
  }

  public render(context: RenderContext, renderer: HtmlRendererInterface): string {
    const newContext =
      this.contextKey === 'this' ? context : readNestedValue(this.contextKey, context)

    return renderer.partial(this.name, newContext)
  }
}

export const parseTagPartialNode: TagNodeParse = {
  example: '{{ partial:partial-name [contextKey] }}',
  hasContent: false,
  identifier: 'partial',
  parse() {
    const options: Partial<TagPartialNodeOptions> = {}
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
        if (!options.name) {
          throw new TagNodeSyntaxError('Expected partial name')
        }

        return new TagPartialNode(options as TagPartialNodeOptions)
      },
    }
  },
}
