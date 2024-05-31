import { TagNodeSyntaxError } from '../../errors/TagNodeSyntaxError'
import type {
  HtmlRendererInterface,
  RenderContext,
  TagNodeParse,
  TokenValue,
} from '../../types'
import { readNestedValue } from '../../utils'
import { TagNode } from '../TagNode'

export interface TagForNodeOptions {
  contextKey?: 'this' | string
}

export class TagForNode extends TagNode {
  public readonly contextKey: string

  public constructor({ contextKey }: TagForNodeOptions) {
    super('tag-for')
    this.contextKey = contextKey || 'this'
  }

  public render(context: RenderContext, renderer: HtmlRendererInterface): string {
    const contextNew = this.contextKey === 'this' ? context : readNestedValue(this.contextKey, context)

    if (Array.isArray(contextNew)) {
      return this.renderArray(contextNew, context, renderer)
    }

    if (typeof contextNew === 'object') {
      return this.renderObject(contextNew, context, renderer)
    }

    return ''
  }

  protected renderArray(context: any[], parentContext: RenderContext, renderer: HtmlRendererInterface): string {
    return context
      .map((item, index) => {
        return this.renderChildNodes({
          ...(typeof item === 'object' ? item : {}),
          _parent: parentContext,
          _contextKey: this.contextKey,
          _loop: { index, value: item },
        }, renderer)
      })
      .join('')
  }

  protected renderObject(context: Record<string, any>, parentContext: RenderContext, renderer: HtmlRendererInterface): string {
    return Object.keys(context)
      .map((key, index) => {
        return this.renderChildNodes({
          ...(typeof context[key] === 'object') ? context[key] : {},
          _parent: parentContext,
          _contextKey: this.contextKey,
          _loop: { key, index, value: context[key] },
        }, renderer)
      })
      .join('')
  }
}

export const parseTagForNode: TagNodeParse = {
  identifier: 'for',
  example: '{{ for[:contextKey] }}###{{ /for }}',
  hasContent: true,
  parse() {
    const options: Partial<TagForNodeOptions> = {}
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

        throw new TagNodeSyntaxError('Expected tag identifier"')
      },
      create() {
        return new TagForNode(options as TagForNodeOptions)
      },
    }
  },
}
