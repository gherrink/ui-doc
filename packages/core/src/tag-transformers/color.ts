import { TagTransformerError } from '../errors'
import { ColorParseError } from '../errors/ColorParseError'
import type { TagTransformer } from '../types'
import { trimDescription } from './utils'
import { colorValue } from './utils/color'

export const tag: TagTransformer = {
  name: 'color',
  transform: (block, spec) => {
    const [value, colorFont] = spec.type.split('|')

    if (!spec.description || !spec.name || !value) {
      return block
    }

    if (!Array.isArray(block.colors)) {
      block.colors = []
    }

    try {
      block.colors.push({
        font: colorFont ? colorValue(colorFont) : undefined,
        name: spec.name,
        text: trimDescription(spec.description),
        value: colorValue(value),
      })
    } catch (error) {
      if (error instanceof ColorParseError) {
        throw new TagTransformerError(error.message, spec.tag)
      } else {
        throw error
      }
    }

    return block
  },
}

export default tag
