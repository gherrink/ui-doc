import { BlockExample, TagTransformer } from '../types'
import { code } from './utils'

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
