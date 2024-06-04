import type { Block } from './Block'
import type { BlockParserInterface } from './BlockParser'
import type { ContextEntry } from './Context'
import type { RendererInterface } from './RendererInterface'

export interface StyleguideOptions {
  renderer: RendererInterface
  blockParser?: BlockParserInterface
}

export interface StyleguideEvent {}
export interface ContextEntryEvent extends StyleguideEvent {
  entry: ContextEntry
  key: string
}
export interface StyleguideEventMap {
  'context-entry': ContextEntryEvent
}

export interface StyleguideSource {
  blocks: Block[]
}
