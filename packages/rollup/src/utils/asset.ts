import type { AssetType, FileSystem } from '@ui-doc/core'

import type { AssetOption, AssetResolved } from './asset.types'
import type { Options, ResolvedOptions } from './option.types'

const ASSETS: {
  name: (options: Options) => string | false
  dependency: (options: Options) => string | false
}[] = [
  {
    name: options => options.assets?.styleAsset ?? 'ui-doc.css',
    dependency: () => '@ui-doc/html-renderer/ui-doc.min.css',
  },
  {
    name: () => 'ui-doc.js',
    dependency: () => '@ui-doc/html-renderer/ui-doc.min.js',
  },
  {
    name: options => options.assets?.highlightStyle ?? 'highlight.css',
    dependency: options =>
      `@highlightjs/cdn-assets/styles/${options.assets?.highlightTheme ?? 'default'}.min.css`,
  },
  {
    name: options => options.assets?.highlightScript ?? 'highlight.js',
    dependency: () => '@highlightjs/cdn-assets/highlight.min.js',
  },
]

export function resolveAssetType(fileName: string): AssetType | null {
  if (fileName.match(/\.(css|less|sass|scss)$/)) {
    return 'style'
  }

  if (fileName.match(/\.(js|ts)$/)) {
    return 'script'
  }

  return null
}

export async function resolveAssets(
  options: Options,
  fileSystem: FileSystem,
): Promise<ResolvedOptions['assets']> {
  const assetLoader = fileSystem.assetLoader()
  const resolveAssetOption = async (
    assetOption: AssetOption,
    context: AssetResolved['context'],
  ) => {
    const name = typeof assetOption.name === 'function' ? assetOption.name() : assetOption.name
    const type = resolveAssetType(name)

    const asset: AssetResolved = {
      name,
      fileName: name,
      type: type ?? undefined,
      context,
      attrs: assetOption.attrs,
    }

    if (assetOption.dependency) {
      asset.originalFileName = await assetLoader.resolve(
        typeof assetOption.dependency === 'function'
          ? assetOption.dependency()
          : assetOption.dependency,
      )
    } else if (assetOption.file) {
      asset.originalFileName = fileSystem.resolve(
        typeof assetOption.file === 'function' ? assetOption.file() : assetOption.file,
      )
    }

    if (
      assetOption.fromInput &&
      (typeof assetOption.fromInput === 'function'
        ? assetOption.fromInput(asset)
        : assetOption.fromInput)
    ) {
      asset.fromInput = true
    } else if (assetOption.source) {
      asset.source =
        typeof assetOption.source === 'function' ? assetOption.source() : assetOption.source
    } else if (asset.originalFileName) {
      asset.source = await fileSystem.fileRead(asset.originalFileName)
    }

    return asset
  }

  return (
    await Promise.all([
      ...ASSETS.map(async ({ name, dependency }) => {
        const assetName = name(options)
        const dependencyName = dependency(options)

        if (dependencyName === false || assetName === false) {
          return null
        }

        const type = resolveAssetType(assetName)
        const resolvedFile = await assetLoader.resolve(dependencyName)

        if (!type || !resolvedFile) {
          return null
        }

        return {
          name: assetName,
          type,
          fileName: assetName,
          context: 'page',
          originalFileName: resolvedFile,
          source: await assetLoader.read(resolvedFile),
        } as AssetResolved
      }),
      ...(options.assets?.page ?? []).map(asset => resolveAssetOption(asset, 'page')),
      ...(options.assets?.example ?? []).map(asset => resolveAssetOption(asset, 'example')),
    ])
  ).filter(asset => !!asset && (!!asset?.source || !!asset?.fromInput)) as ResolvedOptions['assets']
}
