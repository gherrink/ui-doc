import type { TagTransformer } from './tag-transformer.types'
import { code } from './utils'

export const tag: TagTransformer = {
  name: 'code',
  transform: (block, spec) => {
    if (block.hideCode) {
      return block
    }

    block.code = code(spec)

    return block
  },
}

export default tag
