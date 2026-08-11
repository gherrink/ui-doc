import type { AssetLoader, BlockParser, FileSystem, Renderer } from '@ui-doc/core'
import { UIDoc } from '@ui-doc/core'
import { NodeFileSystem } from '@ui-doc/node'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resolveAssets, resolveAssetType } from '../src/utils/asset'
import type { AssetResolved } from '../src/utils/asset.types'
import { resolveOptions } from '../src/utils/option'
import type { Options } from '../src/utils/option.types'

vi.mock('@ui-doc/core', () => ({
  UIDoc: vi.fn(),
  noopLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  createConsoleLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}))

vi.mock('@ui-doc/node', () => ({
  NodeFileSystem: {
    init: vi.fn(),
  },
}))

vi.mock('../src/utils/asset', () => ({
  resolveAssets: vi.fn(),
  resolveCopyAssets: vi.fn().mockResolvedValue([]),
  resolveAssetType: vi.fn((fileName: string) => {
    if (/\.(?:css|less|sass|scss)$/.test(fileName)) {
      return 'style'
    }
    if (/\.(?:js|ts)$/.test(fileName)) {
      return 'script'
    }
    return null
  }),
}))

describe('resolveOptions', () => {
  let mockFileSystem: FileSystem
  let mockFileFinder: ReturnType<FileSystem['createFileFinder']>
  let mockAssetLoader: AssetLoader
  let mockUIDocInstance: UIDoc
  let mockRenderer: Renderer
  let mockAddAsset: ReturnType<typeof vi.fn>
  let mockAddExampleAsset: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    mockAssetLoader = {
      packagePath: vi.fn<AssetLoader['packagePath']>().mockResolvedValue('/path/to/templates'),
      resolve: vi.fn<AssetLoader['resolve']>().mockResolvedValue('/resolved/asset.css'),
      read: vi.fn<AssetLoader['read']>().mockResolvedValue('asset content'),
      copy: vi.fn<AssetLoader['copy']>().mockResolvedValue(undefined),
      packageExists: vi.fn<AssetLoader['packageExists']>().mockResolvedValue(true),
    }

    mockFileFinder = {
      search: vi.fn(async () => Promise.resolve()),
      matches: vi.fn(() => true),
      directories: vi.fn(() => []),
    }

    mockFileSystem = {
      assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
      createFileFinder: vi.fn<FileSystem['createFileFinder']>().mockReturnValue(mockFileFinder),
      resolve: vi.fn<FileSystem['resolve']>((path: string) => `/resolved/${path}`),
      fileRead: vi.fn<FileSystem['fileRead']>().mockResolvedValue('file content'),
      fileWrite: vi.fn<FileSystem['fileWrite']>().mockResolvedValue(true),
      fileDirname: vi.fn<FileSystem['fileDirname']>((path: string) =>
        path.split('/').slice(0, -1).join('/'),
      ),
      fileCopy: vi.fn<FileSystem['fileCopy']>().mockResolvedValue(true),
      directoryCopy: vi.fn<FileSystem['directoryCopy']>().mockResolvedValue(true),
      ensureDirectoryExists: vi.fn<FileSystem['ensureDirectoryExists']>().mockResolvedValue(true),
      isDirectory: vi.fn<FileSystem['isDirectory']>().mockResolvedValue(true),
      fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(true),
      fileBasename: vi.fn<FileSystem['fileBasename']>(
        (path: string) => path.split('/').pop() ?? '',
      ),
    }

    mockRenderer = {
      generate: vi.fn<Renderer['generate']>().mockReturnValue('<html></html>'),
    }

    mockAddAsset = vi.fn()
    mockAddExampleAsset = vi.fn()

    mockUIDocInstance = {
      sourceCreate: vi.fn(),
      sourceUpdate: vi.fn(),
      sourceDelete: vi.fn(),
      sourceExists: vi.fn(),
      blockParser: {} as BlockParser,
      entries: vi.fn(),
      pages: vi.fn(),
      page: vi.fn(),
      example: vi.fn(),
      output: vi.fn(),
      addAsset: mockAddAsset,
      addExampleAsset: mockAddExampleAsset,
      replaceGenerate: vi.fn(),
      on: vi.fn(),
    } as unknown as UIDoc

    type NodeFS = ReturnType<typeof NodeFileSystem.init>
    vi.mocked(NodeFileSystem.init).mockReturnValue(mockFileSystem as unknown as NodeFS)
    // Vitest 4 rejects mockReturnValue on a mock invoked with `new`.
    // A function implementation returning an object still wins over `this`.
    vi.mocked(UIDoc).mockImplementation(function () {
      return mockUIDocInstance
    } as unknown as () => UIDoc)
    vi.mocked(resolveAssets).mockResolvedValue([])
    // Reset resolveAssetType to its default implementation
    vi.mocked(resolveAssetType).mockImplementation((fileName: string) => {
      if (/\.(?:css|less|sass|scss)$/.test(fileName)) {
        return 'style'
      }
      if (/\.(?:js|ts)$/.test(fileName)) {
        return 'script'
      }
      return null
    })
  })

  // Note: Don't use vi.restoreAllMocks() in afterEach as it breaks vi.mock() at module level

  describe('minimal configuration', () => {
    it('should resolve options with minimal config', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      expect(resolved.source).toEqual(['src/**/*.ts'])
      expect(resolved.fileSystem).toBe(mockFileSystem)
      expect(resolved.finder).toBe(mockFileFinder)
      expect(resolved.uidoc).toBe(mockUIDocInstance)
      expect(resolved.prefix).toEqual({ path: '', uri: '' })
      expect(resolved.staticAssets).toBeUndefined()
      expect(resolved.assetsFromInput).toBeInstanceOf(Set)
      expect(resolved.assetsFromInput.size).toBe(0)
    })

    it('should initialize NodeFileSystem', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      await resolveOptions(options)

      expect(NodeFileSystem.init).toHaveBeenCalledTimes(1)
    })

    it('should create file finder with source patterns', async () => {
      const options: Options = {
        source: ['src/**/*.ts', 'lib/**/*.js'],
      }

      await resolveOptions(options)

      expect(mockFileSystem.createFileFinder).toHaveBeenCalledWith(['src/**/*.ts', 'lib/**/*.js'])
    })

    it('should resolve assets', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      await resolveOptions(options)

      // The fourth argument is the collector resolveAssets fills with assets
      // whose configured `file` could not be read.
      expect(resolveAssets).toHaveBeenCalledWith(options, mockFileSystem, [], [])
    })
  })

  describe('custom renderer', () => {
    it('should use custom renderer when provided', async () => {
      const customRenderer: Renderer = {
        generate: vi.fn<Renderer['generate']>().mockReturnValue('<custom></custom>'),
      }

      const options: Options = {
        source: ['src/**/*.ts'],
        renderer: customRenderer,
      }

      const resolved = await resolveOptions(options)

      expect(UIDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          renderer: customRenderer,
        }),
      )
      expect(resolved.uidoc).toBe(mockUIDocInstance)
    })

    it('should not import html-renderer when custom renderer provided', async () => {
      const customRenderer: Renderer = {
        generate: vi.fn<Renderer['generate']>().mockReturnValue(''),
      }

      const options: Options = {
        source: ['src/**/*.ts'],
        renderer: customRenderer,
      }

      await resolveOptions(options)

      expect(mockAssetLoader.packagePath).not.toHaveBeenCalled()
    })
  })

  describe('custom blockParser', () => {
    it('should pass custom blockParser to UIDoc', async () => {
      const mockBlockParser: BlockParser = {
        parse: vi.fn<BlockParser['parse']>().mockReturnValue([]),
        registerTagTransformer: vi.fn<BlockParser['registerTagTransformer']>(),
      }

      const options: Options = {
        source: ['src/**/*.ts'],
        blockParser: mockBlockParser,
      }

      await resolveOptions(options)

      expect(UIDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          blockParser: mockBlockParser,
        }),
      )
    })
  })

  describe('settings configuration', () => {
    it('should pass settings to UIDoc when provided', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        settings: {
          texts: {
            title: 'Custom Title',
            copyright: 'Custom Copyright',
          },
        },
      }

      await resolveOptions(options)

      expect(UIDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          texts: {
            title: 'Custom Title',
            copyright: 'Custom Copyright',
          },
        }),
      )
    })

    it('should pass generate settings to UIDoc', async () => {
      const customResolve = vi.fn((uri: string) => `/custom/${uri}`)

      const options: Options = {
        source: ['src/**/*.ts'],
        settings: {
          generate: {
            resolve: customResolve,
          },
        },
      }

      await resolveOptions(options)

      expect(UIDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          generate: {
            resolve: expect.any(Function),
          },
        }),
      )
    })
  })

  describe('assets configuration', () => {
    it('should populate staticAssets when configured', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        assets: {
          static: '/path/to/static',
        },
      }

      const resolved = await resolveOptions(options)

      expect(resolved.staticAssets).toBe('/path/to/static')
    })

    it('should handle undefined assets', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      expect(resolved.staticAssets).toBeUndefined()
    })

    it('should pass resolved assets to result', async () => {
      const mockAssets: AssetResolved[] = [
        {
          name: 'test.css',
          fileName: 'test.css',
          type: 'style',
          context: 'page',
          source: 'body { color: red; }',
        },
      ]

      vi.mocked(resolveAssets).mockResolvedValue(mockAssets)

      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      expect(resolved.assets).toBe(mockAssets)
    })
  })

  describe('output prefix without baseUri', () => {
    it('should create empty prefix when output.dir is undefined', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      expect(resolved.prefix).toEqual({ path: '', uri: '' })
    })

    it('should create empty prefix when output.dir is empty string', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        output: {
          dir: '',
        },
      }

      const resolved = await resolveOptions(options)

      expect(resolved.prefix).toEqual({ path: '', uri: '' })
    })

    it('should set path and uri to same value when no baseUri', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        output: {
          dir: 'dist/docs',
        },
      }

      const resolved = await resolveOptions(options)

      expect(resolved.prefix.path).toBe('dist/docs/')
      expect(resolved.prefix.uri).toBe('dist/docs/')
    })

    it('should add trailing slash to path when missing', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        output: {
          dir: 'dist/docs',
        },
      }

      const resolved = await resolveOptions(options)

      expect(resolved.prefix.path).toBe('dist/docs/')
    })

    it('should preserve trailing slash in path', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        output: {
          dir: 'dist/docs/',
        },
      }

      const resolved = await resolveOptions(options)

      expect(resolved.prefix.path).toBe('dist/docs/')
    })
  })

  describe('output prefix with baseUri', () => {
    it('should use baseUri for uri prefix', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        output: {
          dir: 'dist/docs',
          baseUri: '/ui-doc',
        },
      }

      const resolved = await resolveOptions(options)

      expect(resolved.prefix.path).toBe('dist/docs/')
      expect(resolved.prefix.uri).toBe('/ui-doc/')
    })

    it('should add trailing slash to baseUri when missing', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        output: {
          dir: 'dist/docs',
          baseUri: '/base',
        },
      }

      const resolved = await resolveOptions(options)

      expect(resolved.prefix.uri).toBe('/base/')
    })

    it('should preserve trailing slash in baseUri', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        output: {
          dir: 'dist/docs',
          baseUri: '/base/',
        },
      }

      const resolved = await resolveOptions(options)

      expect(resolved.prefix.uri).toBe('/base/')
    })

    it('should set empty uri when baseUri is "."', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        output: {
          dir: 'dist/docs',
          baseUri: '.',
        },
      }

      const resolved = await resolveOptions(options)

      expect(resolved.prefix.path).toBe('dist/docs/')
      expect(resolved.prefix.uri).toBe('')
    })

    it('should wrap existing generate.resolve function', async () => {
      const customResolve = vi.fn((uri: string) => `/custom${uri}`)

      const options: Options = {
        source: ['src/**/*.ts'],
        output: {
          dir: 'dist/docs',
          baseUri: 'base',
        },
        settings: {
          generate: {
            resolve: customResolve,
          },
        },
      }

      await resolveOptions(options)

      const uidocCall = vi.mocked(UIDoc).mock.calls[0][0]
      const wrappedResolve = uidocCall.generate?.resolve

      expect(wrappedResolve).toBeDefined()

      if (wrappedResolve) {
        wrappedResolve('test.css', 'style')
        // Code prepends '/' and adds prefix.uri (which becomes 'base/' with trailing slash)
        expect(customResolve).toHaveBeenCalledWith('/base/test.css', 'style')
      }
    })

    it('should create resolve function when none exists', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        output: {
          dir: 'dist/docs',
          baseUri: 'base',
        },
      }

      await resolveOptions(options)

      const uidocCall = vi.mocked(UIDoc).mock.calls[0][0]
      const wrappedResolve = uidocCall.generate?.resolve

      expect(wrappedResolve).toBeDefined()

      if (wrappedResolve) {
        const result = wrappedResolve('test.css', 'style')
        // Code prepends '/' and adds prefix.uri (which becomes 'base/' with trailing slash)
        expect(result).toBe('/base/test.css')
      }
    })
  })

  describe('uidocAsset helper', () => {
    it('should add page asset to UIDoc', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      resolved.uidocAsset('styles.css', 'page')

      expect(mockAddAsset).toHaveBeenCalledWith({
        src: 'styles.css',
        type: 'style',
        attrs: undefined,
      })
    })

    it('should add example asset to UIDoc', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      resolved.uidocAsset('script.js', 'example')

      expect(mockAddExampleAsset).toHaveBeenCalledWith({
        src: 'script.js',
        type: 'script',
        attrs: undefined,
      })
    })

    it('should pass custom type when provided', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      resolved.uidocAsset('custom.asset', 'page', { type: 'style' })

      expect(mockAddAsset).toHaveBeenCalledWith({
        src: 'custom.asset',
        type: 'style',
        attrs: undefined,
      })
    })

    it('should pass attrs when provided', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      resolved.uidocAsset('styles.css', 'page', { attrs: { media: 'print' } })

      expect(mockAddAsset).toHaveBeenCalledWith({
        src: 'styles.css',
        type: 'style',
        attrs: { media: 'print' },
      })
    })

    it('should add to assetsFromInput when fromInput is true', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      resolved.uidocAsset('bundle.js', 'page', { fromInput: true })

      expect(resolved.assetsFromInput.has('bundle.js')).toBe(true)
      expect(mockAddAsset).toHaveBeenCalledWith({
        src: 'bundle.js',
        type: 'script',
        attrs: undefined,
      })
    })

    it('should not add to UIDoc when type is unresolvable', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      vi.mocked(resolveAssets).mockResolvedValue([])
      vi.mocked(resolveAssetType).mockReturnValue(null)

      const resolved = await resolveOptions(options)

      resolved.uidocAsset('unknown.xyz', 'page')

      expect(mockAddAsset).not.toHaveBeenCalled()
      expect(mockAddExampleAsset).not.toHaveBeenCalled()
    })

    it('should return early when type cannot be resolved and no type provided', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      // Mock resolveAssetType to return null for this test
      const result = resolved.uidocAsset('unknown.xyz', 'page')

      expect(result).toBeUndefined()
    })
  })

  describe('isAssetFromInput helper', () => {
    it('should return true when asset is in set', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      resolved.uidocAsset('test.js', 'page', { fromInput: true })

      expect(resolved.isAssetFromInput('test.js')).toBe(true)
    })

    it('should return false when asset is not in set', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      expect(resolved.isAssetFromInput('test.js')).toBe(false)
    })
  })

  describe('addAssetFromInput helper', () => {
    it('should add asset to set', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      resolved.addAssetFromInput('bundle.js')

      expect(resolved.assetsFromInput.has('bundle.js')).toBe(true)
      expect(resolved.isAssetFromInput('bundle.js')).toBe(true)
    })

    it('should handle multiple assets', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
      }

      const resolved = await resolveOptions(options)

      resolved.addAssetFromInput('bundle1.js')
      resolved.addAssetFromInput('bundle2.js')
      resolved.addAssetFromInput('bundle3.js')

      expect(resolved.assetsFromInput.size).toBe(3)
      expect(resolved.isAssetFromInput('bundle1.js')).toBe(true)
      expect(resolved.isAssetFromInput('bundle2.js')).toBe(true)
      expect(resolved.isAssetFromInput('bundle3.js')).toBe(true)
    })
  })

  describe('default renderer with templatePath', () => {
    beforeEach(() => {
      // Mock dynamic import for html-renderer
      vi.doMock('@ui-doc/html-renderer', () => ({
        // Must be a function, not an arrow: HtmlRenderer is invoked with `new`,
        // and arrows are not constructable.
        // eslint-disable-next-line prefer-arrow-callback
        HtmlRenderer: vi.fn().mockImplementation(function () {
          return mockRenderer
        }),
        NodeParser: {
          init: vi.fn().mockReturnValue({}),
        },
        TemplateLoader: {
          TEMPLATES_PACKAGE: '@ui-doc/html-renderer',
          load: vi
            .fn<typeof import('@ui-doc/html-renderer').TemplateLoader.load>()
            .mockResolvedValue(),
        },
      }))
    })

    it('should load templates when templatePath is provided', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        templatePath: '/custom/templates',
      }

      await resolveOptions(options)

      // Verify UIDoc was created (renderer would be created first)
      expect(UIDoc).toHaveBeenCalled()
    })

    it('should not load templates when templatePath is empty', async () => {
      const options: Options = {
        source: ['src/**/*.ts'],
        templatePath: '',
      }

      await resolveOptions(options)

      expect(UIDoc).toHaveBeenCalled()
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete configuration', async () => {
      const customRenderer: Renderer = {
        generate: vi.fn<Renderer['generate']>().mockReturnValue(''),
      }

      const customBlockParser: BlockParser = {
        parse: vi.fn<BlockParser['parse']>().mockReturnValue([]),
        registerTagTransformer: vi.fn<BlockParser['registerTagTransformer']>(),
      }

      const customResolve = vi.fn((uri: string) => uri)

      const options: Options = {
        source: ['src/**/*.ts', 'lib/**/*.js'],
        renderer: customRenderer,
        blockParser: customBlockParser,
        templatePath: '/templates',
        output: {
          dir: 'dist/docs',
          baseUri: '/ui-doc',
        },
        settings: {
          texts: {
            title: 'My Docs',
          },
          generate: {
            resolve: customResolve,
          },
        },
        assets: {
          static: '/static',
        },
      }

      const resolved = await resolveOptions(options)

      expect(resolved.source).toEqual(['src/**/*.ts', 'lib/**/*.js'])
      expect(resolved.staticAssets).toBe('/static')
      expect(resolved.prefix.path).toBe('dist/docs/')
      expect(resolved.prefix.uri).toBe('/ui-doc/')
      expect(resolved.fileSystem).toBe(mockFileSystem)
      expect(resolved.finder).toBe(mockFileFinder)
      expect(resolved.uidoc).toBe(mockUIDocInstance)

      expect(UIDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          blockParser: customBlockParser,
          renderer: customRenderer,
          texts: {
            title: 'My Docs',
          },
          generate: {
            resolve: expect.any(Function),
          },
        }),
      )
    })
  })
})
