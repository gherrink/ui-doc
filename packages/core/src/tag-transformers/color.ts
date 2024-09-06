import { CSSParseError } from '../errors/CSSParseError'
import type { TagTransformer } from '../types'
import { CSSVariable } from './nodes'
import { createTagTransformerError, cssColorValue, trimDescription } from './utils'

export const tag: TagTransformer = {
  name: 'color',
  transform: (block, spec) => {
    const [value, colorFont] = spec.type.split('|')

    if (!spec.description || !spec.name || (!value && !CSSVariable.isVariableString(spec.name))) {
      return block
    }

    if (!Array.isArray(block.colors)) {
      block.colors = []
    }

    try {
      block.colors.push({
        font: colorFont ? cssColorValue(colorFont) : undefined,
        name: spec.name,
        text: trimDescription(spec.description),
        value: cssColorValue(value || spec.name),
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
