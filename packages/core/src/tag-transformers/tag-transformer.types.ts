import type { Spec as CommentSpec } from 'comment-parser'

import type { Block } from '../Block.types'

export type TagTransformFunction = (block: Partial<Block>, spec: CommentSpec) => Partial<Block>

export interface TagTransformer {
  name: string
  transform: TagTransformFunction
}
