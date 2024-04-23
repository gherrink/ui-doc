import sizes from '@atomico/rollup-plugin-sizes'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import copy from 'rollup-plugin-copy'
import postcss from 'rollup-plugin-postcss'

export default {
  external: [],
  input: 'styles/index.css',
  output: [
    {
      name: 'styleguide',
      file: 'dist/styles/styleguide.css',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    sizes(),
    postcss({
      extract: true,
      plugins: [
        postcssImport(),
        autoprefixer(),
        postcssNested(),
        // require('postcss-custom-properties'),
      ],
    }),
    copy({
      flatten: false,
      targets: [
        { src: 'templates/**/*.html', dest: 'dist/templates' },
      ],
    }),
  ],
}
