import type { Asset } from '@ui-doc/core'

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
