import type { ContextEntry, ContextExample } from './Context.types'
import type { Source } from './UIDoc.types'

export type ContextEntryEvent = { entry: ContextEntry; key: string } & (
  | {
      type: 'create' | 'update'
      changes: {
        deleted: string[]
        updated: Record<string, { from: unknown; to: unknown }>
      }
    }
  | {
      type: 'delete'
    }
)

export interface SourceEvent {
  file: string
  source: Source
  type: 'create' | 'update' | 'delete'
}

export interface OutputEvent {
  promises: Promise<void>[]
  write: (file: string, content: string) => Promise<void>
}

export interface PageEvent {
  layout?: string
  page: ContextEntry
}

export interface ExampleEvent {
  example: ContextExample
  layout: string
}

export interface UIDocEventMap {
  [key: string]: unknown[]
  'context-entry': [ContextEntryEvent]
  example: [ExampleEvent]
  output: [OutputEvent]
  page: [PageEvent]
  source: [SourceEvent]
}
