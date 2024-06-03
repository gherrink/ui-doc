import type { Block } from './Block'
import type { TagTransformerInterface } from './TagTransformerInterface'

export type BlockParserContextIdentifier = string

export interface BlockParserContext {
  content: string
  identifier: BlockParserContextIdentifier
}

export interface BlockParserInterface {
  registerTagTransformer(transformer: TagTransformerInterface): BlockParserInterface
  parse(context: BlockParserContext): Block[]
}

export interface BlockParserEvent {}

export interface BlockParsedEvent extends BlockParserEvent {
  block: Block
}
export interface BlockParserEventMap {
  'block-parsed': BlockParsedEvent
}
