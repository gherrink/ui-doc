import type { Api as RollupPluginApi, Options as RollupPluginOptions } from '@ui-doc/rollup'
import type { InputOptions, OutputBundle, OutputOptions, PluginContext } from 'rollup'
import type { Plugin, ViteDevServer } from 'vite'

import path from 'node:path'
import createRollupPlugin, { PLUGIN_NAME as ROLLUP_PLUGIN_NAME } from '@ui-doc/rollup'
import pc from 'picocolors'

import { version } from '../package.json'

const PLUGIN_NAME = 'ui-doc'

/**
 * Delay in milliseconds before logging server ready message.
 * Allows Vite's own logging to complete first for cleaner output.
 */
const SERVER_READY_LOG_DELAY_MS = 300

/**
 * Options for configuring the UI-Doc Vite plugin.
 * Extends all options from the Rollup plugin.
 */
export type Options = RollupPluginOptions

/**
 * API exposed by the UI-Doc Vite plugin.
 * Extends the Rollup plugin API with version information.
 */
export interface Api extends RollupPluginApi {
  version: string
}

/**
 * Rollup hook function type for buildStart.
 */
type BuildStartHook = (this: PluginContext, options: InputOptions) => Promise<void> | void

/**
 * Rollup hook function type for generateBundle.
 */
type GenerateBundleHook = (
  this: PluginContext,
  options: OutputOptions,
  bundle: OutputBundle,
  isWrite: boolean,
) => Promise<void> | void

/**
 * Vite-specific bundle output entry with metadata about imported assets.
 */
interface ViteBundleEntry {
  name?: string
  fileName?: string
  viteMetadata?: {
    importedAssets?: Set<string>
    importedCss?: Set<string>
  }
}

/**
 * Resolves plugin options with defaults.
 * Returns a new object to avoid mutating the input.
 */
function resolveOptions(options: Options): Options {
  return {
    ...options,
    output: {
      ...options.output,
      dir: options.output?.dir ?? 'ui-doc',
    },
  }
}

function prepareServe(api: Api) {
  if (api.options.prefix.uri) {
    // replace resolveUrl to make sure that all urls (pages and assets) are generated correctly for vite server
    api.uidoc.replaceGenerate('resolve', (uri, type) => {
      // don't add prefix if asset is from vite
      return ['asset', 'asset-example'].includes(type) && (api.isAssetFromInput(uri) || uri.startsWith('@'))
        ? `/${uri}`
        : `/${api.options.prefix.uri}${uri}`
    })
  }

  // register all assets to ui-doc
  api.options.assets.forEach(({ fileName, context, attrs, fromInput = false }) => {
    api.uidocAsset(fileName, context, { attrs, fromInput })
  })

  // add vite client script to ui-doc
  api.uidocAsset('@vite/client', 'page', { attrs: { type: 'module' }, type: 'script' })
}

/**
 * Creates a UI-Doc Vite plugin for generating interactive UI documentation.
 *
 * @param rawOptions - Configuration options for the plugin
 * @returns A configured Vite plugin instance
 *
 * @example
 * ```ts
 * import uidoc from '@ui-doc/vite'
 *
 * export default defineConfig({
 *   plugins: [uidoc({ source: 'src/**\/*.css' })]
 * })
 * ```
 */
