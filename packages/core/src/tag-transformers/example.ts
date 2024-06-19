import { TagTransformerError } from '../errors'
import type { BlockExample, TagTransformerInterface } from '../types'
import { code, isValidHTML } from './utils'

export const tag: TagTransformerInterface = {
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
      throw new TagTransformerError('Invalid HTML content.', spec.tag)
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
