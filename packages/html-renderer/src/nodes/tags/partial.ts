import { TagNodeError } from '../../errors'
import type { TagNodeParse } from '../../Parser.types'
import type { RenderContext, Renderer } from '../../Renderer.types'
import type { TokenValue } from '../../Token.types'
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

  public render(context: RenderContext, renderer: Renderer): string {
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
            throw new TagNodeError('Expected separator')
          }

          gotSeparator = true
          return
        }
        if (token.type !== 'identifier') {
          throw new TagNodeError('Expected tag identifier')
        }

        if (options.name && options.contextKey) {
          throw new TagNodeError('Expected only one name and context key')
        }

        if (options.name) {
          options.contextKey = token.name
        } else {
          options.name = token.name
        }
      },
      create() {
        if (!options.name) {
          throw new TagNodeError('Expected partial name')
        }

        return new TagPartialNode(options as TagPartialNodeOptions)
      },
    }
  },
}
