import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import styleguide from '@styleguide/rollup'
import autoprefixer from 'autoprefixer'
import postcssExtend from 'postcss-extend'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcss from 'rollup-plugin-postcss'
import typescript from 'rollup-plugin-typescript2'

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
        plugins: [postcssImport(), postcssNested(), autoprefixer()],
        sourceMap: true,
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
      dir: 'dist/rollup',
      format: 'es',
      name: 'styleguide',
      sourcemap: true,
    },
    plugins: [
      postcss({
        extract: 'styleguide.css',
        minimize: true,
        plugins: [postcssImport(), postcssNested(), postcssExtend(), autoprefixer()],
        sourceMap: true,
      }),
    ],
  },
  {
    external: [],
    input: { styleguide: '../packages/html-renderer/scripts/styleguide.ts' },
    output: [
      {
        dir: 'dist/rollup',
        format: 'umd',
        sourcemap: false,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: '../node_modules/**',
      }),
      typescript({
        tsconfig: '../tsconfig.web.json',
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          },
        },
      }),
    ],
  },
]
