import type { Asset, GenerateContext } from '@ui-doc/core'

import { HTMLRendererError, HTMLRendererSyntaxError, ParserError } from './errors'
import { InlineReader } from './InlineReader'
import type { Node } from './nodes'
import type { Parser } from './Parser.types'
import type { Reader } from './Reader.types'
import type { RenderContext, Renderer, SourceInput } from './Renderer.types'

function instanceofReader(object: any): object is Reader {
  return (
    typeof object.peak === 'function' &&
    typeof object.consume === 'function' &&
    typeof object.isEof === 'function' &&
    typeof object.debug === 'function'
  )
}

export class HtmlRenderer implements Renderer {
  protected parser: Parser

  protected layouts: Record<string, Node> = {}

  protected partials: Record<string, Node> = {}

  protected pages: Record<string, Node> = {}

  public constructor(parser: Parser) {
    this.parser = parser
  }

  public addLayout(name: string, layout: SourceInput): this {
    this.layouts[name] = this.parse(layout)

    return this
  }

  public addPartial(name: string, partial: SourceInput): this {
    this.partials[name] = this.parse(partial)

    return this
  }

  public addPage(name: string, page: SourceInput): this {
    this.pages[name] = this.parse(page)

    return this
  }

  protected parse(input: SourceInput): Node {
    const reader = !instanceofReader(input) ? new InlineReader(input.content, input.source) : input

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

  public generate(context: GenerateContext, layout?: string): string {
    layout = layout ?? 'default'
    const content = this.layouts[layout] || undefined

    if (!content) {
      throw new HTMLRendererError(
        `Layout "${layout}" not found. Please register it using "addLayout" method.`,
      )
    }

    return this.render(content, this.generateContext(context))
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

  protected render(rootNode: Node, context: RenderContext): string {
    return rootNode.render(context, this)
  }

  protected generateContext(context: GenerateContext): RenderContext {
    const renderContext = context as RenderContext

    renderContext.styles = context.assets
      .filter((asset: Asset) => asset.type === 'style')
      .map(
        (asset: Asset) =>
          `<link href="${asset.src}" rel="stylesheet"${this.makeAttributes(asset.attrs)}>`,
      )
      .join('\n')

    renderContext.scripts = context.assets
      .filter((asset: Asset) => asset.type === 'script')
      .map(
        (asset: Asset) => `<script src="${asset.src}"${this.makeAttributes(asset.attrs)}></script>`,
      )
      .join('\n')

    return renderContext
  }

  protected makeAttributes(attrs: Record<string, string> = {}): string {
    return Object.keys(attrs).reduce((result, key) => `${result} ${key}="${attrs[key]}"`, '')
  }
}
