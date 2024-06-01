import sizes from '@atomico/rollup-plugin-sizes'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import autoprefixer from 'autoprefixer'
import postcssExtend from 'postcss-extend'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
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
        file: pkg.umd,
        format: 'umd',
        name: pkg.name,
        sourcemap: true,
      },
      {
        exports: 'auto',
        file: pkg.main,
        format: 'cjs',
        name: pkg.name,
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'es',
        name: pkg.name,
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
    input: { styleguide: 'styles/index.css' },
    output: [
      {
        dir: 'dist',
        sourcemap: true,
      },
    ],
    plugins: [
      sizes(),
      postcss({
        extract: true,
        plugins: [postcssImport(), postcssNested(), postcssExtend(), autoprefixer()],
      }),
      {
        generateBundle: (option, bundle) => {
          // remove empty styleguide.js file
          delete bundle['styleguide.js']
        },
      },
    ],
  },
  // script generation
  {
    external: [],
    input: { styleguide: 'scripts/styleguide.ts' },
    output: [
      {
        dir: 'dist',
        format: 'umd',
        sourcemap: false,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: '../../node_modules/**',
      }),
      sizes(),
      typescript({
        tsconfig: '../../tsconfig.web.json',
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          },
        },
      }),
    ],
  },
]
