import type {
  AssetLoader,
  AssetType,
  BlockParser,
  FileFinder,
  FileSystem,
  Options as UIDocOptions,
  Renderer,
} from '@ui-doc/core'
import { UIDoc } from '@ui-doc/core'
import { NodeFileSystem } from '@ui-doc/node'
import type { Plugin } from 'rollup'

import { version } from '../package.json'

export const PLUGIN_NAME = 'ui-doc'

const ASSETS: {
  name: (options: Options) => string | false
  source: (options: Options) => string | false
}[] = [
  {
    name: options => options.styleAsset ?? 'ui-doc.css',
    source: () => '@ui-doc/html-renderer/ui-doc.min.css',
  },
  {
    name: () => 'ui-doc.js',
    source: () => '@ui-doc/html-renderer/ui-doc.min.js',
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
  renderer?: Renderer
  blockParser?: BlockParser
  source: string[]
  templatePath?: string
  styleAsset?: false | string
  highlightStyle?: false | string
  highlightTheme?: string
  highlightScript?: false | string
  outputDir?: string
  settings?: Pick<UIDocOptions, 'generate' | 'texts'>
  staticAssets?: string
}

export interface ResolvedOptions {
  assets: { code: string; name: string; sourceFile: string; sourceName: string }[]
  assetsForCopy: string[]
  staticAssets?: string
  fileSystem: FileSystem
  finder: FileFinder
  pathPrefix: string
  uidoc: UIDoc
  source: string[]
  uidocAsset: Api['uidocAsset']
}

export interface Api {
  version: string
  get fileFinder(): FileFinder
  get fileSystem(): FileSystem
  get options(): ResolvedOptions
  get uidoc(): UIDoc
  uidocAsset(src: string, as: 'example' | 'page'): void
}

async function createDefaultRenderer(
  templatePath: string | undefined,
  fileSystem: FileSystem,
): Promise<Renderer> {
  const rendererImport = await import('@ui-doc/html-renderer')
  const renderer = new rendererImport.HtmlRenderer(rendererImport.NodeParser.init())

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

function uidocAssetType(fileName: string): AssetType | null {
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
          name: `${fileName}`,
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
  const uidoc = new UIDoc({
    blockParser: options.blockParser,
    renderer: options.renderer ?? (await createDefaultRenderer(options.templatePath, fileSystem)),
    ...(options.settings ?? {}),
  })
  const assetsForCopy: ResolvedOptions['assetsForCopy'] = []
  const uidocAsset: ResolvedOptions['uidocAsset'] = (src, as) => {
    const type = uidocAssetType(src)

    if (!type) {
      return
    }

    if (as === 'example' && !assetsForCopy.includes(src)) {
      assetsForCopy.push(src)
    }

    const method = as === 'example' ? 'addExampleAsset' : 'addAsset'

    uidoc[method]({
      src,
      type,
    })
  }

  return {
    assets: await resolveAssets(options, fileSystem.assetLoader()),
    assetsForCopy,
    fileSystem,
    finder,
    pathPrefix,
    source: options.source,
    staticAssets: options.staticAssets,
    uidoc,
    uidocAsset,
  }
}

export default async function uidocPlugin(rawOptions: Options): Promise<Plugin<Api>> {
  const options = await resolveOptions(rawOptions)
  const { finder, fileSystem, uidoc, pathPrefix, assetsForCopy, uidocAsset, staticAssets } = options

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
      get uidoc() {
        return uidoc
      },
      uidocAsset,
      version,
    },

    async buildStart() {
      const watchedFiles = this.getWatchFiles()

      options.assets.forEach(({ name }) => {
        uidocAsset(name, 'page')
      })

      // TODO detect template updates when templates in workspace

      await finder.search(async file => {
        if (!watchedFiles.includes(file)) {
          this.addWatchFile(file)
        }
        if (!uidoc.sourceExists(file)) {
          uidoc.sourceCreate(file, await fileSystem.fileRead(file))
        }
      })
    },

    async generateBundle(_outputOptions, bundle) {
      // find assets in bundle and register them to UI-Doc
      Object.keys(bundle).forEach(fileName => {
        if (bundle[fileName].type === 'asset') {
          uidocAsset(fileName, 'example')
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

      await uidoc.output((file, content) => {
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
      const promises: Promise<void | boolean>[] = []

      // if ui-doc is created into subfolder we need to copy assets referenced in examples and are generated through other plugins
      if (pathPrefix) {
        // TODO may copy map file if exists
        promises.push(
          ...assetsForCopy.map(async asset => {
            const destFile = `${outputOptions.dir}/${pathPrefix}${asset}`
            const destDir = fileSystem.fileDirname(destFile)

            await fileSystem.ensureDirectoryExists(destDir)
            await fileSystem.fileCopy(`${outputOptions.dir}/${asset}`, destFile)
          }),
        )
      }

      if (staticAssets) {
        promises.push(fileSystem.directoryCopy(staticAssets, `${outputOptions.dir}/${pathPrefix}`))
        this.info({
          code: 'OUTPUT',
          message: `assets: ${staticAssets} > ${outputOptions.dir}${pathPrefix}`,
        })
      }

      await Promise.all(promises)
    },

    // eslint-disable-next-line sort-keys
    async watchChange(id, change) {
      if (uidoc.sourceExists(id)) {
        if (change.event === 'update') {
          uidoc.sourceUpdate(id, await fileSystem.fileRead(id))
        } else if (change.event === 'delete') {
          uidoc.sourceDelete(id)
        }

        return
      }

      if (change.event === 'create' && finder.matches(id)) {
        uidoc.sourceCreate(id, await fileSystem.fileRead(id))
      }
    },
  }
}
