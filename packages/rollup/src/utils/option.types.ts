import type {
  BlockParser,
  FileFinder,
  FileSystem,
  Options as UIDocOptions,
  Renderer,
  UIDoc,
} from '@ui-doc/core'

import type { Api } from '../index'
import type { AssetOption, AssetResolved } from './asset.types'

export interface Options {
  renderer?: Renderer
  blockParser?: BlockParser
  source: string[]
  templatePath?: string
  output?: {
    dir?: string
    baseUri?: string
  }
  settings?: Pick<UIDocOptions, 'generate' | 'texts'>
  assets?: {
    static?: string
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
  assetsFromInput: string[]
  staticAssets?: string
  fileSystem: FileSystem
  finder: FileFinder
  prefix: {
    path: string
    uri: string
  }
  uidoc: UIDoc
  source: string[]
  uidocAsset: Api['uidocAsset']
}
