import type { TagTransformerInterface } from '../types'
import { identifier } from './utils'

export const tag: TagTransformerInterface = {
  name: 'section',
  transform: (block, spec) => {
    const { key, name } = identifier(spec)

    block.section = key
    if (!(block.location && block.title)) {
      block.title = name
    }

    return block
  },
}

export default tag
