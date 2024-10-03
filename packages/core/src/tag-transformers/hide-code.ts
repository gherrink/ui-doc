import type { TagTransformer } from './tag-transformer.types'

export const tag: TagTransformer = {
  name: 'hideCode',
  transform: block => {
    block.hideCode = true

    if (block.code) {
      delete block.code
    }

    return block
  },
}

export default tag
