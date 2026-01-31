import type { FileSystem, Logger, Renderer } from '@ui-doc/core'
import type { Options, ResolvedOptions } from './option.types'
import { createConsoleLogger, noopLogger, UIDoc } from '@ui-doc/core'

import { NodeFileSystem } from '@ui-doc/node'
import { resolveAssets, resolveAssetType, resolveCopyAssets } from './asset'

async function createDefaultRenderer(
  templatePath: string | undefined,
  fileSystem: FileSystem,
  logger: Logger,
): Promise<Renderer> {
  let rendererImport
  try {
    rendererImport = await import('@ui-doc/html-renderer')
  } catch {
    throw new Error(
      '@ui-doc/html-renderer is required but not installed. Please install it as a dependency.',
    )
  }
  const renderer = new rendererImport.HtmlRenderer(rendererImport.NodeParser.init(), logger)
  const packageTemplatePath = await fileSystem
    .assetLoader()
    .packagePath(rendererImport.TemplateLoader.TEMPLATES_PACKAGE)

  if (packageTemplatePath !== undefined && packageTemplatePath !== '') {
    await rendererImport.TemplateLoader.load({
      fileSystem,
      renderer,
      templatePath: packageTemplatePath,
    })
  }

  if (templatePath !== undefined && templatePath !== '') {
    await rendererImport.TemplateLoader.load({
      fileSystem,
      renderer,
      templatePath,
    })
  }

  return renderer
}

interface OutputPrefixResult {
  prefix: ResolvedOptions['prefix']
  settingsOverride?: Options['settings']
}

function createOutputPrefix(options: Options): OutputPrefixResult {
  const prefix: ResolvedOptions['prefix'] = { path: '', uri: '' }
  const path = options?.output?.dir

  if (path === undefined || path === '') {
    return { prefix }
  }

  prefix.path = path.endsWith('/') ? path : `${path}/`

  if (options?.output?.baseUri === '.') {
    return { prefix }
  }

  prefix.uri = options?.output?.baseUri ?? prefix.path
  prefix.uri = prefix.uri.endsWith('/') ? prefix.uri : `${prefix.uri}/`

  const prevResolve = options.settings?.generate?.resolve ?? ((uri: string) => uri)
  const settingsOverride: Partial<NonNullable<Options['settings']>> = {
    ...options.settings,
    generate: {
      ...options.settings?.generate,
      resolve: (uri: string, type: string) => prevResolve(`/${prefix.uri}${uri}`, type),
    },
  }

  return { prefix, settingsOverride }
}

export async function resolveOptions(options: Options): Promise<ResolvedOptions> {
  const { prefix, settingsOverride } = createOutputPrefix(options)
  const resolvedSettings = settingsOverride ?? options.settings
  const fileSystem = NodeFileSystem.init()
  const finder = fileSystem.createFileFinder(options.source)
  const logger = options.debug === true ? createConsoleLogger('debug') : noopLogger
  const renderer = options.renderer
    ?? (await createDefaultRenderer(options.templatePath, fileSystem, logger))
  const uidoc = new UIDoc({
    blockParser: options.blockParser,
    logger,
    renderer,
    ...(resolvedSettings ?? {}),
  })
  const assetsFromInput = new Set<string>()
  const isAssetFromInput: ResolvedOptions['isAssetFromInput'] = src => assetsFromInput.has(src)
  const addAssetFromInput: ResolvedOptions['addAssetFromInput'] = src => {
    assetsFromInput.add(src)
  }
  const uidocAsset: ResolvedOptions['uidocAsset'] = (
    src,
    context,
    { fromInput = false, type: assetType, attrs } = {},
  ) => {
    const type = assetType ?? resolveAssetType(src)

    if (!type) {
      return
    }

    if (fromInput) {
      assetsFromInput.add(src)
    }

    const method = context === 'example' ? 'addExampleAsset' : 'addAsset'

    uidoc[method]({
      src,
      type,
      attrs,
    })
  }

  const copyAssets = await resolveCopyAssets(options.assets?.copy, fileSystem)

  return {
    assets: await resolveAssets(options, fileSystem, copyAssets),
    assetsFromInput,
    copyAssets,
    fileSystem,
    finder,
    prefix,
    source: options.source,
    staticAssets: options.assets?.static,
    templatePath:
      options.templatePath !== undefined ? fileSystem.resolve(options.templatePath) : undefined,
    uidoc,
    uidocAsset,
    isAssetFromInput,
    addAssetFromInput,
  }
}
