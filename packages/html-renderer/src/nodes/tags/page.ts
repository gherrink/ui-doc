import { TagNodeError } from '../../errors'
import type { TagNodeParse } from '../../Parser.types'
import type { RenderContext, Renderer } from '../../Renderer.types'
import type { TokenValue } from '../../Token.types'
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
    this.name = name ?? 'default'
    this.contextKey = contextKey ?? 'this'
  }

  public render(context: RenderContext, renderer: Renderer): string {
    let pageName: string = this.name
    const newContext =
      this.contextKey === 'this' ? context : readNestedValue(this.contextKey, context)

    if (pageName.includes('.')) {
      const foundName = readNestedValue(pageName, context)

      if (typeof foundName === 'string' && foundName) {
        pageName = foundName
      }
    }

    return renderer.page(pageName, newContext)
  }
}

export const parseTagPageNode: TagNodeParse = {
  example: '{{ page[:page-name [contextKey]] }}',
  hasContent: false,
  identifier: 'page',
  parse() {
    const options: Partial<TagPageNodeOptions> = {}
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
        return new TagPageNode(options as TagPageNodeOptions)
      },
    }
  },
}
