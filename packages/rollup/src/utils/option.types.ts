import type {
  BlockParser,
  FileFinder,
  FileSystem,
  Renderer,
  UIDoc,
  Options as UIDocOptions,
} from '@ui-doc/core'

import type { Api } from '../index'
import type { AssetOption, AssetResolved, CopyAssetOption, CopyAssetResolved } from './asset.types'

export interface Options {
  renderer?: Renderer
  blockParser?: BlockParser
  debug?: boolean
  source: string[]
  templatePath?: string
  output?: {
    dir?: string
    baseUri?: string
  }
  settings?: Pick<UIDocOptions, 'generate' | 'texts'>
  assets?: {
    static?: string
    /** Copy assets (fonts, images, etc.) to output with glob patterns */
    copy?: CopyAssetOption[]
    styleAsset?: false | string
    highlightStyle?: false | string
    highlightTheme?: string
    highlightScript?: false | string
    page?: AssetOption[]
    example?: AssetOption[]
  }
}

export interface ResolvedOptions {
  assets: AssetResolved[]
  /**
   * Configured `file` assets whose file could not be read, so they were left
   * out of `assets`. Reported as warnings from `buildStart`, which is the
   * earliest point with a plugin context.
   */
  unreadableAssets: { name: string; file: string }[]
  assetsFromInput: Set<string>
  copyAssets: CopyAssetResolved[]
  staticAssets?: string
  fileSystem: FileSystem
  finder: FileFinder
  prefix: {
    path: string
    uri: string
  }
  templatePath?: string
  uidoc: UIDoc
  source: string[]
  uidocAsset: Api['uidocAsset']
  isAssetFromInput: Api['isAssetFromInput']
  addAssetFromInput: Api['addAssetFromInput']
}
