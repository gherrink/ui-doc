import { builtinModules } from 'node:module'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcss from 'rollup-plugin-postcss'

/**
 * Create a base rollup config
 * @param {object} options Configuration options
 * @param {Record<string,any>} options.pkg Imported package.json
 * @param {string[]} [options.external] External dependencies
 * @returns {import('rollup').RollupOptions} Rollup configuration
 */
export function configTs({ pkg, external = [] }) {
  return {
    input: 'src/index.ts',
    external: Object.keys(pkg.dependencies || {})
      .concat(Object.keys(pkg.peerDependencies || {}))
      .concat(builtinModules)
      .concat(external),
    onwarn: warning => {
      throw Object.assign(new Error(warning.message), warning)
    },
    strictDeprecations: true,
    output: [
      {
        format: 'cjs',
        file: pkg.main,
        exports: 'named',
        footer: 'if (exports.default) { module.exports = Object.assign(exports.default, exports); }',
        sourcemap: true,
      },
      {
        format: 'es',
        file: pkg.module,
        sourcemap: true,
      },
    ],
    plugins: [
      json(),
      resolve(),
      commonjs(),
      typescript({ sourceMap: true, declarationDir: '.', declaration: true }),
    ],
  }
}

/**
 * Create a base rollup config for web scripts
 * @param {object} options Configuration options
 * @param {Record<string,string>} options.input Input files
 * @param {string[]} [options.external] External dependencies
 * @returns {import('rollup').RollupOptions} Rollup configuration
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
    // The browser target is set by tsconfig.web.json (target: ES6). There is no
    // babel step: the repo-root .babelrc was never loaded, because babel's
    // config search does not walk above `root`, which defaults to rollup's cwd
    // (the package dir). It ran with zero presets - a parse-and-reprint no-op.
    plugins: [
      typescript({
        declaration: true,
        outDir: './dist/assets',
        tsconfig: './tsconfig.web.json',
      }),
    ],
  }
}

/**
 * Create a base rollup config for web styles
 * @param {object} options Configuration options
 * @param {Record<string,string>} options.input Input files
 * @returns {import('rollup').RollupOptions} Rollup configuration
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
        plugins: [postcssImport(), postcssNested(), autoprefixer()],
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
