import uidoc from '@ui-doc/rollup'
import autoprefixer from 'autoprefixer'
import postcssExtend from 'postcss-extend'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcss from 'rollup-plugin-postcss'

export default [
  {
    input: {
      app: 'css/index.css',
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
        plugins: [postcssImport(), postcssNested(), postcssExtend(), autoprefixer()],
        sourceMap: true,
      }),
      uidoc({
        settings: {
          generate: {
            logo: () => 'Rollup',
          },
          texts: {
            title: 'Rollup Test',
          },
        },
        source: ['css/**/*.css'],
        staticAssets: './assets',
      }),
    ],
  },
]
