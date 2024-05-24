import sizes from '@atomico/rollup-plugin-sizes'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcssSimpleVars from 'postcss-simple-vars'
import autoExternal from 'rollup-plugin-auto-external'
import postcss from 'rollup-plugin-postcss'
import sourcemaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default [
  // code generation
  {
    external: [],
    input: 'src/index.ts',
    output: [
      {
        name: pkg.name,
        file: pkg.umd,
        format: 'umd',
        sourcemap: true,
      },
      {
        name: pkg.name,
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'auto',
      },
      {
        name: pkg.name,
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      autoExternal({
        packagePath: './package.json',
      }),
      sourcemaps(),
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: '../../node_modules/**',
      }),
      sizes(),
      typescript({
        tsconfig: '../../tsconfig.json',
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            paths: {
              '@styleguide/*': ['packages/*/src'],
            },
          },
          include: null,
        },
      }),
    ],
  },
  // style generation
  {
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
          postcssNested(),
          postcssSimpleVars(),
          autoprefixer(),
        ],
      }),
    ],
  },
]
