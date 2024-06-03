import { Spec } from 'comment-parser'

import { TagTransformerError } from '../../errors'
import type { BlockCode } from '../../types'

export function identifier(data: Spec): { key: string; name: string } {
  if (!data.name) {
    throw new TagTransformerError(
      `Missing key. You should use "@${data.tag} your-${data.tag}-key"`,
      data.tag,
    )
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
    type: typeof data.type === 'string' && data.type ? data.type : 'html',
  }
}
