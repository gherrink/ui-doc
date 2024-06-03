import type { TagTransformerInterface } from '../types'
import { identifier } from './utils'

export const tag: TagTransformerInterface = {
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
