import type { Block } from './Block'
import type { TagTransformerInterface } from './TagTransformerInterface'

export interface BlockParserInterface {
  registerTagTransformer(transformer: TagTransformerInterface): BlockParserInterface
  parse(content: string): Block[]
}
