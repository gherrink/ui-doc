import type { Block } from './Block'
import type { BlockParserInterface } from './BlockParser'
import type { ContextEntry } from './Context'
import type { RendererInterface } from './RendererInterface'

export interface StyleguideOptions {
  blockParser?: BlockParserInterface
  generate?: Partial<StyleguideGenerateMap>
  renderer: RendererInterface
  texts?: Partial<StyleguideTexts>
}

export interface StyleguideEvent {}
export interface ContextEntryEvent extends StyleguideEvent {
  entry: ContextEntry
  key: string
}

export interface StyleguideEventMap {
  'context-entry': ContextEntryEvent
}

export interface StyleguideGenerateMap {
  exampleTitle: (example: ContextEntry) => string
  footerText: () => string
  homeLink: () => string
  logo: () => string
  name: () => string
  pageLink: (page: ContextEntry) => string
  pageTitle: (page: ContextEntry) => string
}

export interface StyleguideTexts {
  copyright: 'Styleguide'
  title: string
}

export interface StyleguideSource {
  blocks: Block[]
}

export type StyleguideOutputCallback = (file: string, content: string) => Promise<void> | void
