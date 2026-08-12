import path from 'node:path'

import type { Api as RollupPluginApi, Options as RollupPluginOptions } from '@ui-doc/rollup'
import createRollupPlugin, { PLUGIN_NAME as ROLLUP_PLUGIN_NAME } from '@ui-doc/rollup'
import pc from 'picocolors'
import type { ChunkMetadata, Plugin, ViteDevServer } from 'vite'

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
 * Narrows a hook to its callable form, dropping the `{ handler }` object variant.
 */
type HookFn<K extends keyof Plugin<Api>> = Extract<Plugin<Api>[K], (...args: never[]) => unknown>

/**
 * The bundle `generateBundle` receives. Derived from the plugin type rather than imported
 * from a bundler package, so it follows whichever bundler the installed Vite uses - Rollup
 * up to Vite 7, Rolldown from Vite 8.
 */
type OutputBundle = Parameters<HookFn<'generateBundle'>>[1]

/**
 * Reads Vite's per-entry record of the assets and stylesheets an entry pulled in.
 *
 * Vite declares this by augmenting the bundler's own types: on `RenderedChunk` in Vite 6/7
 * (inherited by `OutputChunk`) and additionally on `OutputChunk`/`OutputAsset` in Vite 8.
 * Reading it structurally rather than narrowing to `type === 'chunk'` keeps both shapes
 * working, and keeps assets - which Vite 8 also annotates - in scope.
 */
