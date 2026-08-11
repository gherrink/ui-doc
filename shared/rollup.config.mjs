import { builtinModules } from 'node:module'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { cssAssets } from './rollup-plugin-css.mjs'

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
      // declarationDir must sit inside the same directory as the `file` output
      // (dist/index.cjs, dist/index.mjs). @rollup/plugin-typescript v12
      // enforces this; v11 silently tolerated '.'.
      typescript({ sourceMap: true, declarationDir: 'dist', declaration: true }),
    ],
  }
}

/**
 * Create a base rollup config for web scripts and styles
 * @param {object} options Configuration options
 * @param {Record<string,string>} options.input Input files
 * @param {Record<string,string>} [options.styles] CSS entry points, emitted as
 *   `<name>.css`, `<name>.css.map` and `<name>.min.css` assets
 * @param {string[]} [options.external] External dependencies
 * @returns {import('rollup').RollupOptions} Rollup configuration
 */
export function configTsWeb({ external, input, styles }) {
  return {
    input,
    external,
    strictDeprecations: true,
    output: [
      {
        dir: 'dist/assets',
        entryFileNames: '[name].cjs',
        format: 'cjs',
        sourcemap: true,
        // The stylesheets ride along on this one output so they are written
        // exactly once. All three outputs share `dir`, so which one carries
        // them is arbitrary - but it must be only one.
        plugins: styles ? [cssAssets({ entries: styles, minify: true })] : [],
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
