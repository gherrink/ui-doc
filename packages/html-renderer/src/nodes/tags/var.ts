import { TagNodeSyntaxError } from '../../errors/TagNodeSyntaxError'
import type { RenderContext, TagNodeParse, TokenValue } from '../../types'
import { escapeHtml, readNestedValue } from '../../utils'
import { TagNode } from '../TagNode'

export interface TagVarNodeOptions {
  contextKey: 'this' | string
  escape?: boolean
}

export class TagVarNode extends TagNode {
  public readonly contextKey: string

  public readonly escape: boolean

  public constructor({ contextKey, escape }: TagVarNodeOptions) {
    super('tag-var')
    this.contextKey = contextKey
    this.escape = !!escape
  }

  public render(context: RenderContext): string {
    let value = readNestedValue(this.contextKey, context) || ''

    if (typeof value !== 'string') {
      value = String(value)
    }

    return this.escape ? escapeHtml(value) : value
  }
}

export const parseTagVarNode: TagNodeParse = {
  example: '{{ var:contextKey [escape] }}',
  hasContent: false,
  identifier: 'var',
  parse() {
    const options: Partial<TagVarNodeOptions> = {}
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

        if (options.contextKey !== undefined && options.escape !== undefined) {
          throw new TagNodeSyntaxError('Expected only context key followed by optional escape')
        }

        if (options.contextKey === undefined) {
          options.contextKey = token.name
          return
        }

        if (token.name !== 'escape') {
          throw new TagNodeSyntaxError('Expected escape')
        }

        options.escape = true
      },
      create() {
        if (!options.contextKey) {
          throw new TagNodeSyntaxError('Expected context key')
        }

        return new TagVarNode(options as TagVarNodeOptions)
      },
    }
  },
}
