import type { TagTransformerInterface } from '../types'

export const tag: TagTransformerInterface = {
  name: 'order',
  transform: (block, spec) => {
    block.order = parseInt(spec.name, 10)
    if (Number.isNaN(block.order)) {
      block.order = 0
    }

    return block
  },
}

export default tag
