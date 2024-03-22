import { TagTransformerError } from '../errors'
import { TagTransformer } from '../types'

export const tag: TagTransformer = {
  name: 'location',
  transform: (block, data) => {
    if (!data.name) {
      throw new TagTransformerError('No key is given')
    }

    block.location = data.name.toLowerCase()

    return block
  },
}

export default tag
