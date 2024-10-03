import { TagNodeError } from '../../errors'
import type { TagNodeParse } from '../../Parser.types'
import type { RenderContext, Renderer } from '../../Renderer.types'
import type { TokenValue } from '../../Token.types'
import { readNestedValue } from '../../utils'
import { type NodeOperator, nodeOperators } from '../Node'
import { TagNode } from '../TagNode'

export interface TagIfNodeOptions {
  operator?: NodeOperator
  firstValue?: string | number | boolean
  firstContextKey?: string
  secondValue?: string | number | boolean
  secondContextKey?: string
}

export class TagIfNode extends TagNode {
  public readonly options: TagIfNodeOptions

  public constructor(options: TagIfNodeOptions) {
    super('tag-if')
    this.options = options
  }

  public render(context: RenderContext, renderer: Renderer): string {
    let value = this.getValue(context, 'firstValue', 'firstContextKey')

    if (this.options.operator) {
      value = this.compare(
        value,
        this.getValue(context, 'secondValue', 'secondContextKey'),
        this.options.operator,
      )
    }

    return value ? this.renderChildNodes(context, renderer) : ''
  }

  protected getValue(
    context: RenderContext,
    valueKey: 'firstValue' | 'secondValue',
    contextKey: 'firstContextKey' | 'secondContextKey',
  ): any {
    return this.options[contextKey] !== undefined
      ? readNestedValue(this.options[contextKey]!, context)
      : this.options[valueKey]
  }

  protected compare(value: any, compareValue: any, operator: NodeOperator): boolean {
    switch (operator) {
      case '==':
        // eslint-disable-next-line eqeqeq
        return value == compareValue
      case '!=':
        // eslint-disable-next-line eqeqeq
        return value != compareValue
      case '===':
        return value === compareValue
      case '!==':
        return value !== compareValue
      case '<':
        return value < compareValue
      case '<=':
        return value <= compareValue
      case '>':
        return value > compareValue
      case '>=':
        return value >= compareValue
      default:
        return false
    }
  }
}

export const parseTagIfNode: TagNodeParse = {
  example:
    '{{ if:(contextKey|contextKey === (true|"a string"|12.34)|contextKey === otherContextKey) }}###{{ /if }}',
  hasContent: true,
  identifier: 'if',
  parse() {
    const options: Partial<TagIfNodeOptions> = {}
    const addOptionKeyOrValue = (
      token: TokenValue,
      keyName: 'firstContextKey' | 'secondContextKey',
      valueName: 'firstValue' | 'secondValue',
    ) => {
      if (token.type === 'identifier') {
        options[keyName] = token.name
        return
      }

      if (token.type === 'string' || token.type === 'number' || token.type === 'boolean') {
        options[valueName] = token.value
        return
      }

      throw new TagNodeError('Expected identifier or value')
    }
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

        if (options.firstContextKey === undefined && options.firstValue === undefined) {
          addOptionKeyOrValue(token, 'firstContextKey', 'firstValue')
          return
        }

        if (options.operator === undefined) {
          if (token.type !== 'operator') {
            throw new TagNodeError('Expected operator')
          }

          if (!nodeOperators.includes(token.operator as NodeOperator)) {
            throw new TagNodeError(`Invalid operator ${token.operator}`)
          }

          options.operator = token.operator as NodeOperator
          return
        }

        if (options.secondContextKey === undefined && options.secondValue === undefined) {
          addOptionKeyOrValue(token, 'secondContextKey', 'secondValue')
          return
        }

        throw new TagNodeError('Unexpected token')
      },
      create() {
        if (options.firstContextKey === undefined && options.firstValue === undefined) {
          throw new TagNodeError('Expected first context key or value')
        }

        if (options.operator === undefined && options.firstContextKey === undefined) {
          throw new TagNodeError('Expected context key when no operator is given')
        }

        if (
          options.operator !== undefined &&
          options.secondContextKey === undefined &&
          options.secondValue === undefined
        ) {
          throw new TagNodeError('Expected second context key or value when operator is given')
        }

        return new TagIfNode(options as TagIfNodeOptions)
      },
    }
  },
}
