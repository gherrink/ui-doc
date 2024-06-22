import type { Block } from './Block'
import type { BlockParserInterface } from './BlockParser'
import type { Context, ContextEntry } from './context'
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

export interface SourceEditEvent extends StyleguideEvent {
  file: string
  source: StyleguideSource
  type: 'create' | 'update' | 'delete'
}

export interface PageEvent extends StyleguideEvent {
  layout?: string
  page: ContextEntry
}

export interface ExampleEvent extends StyleguideEvent {
  example: ContextEntry
  layout: string
}

export interface StyleguideEventMap {
  'context-entry': ContextEntryEvent
  'source-edit': SourceEditEvent
  page: PageEvent
  example: ExampleEvent
}

export type StyleguideListeners<T extends keyof StyleguideEventMap> = {
  [K in T]: ((event: StyleguideEventMap[K]) => void)[]
}

export interface StyleguideGenerateMap {
  exampleTitle: (example: ContextEntry) => string
  footerText: () => string
  homeLink: () => string
  logo: () => string
  menu: (menu: Context['menu'], pages: Context['pages']) => Context['menu']
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
