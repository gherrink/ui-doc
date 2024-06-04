import type { FileSystem, RendererInterface, StyleguideOptions } from '@styleguide/core'
import { Styleguide } from '@styleguide/core'
import { HtmlRenderer, Parser, TemplateLoader } from '@styleguide/html-renderer'
import { NodeFileSystem } from '@styleguide/node'
import type { Plugin } from 'rollup'

interface RollupStyleguidePluginOptions extends StyleguideOptions {
  source: string[]
  templatePath?: string
  styleAsset?: false | string
  highlightStyle?: string
}

const PLUGIN_NAME = 'rollup-plugin-styleguide'

const createDefaultRenderer = async (
  templatePath: string | undefined,
  fileSystem: FileSystem,
): Promise<RendererInterface> => {
  // TODO make import async so if html render is not installed it will not fail
  const renderer = new HtmlRenderer(Parser.init())

  await TemplateLoader.load({
    fileSystem,
    renderer,
    templateBasePath: templatePath,
  })

  return renderer
}

export default function createStyleguidePlugin(options: RollupStyleguidePluginOptions): Plugin {
  const fileSystem = NodeFileSystem.init()
  const finder = fileSystem.createFileFinder(options.source)
  let styleguide: Styleguide

  return {
    name: PLUGIN_NAME,

    // eslint-disable-next-line sort-keys
    async buildStart() {
      const watchedFiles = this.getWatchFiles()

      styleguide = new Styleguide({
        renderer:
          options.renderer || (await createDefaultRenderer(options.templatePath, fileSystem)),
      })

      // TODO detect template updates when templates in workspace

      await finder.search(async file => {
        if (!watchedFiles.includes(file)) {
          this.addWatchFile(file)
        }
        if (!styleguide.sourceExists(file)) {
          styleguide.sourceCreate(file, await fileSystem.fileRead(file))
        }
      })
    },

    async generateBundle() {
      const assetLoader = fileSystem.assetLoader()

      // TODO output user info what was generated
      await styleguide.output(async (file, content) => {
        this.emitFile({
          fileName: file,
          source: content,
          type: 'asset',
        })
      })

      if (options.styleAsset !== false) {
        this.emitFile({
          fileName: options.styleAsset ?? 'styleguide.css',
          source: await assetLoader.read('@styleguide/html-renderer/styleguide.css'),
          type: 'asset',
        })
      }

      this.emitFile({
        fileName: 'highlight.css',
        source: await assetLoader.read(
          `@highlightjs/cdn-assets/styles/${options.highlightStyle ?? 'default'}.min.css`,
        ),
        type: 'asset',
      })

      this.emitFile({
        fileName: 'highlight.js',
        source: await assetLoader.read('@highlightjs/cdn-assets/highlight.min.js'),
        type: 'asset',
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
  }
}
