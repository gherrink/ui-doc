import type { AssetType, FileSystem } from '@ui-doc/core'

import type { AssetOption, AssetResolved, CopyAssetOption, CopyAssetResolved } from './asset.types'
import type { Options, ResolvedOptions } from './option.types'
import path from 'node:path'
import picomatch from 'picomatch'

const STYLE_EXTENSIONS = /\.(?:css|less|sass|scss)$/
const SCRIPT_EXTENSIONS = /\.(?:js|ts)$/

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
  if (STYLE_EXTENSIONS.test(fileName)) {
    return 'style'
  }

  if (SCRIPT_EXTENSIONS.test(fileName)) {
    return 'script'
  }

  return null
}

/**
 * Resolves copy asset options into a list of files with their output paths.
 * Uses glob patterns to find files and calculates output paths based on glob base.
 */
export async function resolveCopyAssets(
  copyOptions: CopyAssetOption[] | undefined,
  fileSystem: FileSystem,
): Promise<CopyAssetResolved[]> {
  if (copyOptions === undefined || copyOptions.length === 0) {
    return []
  }

  const results: CopyAssetResolved[] = []

  for (const option of copyOptions) {
    const resolvedGlob = fileSystem.resolve(option.from)
    const scan = picomatch.scan(resolvedGlob, { parts: true, tokens: true })
    const globBase = path.join(scan.prefix, scan.base)
    const finder = fileSystem.createFileFinder([option.from])

    await finder.search(async (sourcePath: string) => {
      // Calculate relative path from glob base
      const relativePath = path.relative(globBase, sourcePath)
      // Build output path: to + relativePath (or just relativePath if no to)
      const outputPath = option.to !== undefined ? path.join(option.to, relativePath) : relativePath

      results.push({
        sourcePath,
        outputPath,
      })
    })
  }

  return results
}

/**
 * Regex to match CSS url() references, capturing the URL content.
 * Uses separate patterns for quoted and unquoted URLs to avoid backtracking.
 */
const CSS_URL_QUOTED_REGEX = /url\(\s*(['"])([^'"]+)\1\s*\)/g
const CSS_URL_UNQUOTED_REGEX = /url\(([^'"\s)]+)\)/g

/**
 * Rewrites CSS url() references to match copy asset output paths.
 * For each url() in the CSS, resolves the path relative to the CSS file,
 * then checks if it matches any copy asset source path.
 */
export function rewriteCssUrls(
  cssContent: string,
  cssFilePath: string,
  copyAssets: CopyAssetResolved[],
): string {
  if (copyAssets.length === 0) {
    return cssContent
  }

  const cssDir = path.dirname(cssFilePath)

  const rewriteUrl = (urlPath: string, quote: string): string | null => {
    // Skip data URIs and absolute URLs
    if (
      urlPath.startsWith('data:')
      || urlPath.startsWith('http://')
      || urlPath.startsWith('https://')
      || urlPath.startsWith('//')
    ) {
      return null
    }

    // Resolve the url path relative to CSS file directory
    const resolvedPath = path.resolve(cssDir, urlPath)

    // Check if this path matches any copy asset source
    const matchedAsset = copyAssets.find(asset => asset.sourcePath === resolvedPath)

    if (matchedAsset !== undefined) {
      // Rewrite to relative output path
      return `url(${quote}./${matchedAsset.outputPath}${quote})`
    }

    return null
  }

  // First handle quoted URLs
  let result = cssContent.replace(
    CSS_URL_QUOTED_REGEX,
    (match: string, quote: string, urlPath: string) => rewriteUrl(urlPath, quote) ?? match,
  )

  // Then handle unquoted URLs
  result = result.replace(CSS_URL_UNQUOTED_REGEX, (match: string, urlPath: string) => {
    const rewritten = rewriteUrl(urlPath, '')
    return rewritten ?? match
  })

  return result
}

export async function resolveAssets(
  options: Options,
  fileSystem: FileSystem,
  copyAssets: CopyAssetResolved[] = [],
): Promise<ResolvedOptions['assets']> {
  const assetLoader = fileSystem.assetLoader()
  const resolveAssetOption = async (
    assetOption: AssetOption,
    context: AssetResolved['context'],
  ): Promise<AssetResolved> => {
    const name = typeof assetOption.name === 'function' ? assetOption.name() : assetOption.name
    const type = assetOption.type ?? resolveAssetType(name)

    const asset: AssetResolved = {
      name,
      fileName: name,
      type: type ?? undefined,
      context,
      attrs: assetOption.attrs,
      useAssetFileNames: assetOption.useAssetFileNames,
    }

    if (assetOption.dependency !== undefined) {
      asset.originalFileName = await assetLoader.resolve(
        typeof assetOption.dependency === 'function'
          ? assetOption.dependency()
          : assetOption.dependency,
      )
    } else if (assetOption.file !== undefined) {
      const resolvedFile = fileSystem.resolve(
        typeof assetOption.file === 'function' ? assetOption.file() : assetOption.file,
      )
      asset.originalFileName = resolvedFile
      asset.file = resolvedFile
    }

    if (
      assetOption.fromInput !== undefined
      && (typeof assetOption.fromInput === 'function'
        ? assetOption.fromInput(asset)
        : assetOption.fromInput)
    ) {
      asset.fromInput = true
    } else if (assetOption.source !== undefined) {
      asset.source
        = typeof assetOption.source === 'function' ? assetOption.source() : assetOption.source
    } else if (asset.originalFileName !== undefined && asset.originalFileName !== '') {
      let source = await fileSystem.fileRead(asset.originalFileName)

      // Rewrite CSS url() references for page/example CSS assets
      if (type === 'style' && copyAssets.length > 0) {
        source = rewriteCssUrls(source, asset.originalFileName, copyAssets)
      }

      asset.source = source
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

        if (type === null || resolvedFile === undefined || resolvedFile === '') {
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
      ...(options.assets?.page ?? []).map(async asset => resolveAssetOption(asset, 'page')),
      ...(options.assets?.example ?? []).map(async asset => resolveAssetOption(asset, 'example')),
    ])
  ).filter((asset): asset is AssetResolved =>
    asset !== null && (asset.source !== undefined || asset.fromInput === true),
  )
}
