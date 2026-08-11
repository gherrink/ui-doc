import { builtinModules } from 'node:module'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import swc from '@rollup/plugin-swc'
import terser from '@rollup/plugin-terser'
import { cssAssets } from './rollup-plugin-css.mjs'

/** Extensions node-resolve must try, now that no plugin resolves .ts implicitly. */
const EXTENSIONS = ['.ts', '.mjs', '.js', '.json', '.node']

/**
 * Transpile TypeScript with swc. Declarations are emitted separately by `tsc`,
 * because @rollup/plugin-typescript drives the TypeScript compiler API, which
 * TypeScript 7 no longer exposes.
 * @param {'es2022'|'es2015'} target Output language level
 * @returns {import('rollup').Plugin} Configured swc plugin
 */
function transpile(target) {
  return swc({
    swc: {
      jsc: {
        target,
        parser: { syntax: 'typescript' },
        // @rollup/plugin-swc defaults this to true, which downlevels class
        // property declarations into constructor assignments. That swaps
        // define semantics for set semantics and breaks subclasses of
        // EventEmitterBase, whose `listeners` field would be re-created.
        loose: false,
      },
      sourceMaps: true,
    },
  })
}

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
      resolve({ extensions: EXTENSIONS }),
      commonjs(),
      transpile('es2022'),
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
    // The browser target is ES6/es2015, matching tsconfig.web.json, which still
    // typechecks these sources and emits their declarations. There is no babel
    // step: the repo-root .babelrc was never loaded, because babel's config
    // search does not walk above `root`, which defaults to rollup's cwd (the
    // package dir). It ran with zero presets - a parse-and-reprint no-op.
    //
    // node-resolve is required here: @rollup/plugin-typescript used to resolve
    // the relative .ts imports in scripts/, and nothing else does.
    plugins: [
      resolve({ extensions: EXTENSIONS }),
      transpile('es2015'),
    ],
  }
}
