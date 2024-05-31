import { type RendererInterface, Options as StyleguideOptions, Styleguide } from '@styleguide/core'
import { HtmlRenderer, Parser } from '@styleguide/html-renderer'
import { NodeFileFinder, NodeFileReader, NodeHtmlRendererTemplateLoader } from '@styleguide/node'
import type { Plugin } from 'rollup'

interface RollupStyleguidePluginOptions extends StyleguideOptions {
  source: string[]
  templatePath?: string
}

const createDefaultRenderer = (templatePath?: string): RendererInterface => {
  const renderer = new HtmlRenderer(Parser.init())

  const awaitLoaded = async () => {
    await NodeHtmlRendererTemplateLoader.load(renderer, templatePath)
  }

  awaitLoaded()

  return renderer
}

export default function createStyleguidePlugin(options: RollupStyleguidePluginOptions): Plugin {
  const reader = new NodeFileReader()
  const finder = new NodeFileFinder(options.source)

  // TODO detect template updates when templates in workspace

  const styleguide = new Styleguide({
    renderer: options.renderer || createDefaultRenderer(options.templatePath),
  })

  // TODO may clean up output directory

  return {
    name: 'rollup-plugin-styleguide',

    async buildStart() {
      const watchedFiles = this.getWatchFiles()

      await finder.search(async file => {
        if (!watchedFiles.includes(file)) {
          this.addWatchFile(file)
        }
        if (!styleguide.sourceExists(file)) {
          styleguide.sourceCreate(file, await reader.content(file))
        }
      })
    },

    async watchChange(id, change) {
      if (styleguide.sourceExists(id)) {
        if (change.event === 'update') {
          styleguide.sourceUpdate(id, await reader.content(id))
        } else if (change.event === 'delete') {
          styleguide.sourceDelete(id)
        }

        return
      }

      if (change.event === 'create' && finder.matches(id)) {
        styleguide.sourceCreate(id, await reader.content(id))
      }
    },

    generateBundle() {
      // TODO output user info what was generated

      styleguide.output((file, content) => this.emitFile({
        type: 'asset',
        fileName: file,
        source: content,
      }))
    },
  }
}
