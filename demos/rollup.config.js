import sizes from '@atomico/rollup-plugin-sizes'
import styleguide from '@styleguide/rollup'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcss from 'rollup-plugin-postcss'

export default {
  external: [],
  input: 'css/index.css',
  output: {
    file: 'dist/rollup/index.css',
  },
  plugins: [
    sizes(),
    postcss({
      extract: true,
      plugins: [
        postcssImport(),
        autoprefixer(),
        postcssNested(),
      ],
    }),
    styleguide(),
  ],
}
