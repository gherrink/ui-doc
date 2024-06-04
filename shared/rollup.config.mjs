/* eslint-disable sort-keys */

import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import { builtinModules } from 'module'
import postcssExtend from 'postcss-extend'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcss from 'rollup-plugin-postcss'

/**
 * Create a base rollup config
 * @param {Record<string,any>} pkg Imported package.json
 * @param {string[]} external Imported package.json
 * @returns {import('rollup').RollupOptions}
 */
export function configTs({ pkg, external = [] }) {
  return {
    input: 'src/index.ts',
    external: Object.keys(pkg.dependencies || {})
      .concat(Object.keys(pkg.peerDependencies || {}))
      .concat(builtinModules)
      .concat(external),
    onwarn: warning => {
      throw Object.assign(new Error(), warning)
    },
    strictDeprecations: true,
    output: [
      {
        format: 'cjs',
        file: pkg.main,
        exports: 'named',
        // footer: 'module.exports = Object.assign(exports.default, exports);',
        sourcemap: true,
      },
      {
        format: 'es',
        file: pkg.module,
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ sourceMap: true, declarationDir: '.', declaration: true }),
    ],
  }
}

/**
 * Create a base rollup config for web scripts
 * @param {Record<string,string>} input input files
 * @param {string[]} external Imported package.json
 * @returns {import('rollup').RollupOptions}
 */
export function configTsWeb({ external, input }) {
  return {
    input,
    external,
    output: [
      {
        dir: 'dist/assets',
        entryFileNames: '[name].cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        dir: 'dist/assets',
        entryFileNames: '[name].mjs',
        format: 'es',
        sourcemap: true,
      },
      {
        dir: 'dist/assets',
        entryFileNames: '[name].min.js',
        format: 'iife',
        name: 'version',
        plugins: [terser()],
        sourcemap: false,
      },
    ],
    plugins: [
      typescript({
        declaration: true,
        outDir: './dist/assets',
        tsconfig: './tsconfig.web.json',
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: '../../node_modules/**',
      }),
    ],
  }
}

/**
 * Create a base rollup config for web styles
 * @param {Record<string,string>} input input files
 * @returns {import('rollup').RollupOptions}
 */
export function configPostcssWeb({ input }) {
  return {
    input,
    output: [
      {
        dir: 'dist/assets',
        sourcemap: true,
      },
    ],
    plugins: [
      postcss({
        extract: true,
        sourceMap: true,
        plugins: [postcssImport(), postcssNested(), postcssExtend(), autoprefixer()],
      }),
      {
        async generateBundle(option, bundle) {
          const cssnanoInstance = cssnano({ preset: 'default' })

          await Promise.all(
            Object.keys(input).map(async key => {
              // remove empty js files generated from the inputs
              delete bundle[`${key}.js`]

              // minify css files
              if (bundle[`${key}.css`]) {
                const minified = await cssnanoInstance.process(bundle[`${key}.css`].source, {
                  from: undefined,
                })

                this.emitFile({
                  type: 'asset',
                  fileName: `${key}.min.css`,
                  source: minified.css,
                })
              }
            }),
          )
        },
      },
    ],
  }
}
