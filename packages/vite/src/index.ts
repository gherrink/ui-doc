/* eslint-disable sort-keys */
import createRollupPlugin, {
  type Api as RollupApi,
  type Options as RollupOptions,
  PLUGIN_NAME as ROLLUP_PLUGIN_NAME,
} from '@styleguide/rollup'
import type { Plugin } from 'vite'

import { version } from '../package.json'

const PLUGIN_NAME = 'styleguide'

export interface Options extends RollupOptions {}

export interface Api extends RollupApi {
  version: string
}

function resolveOptions(options: Options): Options {
  options.outputDir = options.outputDir ?? 'styleguide'

  return options
}

export default function styleguidePlugin(rawOptions: Options): Plugin<Api> {
  const options = resolveOptions(rawOptions)
  const plugin = createRollupPlugin(options)

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

  return plugin as Plugin<Api>
}
