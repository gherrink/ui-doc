import type { TagTransformer } from '../types'
import { trimDescription } from './utils'

export const tag: TagTransformer = {
  name: 'space',
  transform: (block, spec) => {
    if (!spec.description || !spec.name || !spec.type) {
      return block
    }

    if (!Array.isArray(block.spaces)) {
      block.spaces = []
    }

    block.spaces.push({
      name: spec.name,
      text: trimDescription(spec.description),
      value: spec.type,
    })

    return block
  },
}

export default tag
