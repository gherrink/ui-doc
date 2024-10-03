import type { TagTransformer } from './tag-transformer.types'
import { identifier } from './utils'

export const tag: TagTransformer = {
  name: 'location',
  transform: (block, spec) => {
    const { key, name } = identifier(spec)

    block.title = name
    block.location = key

    return block
  },
}

export default tag
