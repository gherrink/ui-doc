import { Spec as CommentSpec } from 'comment-parser'

export type Options = {

}

export type BlockIdentifier = {
  key: string,
  name?: string,
}

export type BlockCode = {
  content: string,
  title: string,
  type: string,
}

export type BlockExample = BlockCode & {
  modifier?: string,
  code?: string,
}

export type Block = {
  [key: string]: any,
  key: string,
  order: number,
  location?: string,
  page?: BlockIdentifier,
  section?: BlockIdentifier,
  description?: string,
  code?: BlockCode,
  example?: BlockExample,
}

export type TagTransformFunction = (block: Partial<Block>, spec: CommentSpec) => Partial<Block>

export type TagTransformer = {
  name: string,
  transform: TagTransformFunction
}
