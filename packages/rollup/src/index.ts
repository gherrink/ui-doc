import { type RendererInterface, Options as StyleguideOptions, Styleguide } from '@styleguide/core'
import { HtmlRenderer } from '@styleguide/html-renderer'
import { NodeFileFinder, NodeFileReader, NodeHtmlRendererTemplateLoader } from '@styleguide/node'
import type { Plugin } from 'rollup'

interface RollupStyleguidePluginOptions extends StyleguideOptions {
  source: string[]
  templatePath?: string
}

const createDefaultRenderer = (templatePath?: string): RendererInterface => {
  const renderer = new HtmlRenderer()

  NodeHtmlRendererTemplateLoader.load(renderer, templatePath)

  return renderer
}

export default function createStyleguidePlugin(options: RollupStyleguidePluginOptions): Plugin {
  const reader = new NodeFileReader()
  const finder = new NodeFileFinder(options.source)

  // TODO detect template updates when templates in workspace

  const styleguide = new Styleguide({
    renderer: options.renderer || createDefaultRenderer(options.templatePath),
  })

  // TODO clean up output directory

  return {
    name: 'rollup-plugin-styleguide',

    buildStart() {
      const watchedFiles = this.getWatchFiles()

      // TODO make it asynchron

      finder.search(file => {
        if (!watchedFiles.includes(file)) {
          this.addWatchFile(file)
        }
        if (!styleguide.sourceExists(file)) {
          styleguide.sourceCreate(file, reader.content(file))
        }
      })
    },

    watchChange(id, change) {
      // TODO make it asynchron
      if (styleguide.sourceExists(id)) {
        if (change.event === 'update') {
          styleguide.sourceUpdate(id, reader.content(id))
        } else if (change.event === 'delete') {
          styleguide.sourceDelete(id)
        }

        return
      }

      if (change.event === 'create' && finder.matches(id)) {
        styleguide.sourceCreate(id, reader.content(id))
      }
    },

    generateBundle() {
      styleguide.output((file, content) => this.emitFile({
        type: 'asset',
        fileName: file,
        source: content,
      }))
    },
  }
}
