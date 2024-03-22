import { TagTransformer } from '../types'
import { identifier } from './utils'

export const tag: TagTransformer = {
  name: 'section',
  transform: (block, spec) => {
    block.section = identifier(spec)

    return block
  },
}

export default tag
