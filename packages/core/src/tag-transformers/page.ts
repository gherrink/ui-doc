import type { TagTransformer } from './tag-transformer.types'
import { identifier } from './utils'

export const tag: TagTransformer = {
  name: 'page',
  transform: (block, spec) => {
    const { key, name } = identifier(spec)

    block.page = key
    if (!block.title) {
      block.title = name
    }

    return block
  },
}

export default tag
