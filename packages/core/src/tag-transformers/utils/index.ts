import { Spec } from 'comment-parser'

import { TagTransformerError } from '../../errors'
import { BlockCode, BlockIdentifier } from '../../types'

export function identifier(data: Spec): BlockIdentifier {
  if (!data.name) {
    throw new TagTransformerError('No key is given')
  }

  const name = data.description || data.name
  const key = data.name.toLowerCase()

  return {
    key,
    name,
  }
}

export function code(data: Spec): BlockCode | undefined {
  if (!data.description) {
    return undefined
  }

  return {
    content: data.description,
    title: data.name,
    type: (typeof data.type === 'string' && data.type) ? data.type : 'html',
  }
}
