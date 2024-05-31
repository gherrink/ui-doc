import type { HtmlRenderer } from '@styleguide/html-renderer'
import fs from 'node:fs'
import path from 'node:path'

import { NodeFileFinder } from './NodeFileFinder'
import { NodeFileReader } from './NodeFileReader'

export class NodeHtmlRendererTemplateLoader {
  protected reader: NodeFileReader

  protected layoutFinder: NodeFileFinder

  protected pageFinder: NodeFileFinder

  protected partialFinder: NodeFileFinder

  constructor(templatePath: string) {
    const templatesPath = this.resolveTemplatePath(templatePath)

    this.reader = new NodeFileReader()
    this.layoutFinder = this.createFileFinder([`${templatesPath}/layouts/*.html`])
    this.pageFinder = this.createFileFinder([`${templatesPath}/pages/*.html`])
    this.partialFinder = this.createFileFinder([`${templatesPath}/partials/*.html`])
  }

  public static async load(renderer: HtmlRenderer, templatePath = '@styleguide/html-renderer/templates'): Promise<NodeHtmlRendererTemplateLoader> {
    const loader = new NodeHtmlRendererTemplateLoader(templatePath)

    await loader.append(renderer)

    return loader
  }

  public async append(renderer: HtmlRenderer): Promise<void> {
    const name = (file: string): string => path.basename(file, path.extname(file))
    const content = async (file: string): Promise<string> => (await this.reader.content(file)).trim()

    await Promise.all([
      this.layoutFinder.search(async file => {
        renderer.addLayout(name(file), { content: await content(file), source: file })
      }),

      this.pageFinder.search(async file => {
        renderer.addPage(name(file), { content: await content(file), source: file })
      }),

      this.partialFinder.search(async file => {
        renderer.addPartial(name(file), { content: await content(file), source: file })
      }),
    ])
  }

  protected createFileFinder(globs: string[]): NodeFileFinder {
    return new NodeFileFinder(globs)
  }

  protected resolveTemplatePath(templatePath: string): string {
    const result = path.resolve(templatePath)

    if (fs.existsSync(result)) {
      return result
    }

    let foundPath: undefined | string

    require.resolve.paths(templatePath)?.forEach(nodePath => {
      if (foundPath) {
        return
      }

      const dir = path.join(nodePath, templatePath)

      if (fs.existsSync(dir)) {
        foundPath = dir
      }
    })

    if (!foundPath) {
      throw new Error(`Template path not found: ${templatePath}`)
    }

    return foundPath
  }
}
