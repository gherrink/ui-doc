/* eslint-disable sort-keys */
import path from 'node:path'

import createRollupPlugin, {
  type Api as RollupPluginApi,
  type Options as RollupPluginOptions,
  PLUGIN_NAME as ROLLUP_PLUGIN_NAME,
} from '@ui-doc/rollup'
import pc from 'picocolors'
import type { Plugin, ViteDevServer } from 'vite'

import { version } from '../package.json'

const PLUGIN_NAME = 'ui-doc'

export interface Options extends RollupPluginOptions {}

export interface Api extends RollupPluginApi {
  version: string
}

function resolveOptions(options: Options): Options {
  options.output = options.output ?? {}
  options.output.dir = options.output.dir ?? 'ui-doc'

  return options
}

function prepareServe(plugin: Plugin<Api>) {
  if (plugin.api?.options.prefix.uri) {
    // replace resolveUrl to make sure that all urls (pages and assets) are generated correctly for vite server
    plugin.api?.uidoc.replaceGenerate('resolve', (uri, type) => {
      // don't add prefix if asset is from vite
      return ['asset', 'asset-example'].includes(type) &&
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (plugin.api?.isAssetFromInput(uri) || uri.startsWith('@'))
        ? `/${uri}`
        : `/${plugin.api?.options.prefix.uri}${uri}`
    })
  }

  // register all assets to ui-doc
  plugin.api?.options.assets.forEach(({ fileName, context, attrs, fromInput = false }) => {
    plugin.api?.uidocAsset(fileName, context, { attrs, fromInput })
  })

  // add vite client script to ui-doc
  plugin.api?.uidocAsset('@vite/client', 'page', { attrs: { type: 'module' }, type: 'script' })
}

export default async function uidocPlugin(rawOptions: Options): Promise<Plugin<Api>> {
  const options = resolveOptions(rawOptions)
  const plugin = (await createRollupPlugin(options)) as Plugin<Api>
  let serving = false

  plugin.name = PLUGIN_NAME
  plugin.version = version
  if (!plugin.api) {
    throw new Error('UI-Doc rollup plugin API is not available')
  }
  plugin.api.version = version
  plugin.onLog = (_level, log) => {
    // hide rollup output logs
    if (log.plugin === ROLLUP_PLUGIN_NAME && log.pluginCode === 'OUTPUT') {
      return false
    }
  }

  plugin.config = (_config, { command }) => {
    serving = command === 'serve'
  }

  const orgBuildStart = plugin.buildStart as Function | undefined
  const orgGenerateBundle = plugin.generateBundle as Function | undefined

  plugin.buildStart = async function (inputOptions) {
    if (orgBuildStart) {
      await orgBuildStart.call(this, inputOptions)
    }

    if (serving) {
      prepareServe(plugin)
    }
  }

  plugin.generateBundle = async function (outputOptions, bundle, isWrite) {
    // find and set the correct file name for each asset
    plugin.api?.options.assets
      .filter(asset => asset.fromInput)
      .forEach(asset => {
        const foundBundle = Object.values(bundle).find(({ name }) => name === asset.name) as
          | Record<string, any>
          | undefined

        if (!foundBundle) {
          return
        }

        // copy imported assets from vite into UI-Doc output
        if (foundBundle?.viteMetadata?.importedAssets) {
          foundBundle.viteMetadata.importedAssets.forEach((importedAsset: string) => {
            plugin.api?.addAssetFromInput(importedAsset)
          })
        }

        if (asset.type === 'script') {
          asset.fileName = foundBundle.fileName

          // copy and register imported css files to ui-doc
          if (foundBundle?.viteMetadata?.importedCss) {
            foundBundle.viteMetadata.importedCss.forEach((imported: string) => {
              plugin.api?.addAssetFromInput(imported)
              plugin.api?.uidocAsset(imported, asset.context, { type: 'style' })
            })
          }

          return
        }

        if (
          asset.type === 'style' &&
          foundBundle?.viteMetadata?.importedCss &&
          foundBundle.viteMetadata.importedCss.size > 0
        ) {
          asset.fileName = foundBundle.viteMetadata.importedCss.values().next().value
        }
      })

    if (orgGenerateBundle) {
      await orgGenerateBundle.call(this, outputOptions, bundle, isWrite)
    }
  }

  plugin.configureServer = async function (server: ViteDevServer) {
    const uidoc = plugin.api?.uidoc
    const uriPrefix = plugin.api?.options.prefix.uri
    const assets = plugin.api?.options.assets ?? []
    const staticAssets = plugin.api?.options.staticAssets ?? undefined

    if (!uidoc) {
      throw new Error('UI-Doc API is not available')
    }

    if (!uriPrefix) {
      throw new Error(
        'UI-Doc base url is not available. Please don\'t set "outputBaseUri" to "." in dev mode.',
      )
    }

    const regexPage = new RegExp(`^/${uriPrefix}([a-z0-9_\\-]+).html$`)
    const regexExample = new RegExp(`^/${uriPrefix}examples/([a-z0-9_\\-]+).html$`)
    const regexAsset = new RegExp(`^/${uriPrefix}([a-z0-9\\._\\-]+)$`)

    server.middlewares.use((req, res, next) => {
      // only handle requests that start with the path prefix
      if (!req.originalUrl?.startsWith(`/${uriPrefix}`)) {
        return next()
      }

      if (req.originalUrl.match(new RegExp(`^/${uriPrefix}?$`))) {
        res.write(uidoc.page('index'))
        res.end()
        return
      }

      const writeContent = (content: string | null) => {
        if (content) {
          res.write(content)
        } else {
          res.statusCode = 404
        }
        res.end()
      }
      const pageMatch = req.originalUrl.match(regexPage)

      if (pageMatch) {
        writeContent(uidoc.page(pageMatch[1]))
        return
      }

      const exampleMatch = req.originalUrl.match(regexExample)

      if (exampleMatch) {
        writeContent(uidoc.example(exampleMatch[1]))
        return
      }

      if (req.originalUrl.match(regexAsset)) {
        const assetName = req.originalUrl.replace(`/${uriPrefix}`, '')
        const asset = assets.find(entry => entry.name === assetName)

        if (asset) {
          res.write(asset.source)
          res.end()
          return
        }
      }

      const fileSystem = plugin.api?.fileSystem

      if (!staticAssets || !fileSystem) {
        return next()
      }

      const assetName = req.originalUrl.replace(`/${uriPrefix}`, '').split('?')[0]
      const assetFile = `${staticAssets}/${assetName}`

      fileSystem
        .fileExists(assetFile)
        .then(exists => {
          if (exists) {
            req.url = `/@fs${path.resolve(assetFile)}`
          }
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
      }, 300)

      uidoc.on('context-entry', () => {
        server.ws.send({ type: 'full-reload', path: `/${uriPrefix}*` })
      })
    })
  }

  return plugin as Plugin<Api>
}
