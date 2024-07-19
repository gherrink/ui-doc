import { readFileSync } from 'node:fs'

// eslint-disable-next-line import/no-relative-packages
import { configPostcssWeb, configTs, configTsWeb } from '../../shared/rollup.config.mjs'

export default [
  configTs({
    pkg: JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')),
  }),
  configPostcssWeb({
    input: { 'ui-doc': 'styles/index.css' },
  }),
  configTsWeb({
    input: { 'ui-doc': 'scripts/app.ts' },
  }),
]
