import type { Block } from './Block.types'
import type { TagTransformer } from './tag-transformers/tag-transformer.types'

export type BlockParserContextIdentifier = string

export interface BlockParserContext {
  content: string
  identifier: BlockParserContextIdentifier
}

export interface BlockParser {
  registerTagTransformer(transformer: TagTransformer): BlockParser
  parse(context: BlockParserContext): Block[]
}
