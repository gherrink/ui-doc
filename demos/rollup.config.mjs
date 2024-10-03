import path from 'node:path'

import uidoc from '@ui-doc/rollup'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcss from 'rollup-plugin-postcss'

export default [
  {
    input: {
      app: 'css/index-rollup.css',
    },
    output: {
      dir: 'dist/rollup',
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
    ],
  },
  {
    input: {
      'ui-doc-custom': path.resolve('ui-doc/rollup.css'),
    },
    output: {
      dir: 'dist/rollup',
      format: 'es',
      sourcemap: true,
      assetFileNames: '[name]-[hash].[ext]',
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
        source: ['css/**/*.css'],
        assets: {
          static: './ui-doc/assets',
          page: [
            {
              name: 'ui-doc-custom.css',
              input: true,
            },
          ],
          example: [
            // {
            //   name: 'app.css',
            //   file: './dist/rollup/app.css',
            // },
          ],
        },
      }),
    ],
  },
]
