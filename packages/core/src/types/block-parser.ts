import type { Block } from './blocks'
import type { TagTransformer } from './tag'

export type BlockParserContextIdentifier = string

export interface BlockParserContext {
  content: string
  identifier: BlockParserContextIdentifier
}

export interface BlockParser {
  registerTagTransformer(transformer: TagTransformer): BlockParser
  parse(context: BlockParserContext): Block[]
}
