import { readFileSync } from 'node:fs'

// eslint-disable-next-line import/no-relative-packages
import { configTs } from '../../shared/rollup.config.mjs'

export default configTs({
  external: ['node:fs/promises', 'node:path'],
  pkg: JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')),
})
