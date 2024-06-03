import type { TagTransformerInterface } from '../types'

export const tag: TagTransformerInterface = {
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
