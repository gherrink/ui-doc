import type { BlockExample } from '../Block.types'
import type { TagTransformer } from './tag-transformer.types'
import { code, createTagTransformerError, isValidHTML } from './utils'

export const tag: TagTransformer = {
  name: 'example',
  transform: (block, spec) => {
    const data: BlockExample | undefined = code(spec)

    if (!data) {
      return block
    }

    if (data.type.includes('|')) {
      const params = data.type.split('|')

      data.type = params[1].trim()
      data.modifier = `${params[0].trim()}`
    } else {
      data.modifier = data.type !== 'html' ? data.type : undefined
      data.type = 'html'
    }

    if (!data.title && block.title) {
      data.title = block.title
    }

    if (data.type === 'html' && !isValidHTML(data.content)) {
      throw createTagTransformerError('Invalid HTML content.', spec)
    }

    if (!Object.hasOwnProperty.call(block, 'code') && block.hideCode !== true) {
      block.code = {
        content: data.content,
        title: data.title,
        type: data.type,
      }
    }

    block.example = data

    return block
  },
}

export default tag
