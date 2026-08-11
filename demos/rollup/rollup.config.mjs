import path from 'node:path'

import uidoc from '@ui-doc/rollup'

import { cssAssets } from '../../shared/rollup-plugin-css.mjs'

const sharedDir = path.resolve(import.meta.dirname, '../shared')
const distDir = path.resolve(import.meta.dirname, '../dist/rollup')

export default {
  input: {
    app: path.join(import.meta.dirname, 'app.js'),
  },
  output: {
    dir: distDir,
    format: 'es',
    sourcemap: true,
    plugins: [
      cssAssets({
        entries: { app: path.join(sharedDir, 'css/index.css') },
      }),
    ],
  },
  plugins: [
    uidoc({
      output: {
        dir: 'ui-doc',
        baseUri: '.',
      },
      settings: {
        generate: {
          logo: () => 'Rollup',
        },
        texts: {
          title: 'Rollup Test',
        },
      },
      source: [path.join(sharedDir, 'css/**/*.css')],
      assets: {
        static: path.join(sharedDir, 'ui-doc/assets'),
        example: [
          {
            name: 'app.css',
            file: path.join(distDir, 'app.css'),
          },
        ],
      },
    }),
  ],
}
