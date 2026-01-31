import type { Asset } from '@ui-doc/core'

/**
 * Configuration for copying assets (fonts, images, etc.) to the output directory.
 */
export interface CopyAssetOption {
  /** Glob pattern for source files (e.g., 'src/fonts/**\/*.woff2') */
  from: string
  /** Output subdirectory (default: output root) */
  to?: string
}

/**
 * Resolved copy asset with absolute source path and relative output path.
 */
export interface CopyAssetResolved {
  /** Absolute path to the source file */
  sourcePath: string
  /** Relative output path (e.g., 'fonts/my-font.woff2') */
  outputPath: string
}

export interface AssetOption {
  name: string | (() => string)
  fromInput?: boolean | ((asset: AssetResolved) => boolean)
  file?: string | (() => string)
  dependency?: string | (() => string)
  source?: string | Uint8Array | (() => string)
  attrs?: Asset['attrs']
  /**
   * When true, omit explicit `fileName` when emitting the asset, allowing Rollup
   * to apply the `output.assetFileNames` pattern (e.g., for cache-busting hashes).
   * Built-in assets and HTML pages always use explicit file names.
   * @default false
   */
  useAssetFileNames?: boolean
}

export interface AssetResolved {
  name: string
  context: 'example' | 'page'
  fileName: string
  type?: Asset['type']
  originalFileName?: string
  fromInput?: true
  source?: string | Uint8Array
  attrs?: Asset['attrs']
  /**
   * When true, the asset will be emitted without an explicit `fileName`,
   * allowing Rollup to apply the `output.assetFileNames` pattern.
   */
  useAssetFileNames?: boolean
}
