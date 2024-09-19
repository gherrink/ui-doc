import { type FileSystem, type Renderer, UIDoc } from '@ui-doc/core'
import { NodeFileSystem } from '@ui-doc/node'

import { resolveAssets, resolveAssetType } from './asset'
import type { Options, ResolvedOptions } from './option.types'

async function createDefaultRenderer(
  templatePath: string | undefined,
  fileSystem: FileSystem,
): Promise<Renderer> {
  const rendererImport = await import('@ui-doc/html-renderer')
  const renderer = new rendererImport.HtmlRenderer(rendererImport.NodeParser.init())

  await rendererImport.TemplateLoader.load({
    fileSystem,
    renderer,
    templateBasePath: templatePath,
  })

  return renderer
}

function createOutputPrefix(options: Options): ResolvedOptions['prefix'] {
  const prefix: ResolvedOptions['prefix'] = { path: '', uri: '' }
  const path = options?.output?.dir

  if (!path) {
    return prefix
  }

  prefix.path = path.endsWith('/') ? path : `${path}/`

  if (options?.output?.baseUri === '.') {
    return prefix
  }

  prefix.uri = options?.output?.baseUri ?? prefix.path
  prefix.uri = prefix.uri.endsWith('/') ? prefix.uri : `${prefix.uri}/`

  const prevResolve = options.settings?.generate?.resolve ?? (uri => uri)

  options.settings = options.settings ?? {}
  options.settings.generate = options.settings.generate ?? {}
  options.settings.generate.resolve = (uri, type) => prevResolve(`/${prefix.uri}${uri}`, type)

  return prefix
}

export async function resolveOptions(options: Options): Promise<ResolvedOptions> {
  const prefix = createOutputPrefix(options)
  const fileSystem = NodeFileSystem.init()
  const finder = fileSystem.createFileFinder(options.source)
  const uidoc = new UIDoc({
    blockParser: options.blockParser,
    renderer: options.renderer ?? (await createDefaultRenderer(options.templatePath, fileSystem)),
    ...(options.settings ?? {}),
  })
  const assetsFromInput: ResolvedOptions['assetsFromInput'] = []
  const uidocAsset: ResolvedOptions['uidocAsset'] = (
    src,
    context,
    { fromInput = false, type: assetType, attrs } = {},
  ) => {
    const type = assetType ?? resolveAssetType(src)

    if (!type) {
      return
    }

    if (fromInput && !assetsFromInput.includes(src)) {
      assetsFromInput.push(src)
    }

    const method = context === 'example' ? 'addExampleAsset' : 'addAsset'

    uidoc[method]({
      src,
      type,
      attrs,
    })
  }

  return {
    assets: await resolveAssets(options, fileSystem),
    assetsFromInput,
    fileSystem,
    finder,
    prefix,
    source: options.source,
    staticAssets: options.assets?.static,
    uidoc,
    uidocAsset,
  }
}
