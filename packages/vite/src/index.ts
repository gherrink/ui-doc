/* eslint-disable sort-keys */
import createRollupPlugin, {
  type Api as RollupPluginApi,
  type Options as RollupPluginOptions,
  PLUGIN_NAME as ROLLUP_PLUGIN_NAME,
} from '@styleguide/rollup'
import pc from 'picocolors'
import type { RollupOptions } from 'rollup'
import type { Plugin, UserConfig, ViteDevServer } from 'vite'

import { version } from '../package.json'

const PLUGIN_NAME = 'styleguide'

export interface Options extends RollupPluginOptions {}

export interface Api extends RollupPluginApi {
  version: string
}

function resolveOptions(options: Options): Options {
  options.outputDir = options.outputDir ?? 'styleguide'

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

function prepareServe(plugin: Plugin<Api>, options: Options, config: UserConfig) {
  if (options.outputDir === undefined) {
    return
  }

  const pathPrefix = `/${options.outputDir.endsWith('/') ? options.outputDir : `${options.outputDir}/`}`

  // replace resolveUrl to make sure that all assets are resolved correctly for vite server
  plugin.api?.styleguide.replaceGenerate('resolveUrl', (uri, type) => {
    if (type === 'asset' || type === 'asset-example') {
      return `/${uri}`
    }

    return `${pathPrefix}${uri}`
  })

  // include vite client in ui-kit assets
  plugin.api?.styleguide.addAsset({
    type: 'script',
    src: '@vite/client',
    attrs: { type: 'module' },
  })

  // use user inputs as example assets
  normalizeRollupInput(config.build?.rollupOptions?.input).forEach(input => {
    plugin.api?.styleguideAsset(input, 'example')
  })
}

export default async function styleguidePlugin(rawOptions: Options): Promise<Plugin<Api>> {
  const options = resolveOptions(rawOptions)
  const plugin = (await createRollupPlugin(options)) as Plugin<Api>

  plugin.name = PLUGIN_NAME
  plugin.version = version
  if (!plugin.api) {
    throw new Error('Styleguide rollup plugin API is not available')
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
      prepareServe(plugin, options, config)
    }
  }

  plugin.configureServer = async (server: ViteDevServer) => {
    const styleguide = plugin.api?.styleguide
    const pathPrefix = plugin.api?.options.pathPrefix
    const assets = plugin.api?.options.assets ?? []

    if (!styleguide || !pathPrefix) {
      throw new Error('Styleguide API is not available')
    }

    const regexPage = new RegExp(`^/${pathPrefix}([a-z0-9_\\-]+).html$`)
    const regexExample = new RegExp(`^/${pathPrefix}examples/([a-z0-9_\\-]+).html$`)
    const regexAsset = new RegExp(`^/${pathPrefix}([a-z0-9\\._\\-]+)$`)

    server.middlewares.use((req, res, next) => {
      if (!req.originalUrl) {
        return
      }

      if (req.originalUrl.match(new RegExp(`^/${pathPrefix}?$`))) {
        res.write(styleguide.page('index'))
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
        writeContent(styleguide.page(pageMatch[1]))
        return
      }

      const exampleMatch = req.originalUrl.match(regexExample)

      if (exampleMatch) {
        writeContent(styleguide.example(exampleMatch[1]))
        return
      }

      if (req.originalUrl.match(regexAsset)) {
        const assetName = req.originalUrl.substring(1)
        const asset = assets.find(entry => entry.name === assetName)

        if (asset) {
          res.write(asset.code)
          res.end()
          return
        }
      }

      next()
    })

    const reload = () => {
      server.ws.send({ type: 'full-reload', path: `/${pathPrefix}*` })
    }

    styleguide.on('context-entry-deleted', reload)
    styleguide.on('context-entry-saved', reload)

    server.httpServer?.once('listening', () => {
      setTimeout(() => {
        server.config.logger.info(
          `\n  ${pc.green(`${pc.bold('Styleguide')} v${version}`)}  under /${pc.gray(pathPrefix)} \n`,
        )
        if (Array.isArray(server.resolvedUrls?.local)) {
          server.resolvedUrls.local.forEach(url => {
            server.config.logger.info(
              `  ${pc.green('➜')}  ${pc.bold('Local')}: ${pc.cyan(`${url}${pathPrefix}`)}`,
            )
          })
        }
      }, 300)
    })
  }

  return plugin as Plugin<Api>
}
