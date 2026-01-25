import type { AssetType, FileFinder, FileSystem, UIDoc } from '@ui-doc/core'

import type { Plugin, PluginContext } from 'rollup'
import type { Options, ResolvedOptions } from './utils/option.types'
import path from 'node:path'

import { BlockParseError } from '@ui-doc/core'
import { version } from '../package.json'
import { resolveAssetType } from './utils/asset'
import { resolveOptions } from './utils/option'

export const PLUGIN_NAME = 'ui-doc'

export { Options }

/**
 * Public API exposed by the UI-Doc Rollup plugin.
 * Access via `this.meta.plugins.find(p => p.name === 'ui-doc')?.api`
 */
export interface Api {
  /** Plugin version */
  version: string
  /** File finder instance for searching source files */
  get fileFinder(): FileFinder
  /** File system abstraction for file operations */
  get fileSystem(): FileSystem
  /** Resolved plugin options */
  get options(): ResolvedOptions
  /** UI-Doc instance for documentation generation */
  get uidoc(): UIDoc
  /** Register an asset for inclusion in documentation pages or examples */
  uidocAsset: (
    src: string,
    context: 'example' | 'page',
    options?: { fromInput?: boolean, type?: AssetType, attrs?: Record<string, string> },
  ) => void
  /** Check if an asset was marked as coming from input */
  isAssetFromInput: (src: string) => boolean
  /** Mark an asset as coming from input */
  addAssetFromInput: (src: string) => void
}

function handleBlockParseError(this: PluginContext, error: unknown) {
  if (!(error instanceof BlockParseError)) {
    throw error
  }

  this.warn({
    cause: error,
    loc: { column: 0, file: error.source, line: error.line },
    message: error.message,
    stack: error.code,
  })
}

/**
 * Creates a UI-Doc Rollup plugin instance.
 * @param rawOptions - Configuration options for the plugin
 * @returns A Rollup plugin that generates UI documentation
 */
export default async function uidocPlugin(rawOptions: Options): Promise<Plugin<Api>> {
  const options = await resolveOptions(rawOptions)
  const {
    finder,
    fileSystem,
    uidoc,
    prefix,
    assetsFromInput,
    isAssetFromInput,
    addAssetFromInput,
    uidocAsset,
    staticAssets,
  } = options

  return {
    name: PLUGIN_NAME,
    version,

    api: {
      version,
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
      isAssetFromInput,
      addAssetFromInput,
    },

    async buildStart(inputOptions) {
      const watchedFiles = this.getWatchFiles()

      // if fromInput is true, try to use inputOptions.input[name] as fileName
      options.assets = options.assets.map(asset => {
        const { name, fromInput = false } = asset
        if (
          fromInput
          && typeof inputOptions.input === 'object'
          && inputOptions.input !== null
          && !Array.isArray(inputOptions.input)
          && inputOptions.input[name]
        ) {
          const inputPath = inputOptions.input[name]
          return {
            ...asset,
            fileName: inputPath.replace(path.resolve('.'), '').replace(/^\//g, ''),
            originalFileName: inputPath,
            type: resolveAssetType(inputPath) ?? undefined,
          }
        }
        return asset
      })

      // TODO detect template updates when templates in workspace

      await finder.search(async file => {
        if (!watchedFiles.includes(file)) {
          this.addWatchFile(file)
        }
        if (!uidoc.sourceExists(file)) {
          try {
            uidoc.sourceCreate(file, await fileSystem.fileRead(file))
          } catch (error) {
            handleBlockParseError.call(this, error)
          }
        }
      })
    },

    async generateBundle() {
      options.assets.forEach(
        ({ name, fileName, source, originalFileName, context, attrs, type, fromInput = false }) => {
          if (source) {
            this.emitFile({
              name,
              fileName: `${prefix.path}${fileName}`,
              source,
              type: 'asset',
            })

            this.info({
              code: 'OUTPUT',
              message: `${fileName} from ${originalFileName}`,
            })
          }

          uidocAsset(fileName, context, { attrs, fromInput, type })
        },
      )

      await uidoc.output((file, content) => {
        const fileName = `${prefix.path}${file}`

        this.emitFile({
          fileName,
          source: content,
          type: 'asset',
        })
        this.info({ code: 'OUTPUT', message: `${fileName}` })
      })
    },

    async writeBundle(outputOptions) {
      if (!outputOptions.dir) {
        return
      }

      const promises: Promise<void | boolean>[] = []

      // if ui-doc is created into subfolder we need to copy assets referenced in examples and are generated through other plugins
      if (prefix.path) {
        // TODO may copy map file if exists
        promises.push(
          ...[...assetsFromInput].map(async asset => {
            const destFile = `${outputOptions.dir}/${prefix.path}${asset}`
            const destDir = fileSystem.fileDirname(destFile)

            await fileSystem.ensureDirectoryExists(destDir)
            await fileSystem.fileCopy(`${outputOptions.dir}/${asset}`, destFile)
          }),
        )
      }

      if (staticAssets) {
        promises.push(fileSystem.directoryCopy(staticAssets, `${outputOptions.dir}/${prefix.path}`))
        this.info({
          code: 'OUTPUT',
          message: `copying assets from ${staticAssets}`,
        })
      }

      await Promise.all(promises)
    },

    async watchChange(id, change) {
      try {
        if (uidoc.sourceExists(id)) {
          if (change.event === 'update') {
            uidoc.sourceUpdate(id, await fileSystem.fileRead(id))
          } else if (change.event === 'delete') {
            uidoc.sourceDelete(id)
          }

          return
        }

        if ((change.event === 'create' || change.event === 'update') && finder.matches(id)) {
          uidoc.sourceCreate(id, await fileSystem.fileRead(id))
        }
      } catch (error) {
        handleBlockParseError.call(this, error)
      }
    },
  }
}
