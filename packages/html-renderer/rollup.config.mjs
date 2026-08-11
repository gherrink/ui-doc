import { readFileSync } from 'node:fs'

import { configTs, configTsWeb } from '../../shared/rollup.config.mjs'

export default [
  configTs({
    pkg: JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')),
  }),
  // Scripts and styles share one config: the stylesheet is compiled outside
  // Rollup's module graph, so it needs a config with a real JS entry to hang
  // off rather than one of its own.
  configTsWeb({
    input: { 'ui-doc': 'scripts/app.ts' },
    styles: { 'ui-doc': 'styles/index.css' },
  }),
]
