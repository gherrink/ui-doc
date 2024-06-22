import type {
  AssetType,
  BlockParserInterface,
  FileFinder,
  FileSystem,
  RendererInterface,
  StyleguideOptions,
} from '@styleguide/core'
import { Styleguide } from '@styleguide/core'
import { NodeFileSystem } from '@styleguide/node'
import type { OutputAsset, OutputChunk, Plugin } from 'rollup'

import { version } from '../package.json'

export const PLUGIN_NAME = 'styleguide'

export interface Options {
  renderer?: RendererInterface
  blockParser?: BlockParserInterface
  source: string[]
  templatePath?: string
  styleAsset?: false | string
  highlightStyle?: false | string
  highlightTheme?: false | string
  highlightScript?: false | string
  outputDir?: string
  settings?: Pick<StyleguideOptions, 'generate' | 'texts'>
}

export interface Api {
  version: string
  get fileFinder(): FileFinder
  get fileSystem(): FileSystem
  get styleguide(): Styleguide
}

async function createDefaultRenderer(
  templatePath: string | undefined,
  fileSystem: FileSystem,
): Promise<RendererInterface> {
  const rendererImport = await import('@styleguide/html-renderer')
  const renderer = new rendererImport.HtmlRenderer(rendererImport.Parser.init())

  await rendererImport.TemplateLoader.load({
    fileSystem,
    renderer,
    templateBasePath: templatePath,
  })

  return renderer
}

function styleguideAssetType(fileName: string): AssetType {
  return fileName.match(/\.(css|less|sass|scss)$/) ? 'style' : 'script'
}

export default function createStyleguidePlugin(options: Options): Plugin<Api> {
  const fileSystem = NodeFileSystem.init()
  const finder = fileSystem.createFileFinder(options.source)
  let styleguide: Styleguide
  let outputDir = options.outputDir ?? ''

  if (!outputDir.endsWith('/') && outputDir !== '') {
    outputDir += '/'
  }

  return {
    name: PLUGIN_NAME,
    version,

    // eslint-disable-next-line sort-keys
    api: {
      get fileFinder() {
        return finder
      },
      get fileSystem() {
        return fileSystem
      },
      get styleguide() {
        return styleguide
      },
      version,
    },

    // eslint-disable-next-line sort-keys
    async buildStart() {
      const watchedFiles = this.getWatchFiles()

      styleguide = new Styleguide({
        blockParser: options.blockParser,
        renderer:
          options.renderer ?? (await createDefaultRenderer(options.templatePath, fileSystem)),
        ...(options.settings ?? {}),
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

    async generateBundle(_outputOptions, bundle) {
      const assetLoader = fileSystem.assetLoader()

      // extract assets from bundle to use in styleguide
      if (outputDir !== '') {
        Object.keys(bundle).forEach(fileName => {
          if (fileName.startsWith(outputDir)) {
            return
          }

          let assetFile

          if (bundle[fileName].type === 'asset') {
            const file = bundle[fileName] as OutputAsset

            assetFile = fileName
            this.emitFile({
              fileName: `${outputDir}${fileName}`,
              name: file.name,
              needsCodeReference: file.needsCodeReference,
              source: file.source,
              type: 'asset',
            })
          } else if (bundle[fileName].type === 'chunk') {
            const file = bundle[fileName] as OutputChunk

            assetFile = fileName
            this.emitFile({
              code: file.code,
              fileName: `${outputDir}${fileName}`,
              map: file.map ?? undefined,
              type: 'prebuilt-chunk',
            })
          }

          if (assetFile) {
            styleguide.addExampleAsset({
              src: assetFile,
              type: styleguideAssetType(fileName),
            })
          }
        })
      }

      const outputFromOption = async (
        fileNameCallback: () => string | false,
        sourceCallback: () => string | false,
      ) => {
        const fileName = fileNameCallback()
        const source = sourceCallback()

        if (source === false || fileName === false) {
          return
        }

        const outputFileName = `${outputDir}${fileName}`

        this.emitFile({
          fileName: outputFileName,
          source: await assetLoader.read(source),
          type: 'asset',
        })
        styleguide.addAsset({
          src: fileName,
          type: styleguideAssetType(fileName),
        })
        this.info({ code: 'OUTPUT', message: `${outputFileName} from ${source}` })
      }

      await outputFromOption(
        () => options.styleAsset ?? 'styleguide.css',
        () => '@styleguide/html-renderer/styleguide.css',
      )

      await outputFromOption(
        () => 'styleguide.js',
        () => '@styleguide/html-renderer/styleguide.js',
      )

      await outputFromOption(
        () => options.highlightScript ?? 'highlight.css',
        () => `@highlightjs/cdn-assets/styles/${options.highlightTheme ?? 'default'}.min.css`,
      )

      await outputFromOption(
        () => options.highlightScript ?? 'highlight.js',
        () => '@highlightjs/cdn-assets/highlight.min.js',
      )

      await styleguide.output((file, content) => {
        const fileName = `${outputDir}${file}`

        this.emitFile({
          fileName,
          source: content,
          type: 'asset',
        })
        this.info({ code: 'OUTPUT', message: `${fileName}` })
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
