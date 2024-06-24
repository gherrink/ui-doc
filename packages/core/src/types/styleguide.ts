import type { Block } from './Block'
import type { BlockParserInterface } from './BlockParser'
import type { Context, ContextEntry, ContextExample } from './context'
import type { RendererInterface } from './RendererInterface'

export interface StyleguideOptions {
  blockParser?: BlockParserInterface
  generate?: Partial<StyleguideGenerateMap>
  renderer: RendererInterface
  texts?: Partial<StyleguideTexts>
}

export interface StyleguideEvent {}

export type ContextEntryEvent = { entry: ContextEntry; key: string } & (
  | {
      type: 'create' | 'update'
      changes: {
        deleted: string[]
        updated: Record<string, { from: any; to: any }>
      }
    }
  | {
      type: 'delete'
    }
)

export interface SourceEvent extends StyleguideEvent {
  file: string
  source: StyleguideSource
  type: 'create' | 'update' | 'delete'
}

export interface OutputEvent extends StyleguideEvent {
  promises: Promise<void>[]
  write: (file: string, content: string) => Promise<void>
}

export interface PageEvent extends StyleguideEvent {
  layout?: string
  page: ContextEntry
}

export interface ExampleEvent extends StyleguideEvent {
  example: ContextExample
  layout: string
}

export interface StyleguideEventMap {
  'context-entry': ContextEntryEvent
  example: ExampleEvent
  output: OutputEvent
  page: PageEvent
  source: SourceEvent
}

export type StyleguideListeners<T extends keyof StyleguideEventMap> = {
  [K in T]: ((event: StyleguideEventMap[K]) => void)[]
}

export interface StyleguideGenerateMap {
  exampleTitle: (example: ContextExample) => string
  footerText: () => string
  homeLink: () => string
  logo: () => string
  menu: (menu: Context['menu'], pages: Context['pages']) => Context['menu']
  name: () => string
  pageLink: (page: ContextEntry) => string
  pageTitle: (page: ContextEntry) => string
  resolveUrl: (uri: string, type: string) => string
}

export interface StyleguideTexts {
  copyright: 'Styleguide'
  title: string
}

export interface StyleguideSource {
  blocks: Block[]
}

export type StyleguideOutputCallback = (file: string, content: string) => Promise<void> | void
