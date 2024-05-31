import styleguide from '@styleguide/rollup'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcssSimpleVars from 'postcss-simple-vars'
import postcss from 'rollup-plugin-postcss'

export default [
  {
    input: {
      app: 'css/app.css',
    },
    output: {
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
      styleguide({
        source: ['css/**/*.css'],
        styleAsset: false,
      }),
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
