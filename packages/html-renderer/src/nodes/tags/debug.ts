import { TagNodeError } from '../../errors'
import type { TagNodeParse } from '../../Parser.types'
import type { RenderContext } from '../../Renderer.types'
import type { TokenValue } from '../../Token.types'
import { readNestedValue } from '../../utils'
import { TagNode } from '../TagNode'

export interface TagDebugNodeOptions {
  contextKey?: 'this' | string
}

export class TagDebugNode extends TagNode {
  public readonly contextKey: string

  public constructor({ contextKey }: TagDebugNodeOptions) {
    super('tag-debug')
    this.contextKey = contextKey ?? 'this'
  }

  public render(context: RenderContext): string {
    const debugContext =
      this.contextKey !== 'this' ? readNestedValue(this.contextKey, context) : context
    const debugContent = debugContext
      ? JSON.stringify(debugContext, null, 2)
      : `Current context for "${this.contextKey}" is empty`

    return `<pre>${debugContent}</pre>`
  }
}

export const parseTagDebugNode: TagNodeParse = {
  example: '{{ debug[:contextKey] }}',
  hasContent: false,
  identifier: 'debug',
  parse() {
    const options: Partial<TagDebugNodeOptions> = {}
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

        if (token.type === 'identifier') {
          options.contextKey = token.name
          return
        }

        throw new TagNodeError('Expected tag identifier')
      },
      create() {
        return new TagDebugNode(options as TagDebugNodeOptions)
      },
    }
  },
}
