import { Renderer as CoreRenderer } from '@styleguide/core'

import type { Reader } from './reader'

export type RenderContext = Record<string, any>

export type SourceInput = { source: string; content: string } | Reader

export interface Renderer extends CoreRenderer {
  addLayout(name: string, layout: SourceInput): this

  addPartial(name: string, partial: SourceInput): this

  addPage(name: string, page: SourceInput): this

  page(name: string, context: RenderContext): string

  partial(name: string, context?: RenderContext): string
}