function viteMetadataOf(entry: OutputBundle[string]): Partial<ChunkMetadata> | undefined {
  return (entry as { viteMetadata?: ChunkMetadata }).viteMetadata
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

function prepareServe(api: Api): void {
  if (api.options.prefix.uri) {
    // replace resolveUrl to make sure that all urls (pages and assets) are generated correctly
    // for vite server
    api.uidoc.replaceGenerate('resolve', (uri: string, type: string) => {
      // don't add prefix if asset is from vite
      return ['asset', 'asset-example'].includes(type) &&
        (api.isAssetFromInput(uri) || uri.startsWith('@'))
        ? `/${uri}`
        : `/${api.options.prefix.uri}${uri}`
    })
  }

  // register all assets to ui-doc
  api.options.assets.forEach(({ fileName, context, attrs, type, fromInput = false }) => {
    api.uidocAsset(fileName, context, { attrs, fromInput, type })
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

  let viteServer: ViteDevServer | undefined

  plugin.onLog = (_level, log) => {
    // hide rollup output logs
    if (log.plugin === ROLLUP_PLUGIN_NAME && log.pluginCode === 'OUTPUT') {
      return false
    }
  }

  plugin.config = (_config, { command }) => {
    serving = command === 'serve'
  }

  // Captured before reassignment. Kept as the plugin's own hook types so `.call(this, ...)`
  // stays an exact match; the `typeof` guards also skip the `{ handler }` object-hook form,
  // which the wrapped plugin does not use but a cast would have silently mistyped.
  const orgBuildStart = plugin.buildStart
  const orgGenerateBundle = plugin.generateBundle
  const orgWatchChange = plugin.watchChange

  plugin.buildStart = async function (inputOptions) {
    if (typeof orgBuildStart === 'function') {
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
        const foundBundle = Object.values(bundle).find(({ name }) => name === asset.name)

        if (!foundBundle) {
          return
        }

        const metadata = viteMetadataOf(foundBundle)

        // copy imported assets from vite into UI-Doc output
        metadata?.importedAssets?.forEach((importedAsset: string) => {
          api.addAssetFromInput(importedAsset)
        })

        if (asset.type === 'script') {
          if (foundBundle.fileName !== '') {
            asset.fileName = foundBundle.fileName
          }

          // copy and register imported css files to ui-doc
          metadata?.importedCss?.forEach((imported: string) => {
            api.addAssetFromInput(imported)
            api.uidocAsset(imported, asset.context, { type: 'style' })
          })

          return
        }

        if (asset.type === 'style' && metadata?.importedCss && metadata.importedCss.size > 0) {
          const firstCss = metadata.importedCss.values().next().value as string
          asset.fileName = firstCss
        }
      })

    if (typeof orgGenerateBundle === 'function') {
      await orgGenerateBundle.call(this, outputOptions, bundle, isWrite)
    }
  }

  plugin.watchChange = async function (id, change) {
    if (typeof orgWatchChange === 'function') {
      await orgWatchChange.call(this, id, change)
    }

    // Trigger reload when template files change in dev mode
    const templatePath = api.options.templatePath
    if (
      serving &&
      viteServer !== undefined &&
      templatePath !== undefined &&
      id.startsWith(templatePath) &&
      (change.event === 'update' || change.event === 'create')
    ) {
      viteServer.hot.send({ type: 'full-reload', path: '*' })
    }
  }

  plugin.configureServer = async function (server: ViteDevServer) {
    viteServer = server
    const uidoc = api.uidoc
    const uriPrefix = api.options.prefix.uri
    const assets = api.options.assets ?? []
    const copyAssets = api.options.copyAssets ?? []
    const staticAssets = api.options.staticAssets ?? undefined

    if (!uriPrefix) {
      throw new Error(
        'UI-Doc base url is not available. Please don\'t set "outputBaseUri" to "." in dev mode.',
      )
    }

    const regexIndex = new RegExp(`^/${uriPrefix}?$`)
    const regexPage = new RegExp(`^/${uriPrefix}([a-z0-9_\\-]+).html$`)
    const regexExample = new RegExp(`^/${uriPrefix}examples/([a-z0-9_\\-]+).html$`)
    const regexShowcase = new RegExp(`^/${uriPrefix}showcases/([a-z0-9_\\-]+).html$`)
    const regexAsset = new RegExp(`^/${uriPrefix}([a-z0-9\\._\\-]+)$`)

    server.middlewares.use((req, res, next) => {
      const originalUrl = req.originalUrl ?? ''

      // only handle requests that start with the path prefix
      if (!originalUrl.startsWith(`/${uriPrefix}`)) {
        return next()
      }

      const writeContent = (content: string | null): void => {
        if (content !== null) {
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

      const showcaseMatch = originalUrl.match(regexShowcase)

      if (showcaseMatch) {
        writeContent(uidoc.showcase(showcaseMatch[1]))
        return
      }

      if (originalUrl.match(regexAsset)) {
        const assetName = originalUrl.replace(`/${uriPrefix}`, '')
        const asset = assets.find(entry => entry.name === assetName)

        if (asset) {
          // For file-based assets, redirect to Vite's file server
          if (asset.file !== undefined && asset.file !== '') {
            req.url = `/@fs${asset.file}`
            return next()
          }
          res.write(asset.source)
          res.end()
          return
        }
      }

      const fileSystem = api.fileSystem

      // Check if request matches a copy asset output path
      const requestPath = originalUrl.replace(`/${uriPrefix}`, '').split('?')[0]
      const copyAsset = copyAssets.find(entry => entry.outputPath === requestPath)

      if (copyAsset) {
        // Redirect to source file via Vite's /@fs prefix
        req.url = `/@fs${copyAsset.sourcePath}`
        return next()
      }

      if (staticAssets === undefined || fileSystem === undefined) {
        return next()
      }

      const assetName = originalUrl.replace(`/${uriPrefix}`, '').split('?')[0]
      const assetFile = `${staticAssets}/${assetName}`

      fileSystem
        .fileExists(assetFile)
        .then((exists: boolean) => {
          if (exists) {
            req.url = `/@fs${path.resolve(assetFile)}`
          }
        })
        .catch((error: unknown) => {
          server.config.logger.error(`UI-Doc: Error checking asset file: ${String(error)}`)
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
        server.hot.send({ type: 'full-reload', path: `/${uriPrefix}*` })
      })
    })
  }

  return plugin
}
