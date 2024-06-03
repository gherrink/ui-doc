import { Spec as CommentSpec } from 'comment-parser'

import type { Block } from './Block'

export type TagTransformFunction = (block: Partial<Block>, spec: CommentSpec) => Partial<Block>

export interface TagTransformerInterface {
  name: string
  transform: TagTransformFunction
}
