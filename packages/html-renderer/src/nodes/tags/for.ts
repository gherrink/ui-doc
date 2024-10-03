import { TagNodeError } from '../../errors'
import type { TagNodeParse } from '../../Parser.types'
import type { RenderContext, Renderer } from '../../Renderer.types'
import type { TokenValue } from '../../Token.types'
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
    const contextNew =
      this.contextKey === 'this' ? context : readNestedValue(this.contextKey, context)

    if (Array.isArray(contextNew)) {
      return this.renderArray(contextNew, context, renderer)
    }

    if (typeof contextNew === 'object') {
      return this.renderObject(contextNew, context, renderer)
    }

    return ''
  }

  protected renderArray(context: any[], parentContext: RenderContext, renderer: Renderer): string {
    return context
      .map((item, index) => {
        return this.renderChildNodes(
          {
            ...(typeof item === 'object' ? item : {}),
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
    context: Record<string, any>,
    parentContext: RenderContext,
    renderer: Renderer,
  ): string {
    return Object.keys(context)
      .map((key, index) => {
        return this.renderChildNodes(
          {
            ...(typeof context[key] === 'object' ? context[key] : {}),
            _contextKey: this.contextKey,
            _loop: { index, key, value: context[key] },
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
