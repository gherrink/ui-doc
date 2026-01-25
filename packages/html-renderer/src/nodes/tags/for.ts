import type { TagNodeParse } from '../../Parser.types'
import type { RenderContext, Renderer } from '../../Renderer.types'
import type { TokenValue } from '../../Token.types'
import { TagNodeError } from '../../errors'
import { readNestedValue } from '../../utils'
import { TagNode } from '../TagNode'

export interface TagForNodeOptions {
  contextKey?: 'this' | string
}

export class TagForNode extends TagNode {
  public readonly contextKey: string

  public constructor({ contextKey }: TagForNodeOptions) {
    super('tag-for')
    this.contextKey = contextKey ?? 'this'
  }

  public render(context: RenderContext, renderer: Renderer): string {
    const contextNew
      = this.contextKey === 'this' ? context : readNestedValue(this.contextKey, context)

    if (Array.isArray(contextNew)) {
      return this.renderArray(contextNew, context, renderer)
    }

    if (contextNew !== null && typeof contextNew === 'object') {
      return this.renderObject(contextNew as Record<string, unknown>, context, renderer)
    }

    return ''
  }

  protected renderArray(context: unknown[], parentContext: RenderContext, renderer: Renderer): string {
    return context
      .map((item, index) => {
        return this.renderChildNodes(
          {
            ...(item !== null && typeof item === 'object' ? item : {}),
            _contextKey: this.contextKey,
            _loop: { index, value: item },
            _parent: parentContext,
          },
          renderer,
        )
      })
      .join('')
  }

  protected renderObject(
    context: Record<string, unknown>,
    parentContext: RenderContext,
    renderer: Renderer,
  ): string {
    return Object.keys(context)
      .map((key, index) => {
        const value = context[key]
        return this.renderChildNodes(
          {
            ...(value !== null && typeof value === 'object' ? value : {}),
            _contextKey: this.contextKey,
            _loop: { index, key, value },
            _parent: parentContext,
          },
          renderer,
        )
      })
      .join('')
  }
}

export const parseTagForNode: TagNodeParse = {
  example: '{{ for[:contextKey] }}###{{ /for }}',
  hasContent: true,
  identifier: 'for',
  parse() {
    const options: Partial<TagForNodeOptions> = {}
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

        throw new TagNodeError('Expected tag identifier"')
      },
      create() {
        return new TagForNode(options as TagForNodeOptions)
      },
    }
  },
}
