import type { Asset, OutputContext } from '@styleguide/core'

import { HTMLRendererError, HTMLRendererSyntaxError, ParserError } from './errors'
import { Reader } from './Reader'
import {
  HtmlRendererInterface,
  type HtmlRendererSourceInput,
  NodeInterface,
  type ReaderInterface,
  type RenderContext,
} from './types'
import type { ParserInterface } from './types/parser'

function instanceofReaderInterface(object: any): object is ReaderInterface {
  return (
    typeof object.peak === 'function' &&
    typeof object.consume === 'function' &&
    typeof object.isEof === 'function' &&
    typeof object.debug === 'function'
  )
}

export class HtmlRenderer implements HtmlRendererInterface {
  protected parser: ParserInterface

  protected layouts: Record<string, NodeInterface> = {}

  protected partials: Record<string, NodeInterface> = {}

  protected pages: Record<string, NodeInterface> = {}

  public constructor(parser: ParserInterface) {
    this.parser = parser
  }

  public addLayout(name: string, layout: HtmlRendererSourceInput): HtmlRenderer {
    this.layouts[name] = this.parse(layout)

    return this
  }

  public addPartial(name: string, partial: HtmlRendererSourceInput): HtmlRenderer {
    this.partials[name] = this.parse(partial)

    return this
  }

  public addPage(name: string, page: HtmlRendererSourceInput): HtmlRenderer {
    this.pages[name] = this.parse(page)

    return this
  }

  protected parse(input: HtmlRendererSourceInput): NodeInterface {
    const reader = !instanceofReaderInterface(input)
      ? new Reader(input.content, input.source)
      : input

    try {
      return this.parser.parse(reader)
    } catch (error) {
      if (error instanceof ParserError) {
        const debug = reader.debug()

        throw new HTMLRendererSyntaxError({
          code: debug.content,
          column: debug.pos,
          line: debug.line,
          message: error.message,
          source: debug.source,
        })
      }

      throw error
    }
  }

  public generate(context: OutputContext, layout?: string): string {
    layout = layout ?? 'default'
    const content = this.layouts[layout] || undefined

    if (!content) {
      throw new HTMLRendererError(
        `Layout "${layout}" not found. Please register it using "addLayout" method.`,
      )
    }

    return this.render(content, this.prepareGenerateContext(context))
  }

  public page(name: string, context: RenderContext): string {
    const content = this.pages[name] || this.pages.default || undefined

    if (!content) {
      throw new HTMLRendererError(
        `Page "${name}" not found. Please register it using "addPage" method.`,
      )
    }

    return this.render(content, context)
  }

  public partial(name: string, context?: RenderContext): string {
    const content = this.partials[name] || this.partials.default || undefined

    if (!content) {
      throw new HTMLRendererError(
        `Partial "${name}" not found. Please register it using "addPartial" method.`,
      )
    }

    return this.render(content, context ?? {})
  }

  protected render(rootNode: NodeInterface, context: RenderContext): string {
    return rootNode.render(context, this)
  }

  protected prepareGenerateContext(inputContext: OutputContext): RenderContext {
    const context = inputContext as RenderContext

    context.styles = inputContext.assets
      .filter((asset: Asset) => asset.type === 'style')
      .map(
        (asset: Asset) =>
          `<link href="${asset.src}" rel="stylesheet"${this.makeAttributes(asset.attrs)}>`,
      )
      .join('\n')

    context.scripts = inputContext.assets
      .filter((asset: Asset) => asset.type === 'script')
      .map(
        (asset: Asset) => `<script src="${asset.src}"${this.makeAttributes(asset.attrs)}></script>`,
      )
      .join('\n')

    return context
  }

  protected makeAttributes(attrs: Record<string, string> = {}): string {
    return Object.keys(attrs).reduce((result, key) => `${result} ${key}="${attrs[key]}"`, '')
  }
}
