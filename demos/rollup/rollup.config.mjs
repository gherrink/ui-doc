import path from 'node:path'

import uidoc from '@ui-doc/rollup'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcss from 'rollup-plugin-postcss'

const sharedDir = path.resolve(import.meta.dirname, '../shared')
const distDir = path.resolve(import.meta.dirname, '../dist/rollup')

export default {
  input: {
    app: path.join(sharedDir, 'css/index.css'),
  },
  output: {
    dir: distDir,
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    postcss({
      autoModules: true,
      extract: true,
      minimize: true,
      plugins: [postcssImport(), postcssNested(), autoprefixer()],
      sourceMap: true,
    }),
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
