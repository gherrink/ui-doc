import { CSSParseError } from '../errors/CSSParseError'
import { CSSValue, CSSVariable } from './nodes'
import type { TagTransformer } from './tag-transformer.types'
import { createTagTransformerError, trimDescription } from './utils'

export const tag: TagTransformer = {
  name: 'icon',
  transform: (block, spec) => {
    if (!spec.description || !spec.name) {
      return block
    }

    const valueString = spec.type || spec.name
    const isCssVariable = CSSVariable.isVariableString(valueString)

    if (!spec.type && !isCssVariable) {
      return block
    }

    if (!Array.isArray(block.icons)) {
      block.icons = []
    }

    try {
      block.icons.push({
        name: spec.name,
        text: trimDescription(spec.description),
        value: isCssVariable
          ? CSSVariable.fromString(valueString)
          : CSSValue.fromString(`&#x${valueString}`),
      })
    } catch (error) {
      if (error instanceof CSSParseError) {
        throw createTagTransformerError(error.message, spec)
      } else {
        throw error
      }
    }

    return block
  },
}

export default tag