export default async function uidocPlugin(rawOptions: Options): Promise<Plugin<Api>> {
  const options = resolveOptions(rawOptions)
  const plugin = (await createRollupPlugin(options)) as Plugin<Api>
  let serving = false

  plugin.name = PLUGIN_NAME
  plugin.version = version

  const api = plugin.api
  if (!api) {
    throw new Error('UI-Doc rollup plugin API is not available')
  }
  api.version = version

  plugin.onLog = (_level, log) => {
    // hide rollup output logs
    if (log.plugin === ROLLUP_PLUGIN_NAME && log.pluginCode === 'OUTPUT') {
      return false
    }
  }

  plugin.config = (_config, { command }) => {
    serving = command === 'serve'
  }

  const orgBuildStart = plugin.buildStart as BuildStartHook | undefined
  const orgGenerateBundle = plugin.generateBundle as GenerateBundleHook | undefined

  plugin.buildStart = async function (inputOptions) {
    if (orgBuildStart) {
      await orgBuildStart.call(this, inputOptions)
    }

    if (serving) {
      prepareServe(api)
    }
  }

  plugin.generateBundle = async function (outputOptions, bundle, isWrite) {
    // find and set the correct file name for each asset
    api.options.assets
      .filter(asset => asset.fromInput)
      .forEach(asset => {
        const foundBundle = Object.values(bundle).find(({ name }) => name === asset.name) as
          | ViteBundleEntry
          | undefined

        if (!foundBundle) {
          return
        }

        // copy imported assets from vite into UI-Doc output
        if (foundBundle.viteMetadata?.importedAssets) {
          foundBundle.viteMetadata.importedAssets.forEach((importedAsset: string) => {
            api.addAssetFromInput(importedAsset)
          })
        }

        if (asset.type === 'script') {
          if (foundBundle.fileName) {
            asset.fileName = foundBundle.fileName
          }

          // copy and register imported css files to ui-doc
          if (foundBundle.viteMetadata?.importedCss) {
            foundBundle.viteMetadata.importedCss.forEach((imported: string) => {
              api.addAssetFromInput(imported)
              api.uidocAsset(imported, asset.context, { type: 'style' })
            })
          }

          return
        }

        if (
          asset.type === 'style'
          && foundBundle.viteMetadata?.importedCss
          && foundBundle.viteMetadata.importedCss.size > 0
        ) {
          asset.fileName = foundBundle.viteMetadata.importedCss.values().next().value
        }
      })

    if (orgGenerateBundle) {
      await orgGenerateBundle.call(this, outputOptions, bundle, isWrite)
    }
  }

  plugin.configureServer = async function (server: ViteDevServer) {
    const uidoc = api.uidoc
    const uriPrefix = api.options.prefix.uri
    const assets = api.options.assets ?? []
    const staticAssets = api.options.staticAssets ?? undefined

    if (!uriPrefix) {
      throw new Error(
        'UI-Doc base url is not available. Please don\'t set "outputBaseUri" to "." in dev mode.',
      )
    }

    const regexIndex = new RegExp(`^/${uriPrefix}?$`)
    const regexPage = new RegExp(`^/${uriPrefix}([a-z0-9_\\-]+).html$`)
    const regexExample = new RegExp(`^/${uriPrefix}examples/([a-z0-9_\\-]+).html$`)
    const regexAsset = new RegExp(`^/${uriPrefix}([a-z0-9\\._\\-]+)$`)

    server.middlewares.use((req, res, next) => {
      const originalUrl = req.originalUrl ?? ''

      // only handle requests that start with the path prefix
      if (!originalUrl.startsWith(`/${uriPrefix}`)) {
        return next()
      }

      const writeContent = (content: string | null) => {
        if (content) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.write(content)
        } else {
          res.statusCode = 404
        }
        res.end()
      }

      if (originalUrl.match(regexIndex)) {
        writeContent(uidoc.page('index'))
        return
      }

      const pageMatch = originalUrl.match(regexPage)

      if (pageMatch) {
        writeContent(uidoc.page(pageMatch[1]))
        return
      }

      const exampleMatch = originalUrl.match(regexExample)

      if (exampleMatch) {
        writeContent(uidoc.example(exampleMatch[1]))
        return
      }

      if (originalUrl.match(regexAsset)) {
        const assetName = originalUrl.replace(`/${uriPrefix}`, '')
        const asset = assets.find(entry => entry.name === assetName)

        if (asset) {
          res.write(asset.source)
          res.end()
          return
        }
      }

      const fileSystem = api.fileSystem

      if (!staticAssets || !fileSystem) {
        return next()
      }

      const assetName = originalUrl.replace(`/${uriPrefix}`, '').split('?')[0]
      const assetFile = `${staticAssets}/${assetName}`

      fileSystem
        .fileExists(assetFile)
        .then(exists => {
          if (exists) {
            req.url = `/@fs${path.resolve(assetFile)}`
          }
        })
        .catch(error => {
          server.config.logger.error(`UI-Doc: Error checking asset file: ${error}`)
        })
        .finally(() => {
          next()
        })
    })

    server.httpServer?.once('listening', () => {
      setTimeout(() => {
        server.config.logger.info(
          `\n  ${pc.green(`${pc.bold('UI-Doc')} v${version}`)} under /${pc.gray(uriPrefix)} \n`,
        )
        if (Array.isArray(server.resolvedUrls?.local)) {
          server.resolvedUrls.local.forEach(url => {
            server.config.logger.info(
              `  ${pc.green('➜')}  ${pc.bold('Local')}: ${pc.cyan(`${url}${uriPrefix}`)}`,
            )
          })
        }
      }, SERVER_READY_LOG_DELAY_MS)

      uidoc.on('context-entry', () => {
        server.ws.send({ type: 'full-reload', path: `/${uriPrefix}*` })
      })
    })
  }

  return plugin
}
