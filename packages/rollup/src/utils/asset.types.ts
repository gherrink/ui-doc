import type { Asset } from '@ui-doc/core'

export interface AssetOption {
  name: string | (() => string)
  fromInput?: boolean | ((asset: AssetResolved) => boolean)
  file?: string | (() => string)
  dependency?: string | (() => string)
  source?: string | Uint8Array | (() => string)
  attrs?: Asset['attrs']
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
}
