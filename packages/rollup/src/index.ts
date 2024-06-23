import type {
  AssetLoader,
  AssetType,
  BlockParserInterface,
  FileFinder,
  FileSystem,
  RendererInterface,
  StyleguideOptions,
} from '@styleguide/core'
import { Styleguide } from '@styleguide/core'
import { NodeFileSystem } from '@styleguide/node'
import type { Plugin } from 'rollup'

import { version } from '../package.json'

export const PLUGIN_NAME = 'styleguide'

const ASSETS: {
  name: (options: Options) => string | false
  source: (options: Options) => string | false
}[] = [
  {
    name: options => options.styleAsset ?? 'styleguide.css',
    source: () => '@styleguide/html-renderer/styleguide.min.css',
  },
  {
    name: () => 'styleguide.js',
    source: () => '@styleguide/html-renderer/styleguide.min.js',
  },
  {
    name: options => options.highlightStyle ?? 'highlight.css',
    source: options =>
      `@highlightjs/cdn-assets/styles/${options.highlightTheme ?? 'default'}.min.css`,
  },
  {
    name: options => options.highlightScript ?? 'highlight.js',
    source: () => '@highlightjs/cdn-assets/highlight.min.js',
  },
]

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

export interface ResolvedOptions {
  assets: { code: string; name: string; sourceFile: string; sourceName: string }[]
  assetsForCopy: string[]
  fileSystem: FileSystem
  finder: FileFinder
  pathPrefix: string
  styleguide: Styleguide
  source: string[]
  styleguideAsset: Api['styleguideAsset']
}

export interface Api {
  version: string
  get fileFinder(): FileFinder
  get fileSystem(): FileSystem
  get options(): ResolvedOptions
  get styleguide(): Styleguide
  styleguideAsset(src: string, as: 'example' | 'page'): void
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

function createOutputPathPrefix(options: Options): string {
  const path = options.outputDir

  if (!path) {
    return ''
  }

  const pathPrefix = path.endsWith('/') ? path : `${path}/`
  const prevResolveUrl = options.settings?.generate?.resolveUrl ?? (uri => uri)

  options.settings = options.settings ?? {}
  options.settings.generate = options.settings.generate ?? {}
  options.settings.generate.resolveUrl = (uri, type) => prevResolveUrl(`/${pathPrefix}${uri}`, type)

  return pathPrefix
}

function styleguideAssetType(fileName: string): AssetType | null {
  if (fileName.match(/\.(css|less|sass|scss)$/)) {
    return 'style'
  }

  if (fileName.match(/\.(js|ts)$/)) {
    return 'script'
  }

  return null
}

async function resolveAssets(
  options: Options,
  assetLoader: AssetLoader,
  pathPrefix: string,
): Promise<ResolvedOptions['assets']> {
  return (
    await Promise.all(
      ASSETS.map(async ({ name, source }) => {
        const fileName = name(options)
        const sourceName = source(options)

        if (sourceName === false || fileName === false) {
          return null
        }

        const sourceFile = await assetLoader.resolve(sourceName)

        if (!sourceFile) {
          return null
        }

        return {
          code: await assetLoader.read(sourceFile),
          name: `${pathPrefix}${fileName}`,
          sourceFile,
          sourceName,
        }
      }),
    )
  ).filter(asset => asset !== null) as ResolvedOptions['assets']
}

async function resolveOptions(options: Options): Promise<ResolvedOptions> {
  const pathPrefix = createOutputPathPrefix(options)
  const fileSystem = NodeFileSystem.init()
  const finder = fileSystem.createFileFinder(options.source)
  const styleguide = new Styleguide({
    blockParser: options.blockParser,
    renderer: options.renderer ?? (await createDefaultRenderer(options.templatePath, fileSystem)),
    ...(options.settings ?? {}),
  })
  const assetsForCopy: ResolvedOptions['assetsForCopy'] = []
  const styleguideAsset: ResolvedOptions['styleguideAsset'] = (src, as) => {
    const type = styleguideAssetType(src)

    if (!type) {
      return
    }

    if (as === 'example' && !assetsForCopy.includes(src)) {
      assetsForCopy.push(src)
    }

    const method = as === 'example' ? 'addExampleAsset' : 'addAsset'

    styleguide[method]({
      src,
      type,
    })
  }

  return {
    assets: await resolveAssets(options, fileSystem.assetLoader(), pathPrefix),
    assetsForCopy,
    fileSystem,
    finder,
    pathPrefix,
    source: options.source,
    styleguide,
    styleguideAsset,
  }
}

export default async function styleguidePlugin(rawOptions: Options): Promise<Plugin<Api>> {
  const options = await resolveOptions(rawOptions)
  const { finder, fileSystem, styleguide, pathPrefix, assetsForCopy, styleguideAsset } = options

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
      get options() {
        return options
      },
      get styleguide() {
        return styleguide
      },
      styleguideAsset,
      version,
    },

    async buildStart() {
      const watchedFiles = this.getWatchFiles()

      options.assets.forEach(({ name }) => {
        styleguideAsset(name, 'page')
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
      // find assets in bundle and register them in styleguide
      Object.keys(bundle).forEach(fileName => {
        if (bundle[fileName].type === 'asset') {
          styleguideAsset(fileName, 'example')
        }
      })

      options.assets.forEach(({ code, name, sourceName }) => {
        this.emitFile({
          fileName: name,
          source: code,
          type: 'asset',
        })
        this.info({ code: 'OUTPUT', message: `${name} from ${sourceName}` })
      })

      await styleguide.output((file, content) => {
        const fileName = `${pathPrefix}${file}`

        this.emitFile({
          fileName,
          source: content,
          type: 'asset',
        })
        this.info({ code: 'OUTPUT', message: `${fileName}` })
      })
    },

    async writeBundle(outputOptions) {
      if (pathPrefix === '') {
        return
      }

      // TODO may copy map file if exists
      await Promise.all(
        assetsForCopy.map(async asset => {
          const destFile = `${outputOptions.dir}/${pathPrefix}${asset}`
          const destDir = fileSystem.fileDirname(destFile)

          await fileSystem.ensureDirectoryExists(destDir)
          await fileSystem.fileCopy(`${outputOptions.dir}/${asset}`, destFile)
        }),
      )
    },

    // eslint-disable-next-line sort-keys
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
