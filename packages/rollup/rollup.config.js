import sizes from '@atomico/rollup-plugin-sizes'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import autoExternal from 'rollup-plugin-auto-external'
import sourcemaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default {
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
}
