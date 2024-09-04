/* eslint-disable sort-keys */
import path from 'node:path'

import createRollupPlugin, {
  type Api as RollupPluginApi,
  type Options as RollupPluginOptions,
  PLUGIN_NAME as ROLLUP_PLUGIN_NAME,
} from '@ui-doc/rollup'
import pc from 'picocolors'
import type { RollupOptions } from 'rollup'
import type { Plugin, UserConfig, ViteDevServer } from 'vite'

import { version } from '../package.json'

const PLUGIN_NAME = 'ui-doc'

export interface Options extends RollupPluginOptions {}

export interface Api extends RollupPluginApi {
  version: string
}

function resolveOptions(options: Options): Options {
  options.outputDir = options.outputDir ?? 'ui-doc'

  return options
}

function normalizeRollupInput(input: RollupOptions['input']): string[] {
  if (!input) {
    return []
  }

  if (typeof input === 'string') {
    return [input]
  }

  if (Array.isArray(input)) {
    return input
  }

  return Object.values(input)
}

function prepareServe(plugin: Plugin<Api>, config: UserConfig) {
  if (plugin.api?.options.prefix.uri) {
    // replace resolveUrl to make sure that all urls (pages and assets) are generated correctly for vite server
    plugin.api?.uidoc.replaceGenerate('resolveUrl', (uri, type) => {
      return type === 'asset-example' || (type === 'asset' && uri.startsWith('@'))
        ? `/${uri}`
        : `/${plugin.api?.options.prefix.uri}${uri}`
    })
  }

  // include vite client in ui-kit assets
  plugin.api?.uidoc.addAsset({
    type: 'script',
    src: '@vite/client',
    attrs: { type: 'module' },
  })

  // use user inputs as example assets
  normalizeRollupInput(config.build?.rollupOptions?.input).forEach(input => {
    plugin.api?.uidocAsset(input, 'example')
  })
}

export default async function uidocPlugin(rawOptions: Options): Promise<Plugin<Api>> {
  const options = resolveOptions(rawOptions)
  const plugin = (await createRollupPlugin(options)) as Plugin<Api>

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

  plugin.config = (config, { command }) => {
    if (command === 'serve') {
      prepareServe(plugin, config)
    }
  }

  plugin.configureServer = async (server: ViteDevServer) => {
    const uidoc = plugin.api?.uidoc
    const uriPrefix = plugin.api?.options.prefix.uri
    const assets = plugin.api?.options.assets ?? []
    const staticAssets = plugin.api?.options.staticAssets ?? undefined

    if (!uidoc || !uriPrefix) {
      throw new Error('UI-Doc API is not available')
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
          res.write(asset.code)
          res.end()
          return
        }
      }

      const fileSystem = plugin.api?.fileSystem

      if (!staticAssets || !fileSystem) {
        return next()
      }

      const assetName = req.originalUrl.replace(`/${uriPrefix}`, '')
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
