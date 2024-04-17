import { HTMLRendererError } from './errors'
import defaultTags from './tags'
import { HtmlRendererInterface, HtmlRendererTag } from './types'

export class HtmlRenderer implements HtmlRendererInterface {
  protected layouts: {[key: string]: string} = {}

  protected partials: {[key: string]: string} = {}

  protected pages: {[key: string]: string} = {}

  protected tags: {[key: string]: HtmlRendererTag} = {}

  public constructor() {
    this.tags = defaultTags
  }

  public addTag(name: string, tag: HtmlRendererTag): HtmlRenderer {
    this.tags[name] = tag

    return this
  }

  public addLayout(name: string, layout: string): HtmlRenderer {
    this.layouts[name] = layout

    return this
  }

  public addPartial(name: string, partial: string): HtmlRenderer {
    this.partials[name] = partial

    return this
  }

  public addPage(name: string, page: string): HtmlRenderer {
    this.pages[name] = page

    return this
  }

  public generate(context: {[key: string]: any}, layout?: string): string {
    layout = layout || 'default'
    const content = this.layouts[layout] || undefined

    if (!content) {
      throw new HTMLRendererError(`Layout "${layout}" not found. Please register it using "addLayout" method.`)
    }

    return this.render(content, context)
  }

  public render(content: string, context: {[key: string]: any}): string {
    Object.keys(this.tags).forEach(tagKey => {
      const tag = this.tags[tagKey];

      [...content.matchAll(tag.regex)].forEach(match => {
        content = tag.render({
          content, match, context, renderer: this,
        })
      })
    })

    return content
  }

  public page(name: string, context: {[key: string]: any}): string {
    const content = this.pages[name]
      || this.pages.default
      || undefined

    if (!content) {
      throw new HTMLRendererError(`Page "${name}" not found. Please register it using "addPage" method.`)
    }

    return this.render(content, context)
  }

  public partial(name: string, context?: {[key: string]: any}): string {
    const content = this.partials[name] || this.partials.default || undefined

    if (!content) {
      throw new HTMLRendererError(`Partial "${name}" not found. Please register it using "addPartial" method.`)
    }

    return this.render(content, context || {})
  }

}
