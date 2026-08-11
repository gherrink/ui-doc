import { readFile } from 'node:fs/promises'
import path from 'node:path'
import cssnano from 'cssnano'
import postcss from 'postcss'
import postcssImport from 'postcss-import'
import postcssPresetEnv from 'postcss-preset-env'

/**
 * Rollup output plugin that compiles CSS entry points with PostCSS and emits
 * them as assets.
 *
 * The stylesheets deliberately never enter Rollup's module graph. A CSS-only
 * `input` always makes Rollup produce an empty JS chunk (and, with
 * `sourcemap: true`, an orphaned map for it), which the previous
 * rollup-plugin-postcss setup had to delete after the fact. Compiling outside
 * the graph removes the problem instead of cleaning up after it.
 *
 * Attach this to exactly one `output`: assets emitted from a build-phase hook
 * are written into every output bundle, and the web config has three outputs
 * sharing a single `dir`.
 * @param {object} options Configuration options
 * @param {Record<string,string>} options.entries Asset base name -> CSS entry
 *   file, resolved relative to the Rollup process cwd (like `input`)
 * @param {boolean} [options.minify] Additionally emit `<name>.min.css`
 * @returns {import('rollup').OutputPlugin} Rollup output plugin
 */
export function cssAssets({ entries, minify = false }) {
  return {
    name: 'css-assets',

    async generateBundle(outputOptions) {
      const outDir = path.resolve(
        outputOptions.dir ?? path.dirname(outputOptions.file),
      )

      await Promise.all(
        Object.entries(entries).map(async ([name, entry]) => {
          const from = path.resolve(entry)
          // `to` only steers the source map's relative paths; nothing is
          // written here. Pointing it at the output directory is what makes
          // the map's `sources` resolve from next to the map file.
          const to = path.join(outDir, `${name}.css`)

          // postcssImport must run first so @import-ed files are inlined
          // before nesting is flattened. postcssPresetEnv runs autoprefixer
          // internally.
          const result = await postcss([postcssImport(), postcssPresetEnv()])
            .process(await readFile(from, 'utf8'), {
              from,
              to,
              map: {
                annotation: `${name}.css.map`,
                inline: false,
                sourcesContent: true,
              },
            })

          // Every @import-ed file, so `rollup -w` reacts to changes in them.
          for (const message of result.messages) {
            if (message.type === 'dependency') {
              this.addWatchFile(message.file)
            }
          }

          for (const warning of result.warnings()) {
            this.warn(warning.toString())
          }

          this.emitFile({
            type: 'asset',
            fileName: `${name}.css`,
            source: result.css,
          })
          this.emitFile({
            type: 'asset',
            fileName: `${name}.css.map`,
            source: result.map.toString(),
          })

          if (minify) {
            const minified = await postcss([cssnano({ preset: 'default' })])
              .process(result.css, { from: undefined })

            // postcss-calc cannot evaluate calc() over custom properties and
            // warns once per such declaration. These are noise, not defects,
            // and routing them through this.warn() would break any config
            // that turns warnings into errors.
            for (const warning of minified.warnings()) {
              this.debug(warning.toString())
            }

            this.emitFile({
              type: 'asset',
              fileName: `${name}.min.css`,
              source: minified.css,
            })
          }
        }),
      )
    },
  }
}
