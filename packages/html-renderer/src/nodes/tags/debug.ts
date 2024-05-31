import { TagNodeSyntaxError } from '../../errors/TagNodeSyntaxError'
import type { RenderContext, TagNodeParse, TokenValue } from '../../types'
import { readNestedValue } from '../../utils'
import { TagNode } from '../TagNode'

export interface TagDebugNodeOptions {
  contextKey?: 'this' | string
}

export class TagDebugNode extends TagNode {
  public readonly contextKey: string

  public constructor({ contextKey }: TagDebugNodeOptions) {
    super('tag-debug')
    this.contextKey = contextKey || 'this'
  }

  public render(context: RenderContext): string {
    const debugContext = this.contextKey !== 'this'
      ? readNestedValue(this.contextKey, context)
      : context
    const debugContent = debugContext
      ? JSON.stringify(debugContext, null, 2)
      : `Current context for "${this.contextKey}" is empty`

    return `<pre>${debugContent}</pre>`
  }
}

export const parseTagDebugNode: TagNodeParse = {
  identifier: 'debug',
  example: '{{ debug[:contextKey] }}',
  hasContent: false,
  parse() {
    const options: Partial<TagDebugNodeOptions> = {}
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

        if (token.type === 'identifier') {
          options.contextKey = token.name
          return
        }

        throw new TagNodeSyntaxError('Expected tag identifier')
      },
      create() {
        return new TagDebugNode(options as TagDebugNodeOptions)
      },
    }
  },
}
