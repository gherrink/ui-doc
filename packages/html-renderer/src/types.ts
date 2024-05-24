import { RendererInterface } from '@styleguide/core'

export interface HtmlRendererInterface extends RendererInterface {
  addTag(name: string, tag: HtmlRendererTag): HtmlRendererInterface

  addLayout(name: string, layout: string): HtmlRendererInterface

  addPartial(name: string, partial: string): HtmlRendererInterface

  addPage(name: string, page: string): HtmlRendererInterface

  render(content: string, context: {[key: string]: any}): string

  page(name: string, context: {[key: string]: any}): string

  partial(name: string, context?: {[key: string]: any}): string
}

export type HtmlRendererTag = {
  regex: RegExp,
  render: (ctx: {
    content: string,
    match: RegExpMatchArray,
    context: {[key: string]: any},
    renderer: HtmlRendererInterface,
  }) => string
}
