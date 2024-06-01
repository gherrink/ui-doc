import { RendererInterface } from '@styleguide/core'

import type { ReaderInterface } from './reader'

export type RenderContext = Record<string, any>

export type HtmlRendererSourceInput = { source: string; content: string } | ReaderInterface

export interface HtmlRendererInterface extends RendererInterface {
  addLayout(name: string, layout: HtmlRendererSourceInput): HtmlRendererInterface

  addPartial(name: string, partial: HtmlRendererSourceInput): HtmlRendererInterface

  addPage(name: string, page: HtmlRendererSourceInput): HtmlRendererInterface

  page(name: string, context: RenderContext): string

  partial(name: string, context?: RenderContext): string
}
