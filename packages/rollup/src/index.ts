import {
  type FileSystem,
  type RendererInterface,
  Options as StyleguideOptions,
  Styleguide,
} from '@styleguide/core'
import { HtmlRenderer, Parser, TemplateLoader } from '@styleguide/html-renderer'
import { NodeFileSystem } from '@styleguide/node'
import type { Plugin } from 'rollup'

interface RollupStyleguidePluginOptions extends StyleguideOptions {
  source: string[]
  templatePath?: string
  styleAsset?: false | string
  highlightStyle?: string
}

const createDefaultRenderer = (templatePath: string | undefined, fileSystem: FileSystem): RendererInterface => {
  const renderer = new HtmlRenderer(Parser.init())

  const awaitLoaded = async () => {
    await TemplateLoader.load({
      renderer,
      fileSystem,
      templateBasePath: templatePath,
    })
  }

  awaitLoaded()

  return renderer
}

export default function createStyleguidePlugin(options: RollupStyleguidePluginOptions): Plugin {
  const fileSystem = NodeFileSystem.init()
  const finder = fileSystem.createFileFinder(options.source)

  // TODO detect template updates when templates in workspace

  const styleguide = new Styleguide({
    renderer: options.renderer || createDefaultRenderer(options.templatePath, fileSystem),
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
          styleguide.sourceCreate(file, await fileSystem.fileRead(file))
        }
      })
    },

    async watchChange(id, change) {
      if (styleguide.sourceExists(id)) {
        if (change.event === 'update') {
          styleguide.sourceUpdate(id, await fileSystem.fileRead(id))
        } else if (change.event === 'delete') {
          styleguide.sourceDelete(id)
        }

        return
      }

      if (change.event === 'create' && finder.matches(id)) {
        styleguide.sourceCreate(id, await fileSystem.fileRead(id))
      }
    },

    async generateBundle() {
      const assetLoader = fileSystem.assetLoader()

      // TODO output user info what was generated
      await styleguide.output(async (file, content) => {
        this.emitFile({
          type: 'asset',
          fileName: file,
          source: content,
        })
      })

      if (options.styleAsset !== false) {
        this.emitFile({
          type: 'asset',
          fileName: options.styleAsset || 'styleguide.css',
          source: await assetLoader.read('@styleguide/html-renderer/styleguide.css'),
        })
      }

      this.emitFile({
        type: 'asset',
        fileName: 'highlight.css',
        source: await assetLoader.read(`@highlightjs/cdn-assets/styles/${options.highlightStyle || 'default'}.min.css`),
      })

      this.emitFile({
        type: 'asset',
        fileName: 'highlight.js',
        source: await assetLoader.read('@highlightjs/cdn-assets/highlight.min.js'),
      })
    },
  }
}
