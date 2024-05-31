import { HTMLRendererError } from './errors'
import { SyntaxError } from './errors/SyntaxError'
import { Reader } from './Reader'
import {
  type HtmlRendererSourceInput,
  type ReaderInterface,
  type RenderContext,
  HtmlRendererInterface,
  NodeInterface,
} from './types'
import type { ParserInterface } from './types/parser'

function instanceofReaderInterface(object: any): object is ReaderInterface {
  return typeof object.peak === 'function'
    && typeof object.consume === 'function'
    && typeof object.isEof === 'function'
    && typeof object.debug === 'function'
}

export class HtmlRenderer implements HtmlRendererInterface {
  protected parser: ParserInterface

  protected layouts: {[key: string]: NodeInterface} = {}

  protected partials: {[key: string]: NodeInterface} = {}

  protected pages: {[key: string]: NodeInterface} = {}

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
      if (error instanceof SyntaxError) {
        const debug = reader.debug()

        // TODO improve error message
        throw new HTMLRendererError(`Syntax error in ${debug.source} at line ${debug.line}:${debug.pos}: ${error.message}`)
      }

      throw error
    }
  }

  public generate(context: RenderContext, layout?: string): string {
    layout = layout || 'default'
    const content = this.layouts[layout] || undefined

    if (!content) {
      throw new HTMLRendererError(`Layout "${layout}" not found. Please register it using "addLayout" method.`)
    }

    return this.render(content, context)
  }

  public page(name: string, context: RenderContext): string {
    const content = this.pages[name]
      || this.pages.default
      || undefined

    if (!content) {
      throw new HTMLRendererError(`Page "${name}" not found. Please register it using "addPage" method.`)
    }

    return this.render(content, context)
  }

  public partial(name: string, context?: RenderContext): string {
    const content = this.partials[name] || this.partials.default || undefined

    if (!content) {
      throw new HTMLRendererError(`Partial "${name}" not found. Please register it using "addPartial" method.`)
    }

    return this.render(content, context || {})
  }

  protected render(rootNode: NodeInterface, context: RenderContext): string {
    return rootNode.render(context, this)
  }
}
