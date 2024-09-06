import type { TagTransformer } from '../types'
import { CSSValue, CSSVariable } from './nodes'
import { trimDescription } from './utils'

export const tag: TagTransformer = {
  name: 'space',
  transform: (block, spec) => {
    if (!spec.description || !spec.name) {
      return block
    }

    const valueString = spec.type || spec.name
    const isCssVariable = CSSVariable.isVariableString(valueString)

    if (!spec.type && !isCssVariable) {
      return block
    }

    if (!Array.isArray(block.spaces)) {
      block.spaces = []
    }

    block.spaces.push({
      name: spec.name,
      text: trimDescription(spec.description),
      value: isCssVariable ? CSSVariable.fromString(valueString) : CSSValue.fromString(valueString),
    })

    return block
  },
}

export default tag
