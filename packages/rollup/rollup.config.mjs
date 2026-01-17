import { readFileSync } from 'node:fs'

import { configTs } from '../../shared/rollup.config.mjs'

export default configTs({
  pkg: JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')),
})
