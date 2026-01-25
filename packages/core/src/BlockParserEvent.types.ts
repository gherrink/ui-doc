import type { Block } from './Block.types'

export interface BlockParserEventMap {
  [key: string]: unknown[]
  parsed: [Block]
}
