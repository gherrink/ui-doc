import styleguide from '@styleguide/rollup'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcssSimpleVars from 'postcss-simple-vars'
import postcss from 'rollup-plugin-postcss'

export default [
  {
    input: 'css/index.css',
    output: {
      name: 'app',
      dir: 'dist/rollup',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      postcss({
        extract: 'app.css',
        minimize: true,
        sourceMap: true,
        plugins: [
          postcssImport(),
          postcssNested(),
          autoprefixer(),
        ],
      }),
      styleguide(),
    ],
  },
  {
    input: '../packages/html-renderer/styles/index.css',
    output: {
      name: 'styleguide',
      dir: 'dist/rollup',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      postcss({
        extract: 'styleguide.css',
        minimize: true,
        sourceMap: true,
        plugins: [
          postcssImport(),
          postcssNested(),
          postcssSimpleVars(),
          autoprefixer(),
        ],
      }),
    ],
  },
]
