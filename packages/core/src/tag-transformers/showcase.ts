import type { TagTransformer } from './tag-transformer.types'
import { createTagTransformerError } from './utils'

export const tag: TagTransformer = {
  name: 'showcase',
  transform: (block, spec) => {
    // spec.name contains the block key to showcase (e.g., "buttons.primary")
    if (!spec.name) {
      throw createTagTransformerError(
        'Missing showcase target. Use "@showcase page.section" to reference another block.',
        spec,
      )
    }

    block.showcase = spec.name.toLowerCase()

    return block
  },
}

export default tag
