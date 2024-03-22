import { TagTransformer } from '../types'
import { identifier } from './utils'

export const tag: TagTransformer = {
  name: 'page',
  transform: (block, spec) => {
    block.page = identifier(spec)

    return block
  },
}

export default tag
