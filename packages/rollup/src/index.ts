import path from 'node:path'

import type { AssetType, FileFinder, FileSystem } from '@ui-doc/core'
import { BlockParseError, UIDoc } from '@ui-doc/core'
import type { Plugin, PluginContext } from 'rollup'

import { version } from '../package.json'
import { resolveAssetType } from './utils/asset'
import { resolveOptions } from './utils/option'
import type { Options, ResolvedOptions } from './utils/option.types'

export const PLUGIN_NAME = 'ui-doc'

export { Options }
export interface Api {
  version: string
  get fileFinder(): FileFinder
  get fileSystem(): FileSystem
  get options(): ResolvedOptions
  get uidoc(): UIDoc
  uidocAsset(
    src: string,
    context: 'example' | 'page',
    options?: { fromInput?: boolean; type?: AssetType; attrs?: Record<string, string> },
  ): void
  isAssetFromInput(src: string): boolean
}

function handleBlockParseError(this: PluginContext, error: any) {
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

export default async function uidocPlugin(rawOptions: Options): Promise<Plugin<Api>> {
  const options = await resolveOptions(rawOptions)
  const { finder, fileSystem, uidoc, prefix, assetsFromInput, uidocAsset, staticAssets } = options

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
      isAssetFromInput(src: string): boolean {
        return assetsFromInput.includes(src)
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

    async buildStart(inputOptions) {
      const watchedFiles = this.getWatchFiles()

      options.assets.forEach(({ name, fromInput = false }, index) => {
        // if input is true, try to use inputOptions.input[name] as fileName
        if (fromInput && !Array.isArray(inputOptions.input) && inputOptions.input[name]) {
          options.assets[index].fileName = inputOptions.input[name]
            .replace(path.resolve('.'), '')
            .replace(/^\//g, '')
          options.assets[index].originalFileName = inputOptions.input[name]
          options.assets[index].type = resolveAssetType(inputOptions.input[name]) ?? undefined
        }
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
      const promises: Promise<void | boolean>[] = []

      // if ui-doc is created into subfolder we need to copy assets referenced in examples and are generated through other plugins
      if (prefix.path) {
        // TODO may copy map file if exists
        promises.push(
          ...assetsFromInput.map(async asset => {
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
          message: `assets: ${staticAssets} > ${outputOptions.dir}${prefix.path}`,
        })
      }

      await Promise.all(promises)
    },

    // eslint-disable-next-line sort-keys
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

        if (change.event === 'create' && finder.matches(id)) {
          uidoc.sourceCreate(id, await fileSystem.fileRead(id))
        }
      } catch (error) {
        handleBlockParseError.call(this, error)
      }
    },
  }
}
