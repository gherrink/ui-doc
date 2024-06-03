
import type { TagTransformerInterface } from '../types'
import { code } from './utils'

export const tag: TagTransformerInterface = {
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
