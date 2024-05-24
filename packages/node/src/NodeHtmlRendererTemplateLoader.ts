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

  public static load(renderer: HtmlRenderer, templatePath = '@styleguide/html-renderer/templates'): void {
    new NodeHtmlRendererTemplateLoader(templatePath).append(renderer)
  }

  public append(renderer: HtmlRenderer) {
    const name = (file: string): string => path.basename(file, path.extname(file))
    const content = (file: string): string => this.reader.content(file).trim()

    this.layoutFinder.search(file => {
      renderer.addLayout(name(file), content(file))
    })

    this.pageFinder.search(file => {
      renderer.addPage(name(file), content(file))
    })

    this.partialFinder.search(file => {
      renderer.addPartial(name(file), content(file))
    })
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
