import type { AssetLoader, FileFinder, FileSystem } from '@ui-doc/core'
import type { AssetOption, CopyAssetResolved } from '../src/utils/asset.types'

import type { Options } from '../src/utils/option.types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  resolveAssets,
  resolveAssetType,
  resolveCopyAssets,
  rewriteCssUrls,
} from '../src/utils/asset'

function createMockAssetLoader(overrides: Partial<AssetLoader> = {}): AssetLoader {
  return {
    copy: vi.fn(),
    packageExists: vi.fn(),
    packagePath: vi.fn(),
    read: vi.fn<AssetLoader['read']>().mockResolvedValue(''),
    resolve: vi.fn<AssetLoader['resolve']>().mockResolvedValue(''),
    ...overrides,
  }
}

function createMockFileSystem(overrides: Partial<FileSystem> = {}): FileSystem {
  return {
    createFileFinder: vi.fn(),
    assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(createMockAssetLoader()),
    resolve: vi.fn<FileSystem['resolve']>().mockImplementation((file: string) => file),
    directoryCopy: vi.fn(),
    ensureDirectoryExists: vi.fn(),
    isDirectory: vi.fn(),
    fileRead: vi.fn<FileSystem['fileRead']>().mockResolvedValue('file content'),
    fileWrite: vi.fn(),
    fileCopy: vi.fn(),
    fileExists: vi.fn(),
    fileBasename: vi.fn(),
    fileDirname: vi.fn(),
    ...overrides,
  }
}

describe('asset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('resolveAssetType', () => {
    describe('style extensions', () => {
      it('should return "style" for .css files', () => {
        expect(resolveAssetType('styles.css')).toBe('style')
      })

      it('should return "style" for .less files', () => {
        expect(resolveAssetType('styles.less')).toBe('style')
      })

      it('should return "style" for .sass files', () => {
        expect(resolveAssetType('styles.sass')).toBe('style')
      })

      it('should return "style" for .scss files', () => {
        expect(resolveAssetType('styles.scss')).toBe('style')
      })

      it('should return "style" for files with path', () => {
        expect(resolveAssetType('path/to/file.css')).toBe('style')
      })

      it('should return "style" for files with multiple dots', () => {
        expect(resolveAssetType('my.component.styles.scss')).toBe('style')
      })
    })

    describe('script extensions', () => {
      it('should return "script" for .js files', () => {
        expect(resolveAssetType('bundle.js')).toBe('script')
      })

      it('should return "script" for .ts files', () => {
        expect(resolveAssetType('source.ts')).toBe('script')
      })

      it('should return "script" for files with path', () => {
        expect(resolveAssetType('path/to/script.js')).toBe('script')
      })

      it('should return "script" for files with multiple dots', () => {
        expect(resolveAssetType('my.component.script.ts')).toBe('script')
      })
    })

    describe('unknown extensions', () => {
      it('should return null for .html files', () => {
        expect(resolveAssetType('template.html')).toBeNull()
      })

      it('should return null for .txt files', () => {
        expect(resolveAssetType('readme.txt')).toBeNull()
      })

      it('should return null for .json files', () => {
        expect(resolveAssetType('config.json')).toBeNull()
      })

      it('should return null for files without extension', () => {
        expect(resolveAssetType('Makefile')).toBeNull()
      })
    })

    describe('case sensitivity', () => {
      it('should return null for uppercase .CSS extension', () => {
        expect(resolveAssetType('styles.CSS')).toBeNull()
      })

      it('should return null for mixed case .Css extension', () => {
        expect(resolveAssetType('styles.Css')).toBeNull()
      })

      it('should return null for uppercase .JS extension', () => {
        expect(resolveAssetType('script.JS')).toBeNull()
      })
    })
  })

  describe('resolveAssets', () => {
    describe('built-in assets', () => {
      it('should resolve default built-in assets', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi
            .fn<AssetLoader['read']>()
            .mockResolvedValueOnce('ui-doc-css-content')
            .mockResolvedValueOnce('ui-doc-js-content')
            .mockResolvedValueOnce('highlight-css-content')
            .mockResolvedValueOnce('highlight-js-content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets).toHaveLength(4)
        expect(assets[0]).toMatchObject({
          name: 'ui-doc.css',
          fileName: 'ui-doc.css',
          type: 'style',
          context: 'page',
          originalFileName: '/resolved/ui-doc.min.css',
          source: 'ui-doc-css-content',
        })
        expect(assets[1]).toMatchObject({
          name: 'ui-doc.js',
          fileName: 'ui-doc.js',
          type: 'script',
          context: 'page',
          originalFileName: '/resolved/ui-doc.min.js',
          source: 'ui-doc-js-content',
        })
        expect(assets[2]).toMatchObject({
          name: 'highlight.css',
          fileName: 'highlight.css',
          type: 'style',
          context: 'page',
          originalFileName: '/resolved/highlight.min.css',
          source: 'highlight-css-content',
        })
        expect(assets[3]).toMatchObject({
          name: 'highlight.js',
          fileName: 'highlight.js',
          type: 'script',
          context: 'page',
          originalFileName: '/resolved/highlight.min.js',
          source: 'highlight-js-content',
        })
      })

      it('should disable built-in style asset when styleAsset is false', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi
            .fn<AssetLoader['read']>()
            .mockResolvedValueOnce('ui-doc-js-content')
            .mockResolvedValueOnce('highlight-css-content')
            .mockResolvedValueOnce('highlight-js-content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
          assets: {
            styleAsset: false,
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets).toHaveLength(3)
        expect(assets.find(a => a.name === 'ui-doc.css')).toBeUndefined()
      })

      it('should disable highlight style when highlightStyle is false', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi
            .fn<AssetLoader['read']>()
            .mockResolvedValueOnce('ui-doc-css-content')
            .mockResolvedValueOnce('ui-doc-js-content')
            .mockResolvedValueOnce('highlight-js-content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
          assets: {
            highlightStyle: false,
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets).toHaveLength(3)
        expect(assets.find(a => a.name === 'highlight.css')).toBeUndefined()
      })

      it('should disable highlight script when highlightScript is false', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css'),
          read: vi
            .fn<AssetLoader['read']>()
            .mockResolvedValueOnce('ui-doc-css-content')
            .mockResolvedValueOnce('ui-doc-js-content')
            .mockResolvedValueOnce('highlight-css-content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
          assets: {
            highlightScript: false,
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets).toHaveLength(3)
        expect(assets.find(a => a.name === 'highlight.js')).toBeUndefined()
      })

      it('should use custom highlight theme', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/monokai.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
          assets: {
            highlightTheme: 'monokai',
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(mockAssetLoader.resolve).toHaveBeenCalledWith(
          '@highlightjs/cdn-assets/styles/monokai.min.css',
        )
        expect(assets[2].name).toBe('highlight.css')
      })

      it('should use custom asset names', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
          assets: {
            styleAsset: 'custom-ui-doc.css',
            highlightStyle: 'custom-highlight.css',
            highlightScript: 'custom-highlight.js',
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets.find(a => a.name === 'custom-ui-doc.css')).toBeDefined()
        expect(assets.find(a => a.name === 'custom-highlight.css')).toBeDefined()
        expect(assets.find(a => a.name === 'custom-highlight.js')).toBeDefined()
      })

      it('should filter out assets with null type', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi.fn<AssetLoader['resolve']>().mockResolvedValue('/resolved/file'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
          assets: {
            styleAsset: 'invalid.txt',
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets.find(a => a.name === 'invalid.txt')).toBeUndefined()
      })

      it('should filter out assets with empty resolved file', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets).toHaveLength(3)
        expect(assets.find(a => a.name === 'ui-doc.css')).toBeUndefined()
      })

      it('should filter out assets with undefined resolved file', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets).toHaveLength(3)
        expect(assets.find(a => a.name === 'ui-doc.css')).toBeUndefined()
      })
    })

    describe('custom page assets', () => {
      it('should resolve page asset with string dependency', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js')
            .mockResolvedValueOnce('/resolved/custom.css'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const customAsset: AssetOption = {
          name: 'custom.css',
          dependency: 'package/custom.css',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets).toHaveLength(5)
        expect(assets[4]).toMatchObject({
          name: 'custom.css',
          fileName: 'custom.css',
          type: 'style',
          context: 'page',
          originalFileName: '/resolved/custom.css',
        })
      })

      it('should resolve page asset with function dependency', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js')
            .mockResolvedValueOnce('/resolved/dynamic.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const customAsset: AssetOption = {
          name: 'dynamic.js',
          dependency: () => 'package/dynamic.js',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(mockAssetLoader.resolve).toHaveBeenCalledWith('package/dynamic.js')
        expect(assets[4].name).toBe('dynamic.js')
      })

      it('should resolve page asset with string file option', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
          resolve: vi
            .fn<FileSystem['resolve']>()
            .mockReturnValue('/project/local-file.css'),
          fileRead: vi
            .fn<FileSystem['fileRead']>()
            .mockResolvedValue('local file content'),
        })

        const customAsset: AssetOption = {
          name: 'local.css',
          file: 'local-file.css',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(fileSystem.resolve).toHaveBeenCalledWith('local-file.css')
        expect(fileSystem.fileRead).toHaveBeenCalledWith('/project/local-file.css')
        expect(assets[4]).toMatchObject({
          name: 'local.css',
          originalFileName: '/project/local-file.css',
          source: 'local file content',
        })
      })

      // A `file` may point at something this same build produces. Options are
      // resolved before Rollup starts, so on a clean build that file does not
      // exist yet - throwing here made a first build impossible.
      it('should skip a file asset that cannot be read instead of throwing', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi.fn<AssetLoader['resolve']>().mockResolvedValue('/resolved/built-in'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
          resolve: vi.fn<FileSystem['resolve']>().mockReturnValue('/project/dist/app.css'),
          fileRead: vi
            .fn<FileSystem['fileRead']>()
            .mockRejectedValue(new Error('ENOENT: no such file or directory')),
        })

        const options: Options = {
          source: [],
          assets: {
            example: [{ name: 'app.css', file: 'dist/app.css' }],
          },
        }

        const unreadable: { name: string, file: string }[] = []
        const assets = await resolveAssets(options, fileSystem, [], unreadable)

        expect(assets.some(asset => asset.name === 'app.css')).toBe(false)
        expect(unreadable).toEqual([{ name: 'app.css', file: '/project/dist/app.css' }])
      })

      // Built-in assets ship inside a package. If those cannot be read the
      // installation is broken, and failing loudly is the correct response.
      it('should still throw when a dependency asset cannot be read', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi.fn<AssetLoader['resolve']>().mockResolvedValue('/resolved/dep.css'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
          fileRead: vi
            .fn<FileSystem['fileRead']>()
            .mockRejectedValue(new Error('ENOENT: no such file or directory')),
        })

        const options: Options = {
          source: [],
          assets: {
            page: [{ name: 'dep.css', dependency: 'some-package/dep.css' }],
          },
        }

        await expect(resolveAssets(options, fileSystem)).rejects.toThrow('ENOENT')
      })

      it('should resolve page asset with function file option', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
          resolve: vi
            .fn<FileSystem['resolve']>()
            .mockReturnValue('/project/dynamic-file.js'),
          fileRead: vi
            .fn<FileSystem['fileRead']>()
            .mockResolvedValue('dynamic file content'),
        })

        const customAsset: AssetOption = {
          name: 'dynamic-local.js',
          file: () => 'dynamic-file.js',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(fileSystem.resolve).toHaveBeenCalledWith('dynamic-file.js')
        expect(assets[4].source).toBe('dynamic file content')
      })

      it('should resolve page asset with inline string source', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const customAsset: AssetOption = {
          name: 'inline.css',
          source: 'body { color: red; }',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets[4]).toMatchObject({
          name: 'inline.css',
          source: 'body { color: red; }',
        })
      })

      it('should resolve page asset with inline Uint8Array source', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const binarySource = new Uint8Array([1, 2, 3, 4])
        const customAsset: AssetOption = {
          name: 'binary.dat',
          source: binarySource,
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets[4].source).toBe(binarySource)
      })

      it('should resolve page asset with function source', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const customAsset: AssetOption = {
          name: 'generated.js',
          source: () => 'console.log("generated");',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets[4].source).toBe('console.log("generated");')
      })

      it('should resolve page asset with boolean fromInput flag', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const customAsset: AssetOption = {
          name: 'from-input.js',
          fromInput: true,
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets[4]).toMatchObject({
          name: 'from-input.js',
          fromInput: true,
        })
        expect(assets[4].source).toBeUndefined()
      })

      it('should resolve page asset with function fromInput returning true', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const fromInputFn = vi.fn(() => true)
        const customAsset: AssetOption = {
          name: 'conditional-input.css',
          fromInput: fromInputFn,
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(fromInputFn).toHaveBeenCalled()
        expect(assets[4].fromInput).toBe(true)
      })

      it('should resolve page asset with function fromInput returning false', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js')
            .mockResolvedValueOnce('/resolved/conditional.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
          fileRead: vi.fn<FileSystem['fileRead']>().mockResolvedValue('dependency content'),
        })

        const fromInputFn = vi.fn(() => false)
        const customAsset: AssetOption = {
          name: 'conditional-dep.js',
          dependency: 'package/conditional.js',
          fromInput: fromInputFn,
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(fromInputFn).toHaveBeenCalled()
        expect(assets[4].fromInput).toBeUndefined()
        // When fromInput returns false and dependency is set, source is read from fileSystem.fileRead
        expect(assets[4].source).toBe('dependency content')
      })

      it('should resolve page asset with name as function', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const nameFn = vi.fn(() => 'dynamic-name.css')
        const customAsset: AssetOption = {
          name: nameFn,
          source: 'body {}',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(nameFn).toHaveBeenCalled()
        expect(assets[4].name).toBe('dynamic-name.css')
      })

      it('should resolve page asset with custom attrs', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const customAsset: AssetOption = {
          name: 'with-attrs.js',
          source: 'console.log("test");',
          attrs: {
            defer: 'true',
            type: 'module',
          },
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets[4]).toMatchObject({
          name: 'with-attrs.js',
          attrs: {
            defer: 'true',
            type: 'module',
          },
        })
      })

      it('should resolve page asset with useAssetFileNames option', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const customAsset: AssetOption = {
          name: 'hashed.css',
          source: 'body { color: blue; }',
          useAssetFileNames: true,
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets[4]).toMatchObject({
          name: 'hashed.css',
          useAssetFileNames: true,
        })
      })
    })

    describe('custom example assets', () => {
      it('should resolve example asset with correct context', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const exampleAsset: AssetOption = {
          name: 'example.css',
          source: '.example {}',
        }

        const options: Options = {
          source: [],
          assets: {
            example: [exampleAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets[4]).toMatchObject({
          name: 'example.css',
          context: 'example',
          source: '.example {}',
        })
      })

      it('should resolve multiple example assets', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
          assets: {
            example: [
              { name: 'example1.css', source: '.ex1 {}' },
              { name: 'example2.js', source: 'console.log("ex2");' },
            ],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets).toHaveLength(6)
        expect(assets[4].context).toBe('example')
        expect(assets[5].context).toBe('example')
      })
    })

    describe('mixed page and example assets', () => {
      it('should resolve both page and example assets', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
          assets: {
            page: [{ name: 'page.css', source: '.page {}' }],
            example: [{ name: 'example.js', source: 'console.log("ex");' }],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets).toHaveLength(6)
        expect(assets[4]).toMatchObject({
          name: 'page.css',
          context: 'page',
        })
        expect(assets[5]).toMatchObject({
          name: 'example.js',
          context: 'example',
        })
      })
    })

    describe('asset filtering', () => {
      it('should filter out assets without source or fromInput', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const invalidAsset: AssetOption = {
          name: 'invalid.css',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [invalidAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets).toHaveLength(4)
        expect(assets.find(a => a.name === 'invalid.css')).toBeUndefined()
      })

      it('should include assets with fromInput even without source', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const validAsset: AssetOption = {
          name: 'from-input-only.js',
          fromInput: true,
        }

        const options: Options = {
          source: [],
          assets: {
            page: [validAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets).toHaveLength(5)
        expect(assets[4]).toMatchObject({
          name: 'from-input-only.js',
          fromInput: true,
        })
      })
    })

    describe('asset type resolution', () => {
      it('should set undefined type for assets with null type', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const customAsset: AssetOption = {
          name: 'unknown.dat',
          source: 'binary data',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(assets[4]).toMatchObject({
          name: 'unknown.dat',
          type: undefined,
        })
      })
    })

    describe('file system integration', () => {
      it('should call assetLoader.resolve for dependencies', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js')
            .mockResolvedValueOnce('/resolved/custom-dep.css'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const customAsset: AssetOption = {
          name: 'custom.css',
          dependency: 'package/custom.css',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        await resolveAssets(options, fileSystem)

        expect(mockAssetLoader.resolve).toHaveBeenCalledWith('package/custom.css')
      })

      it('should call fileSystem.resolve for file option', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileResolve = vi
          .fn<FileSystem['resolve']>()
          .mockReturnValue('/project/local.css')

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
          resolve: fileResolve,
          fileRead: vi.fn<FileSystem['fileRead']>().mockResolvedValue('local content'),
        })

        const customAsset: AssetOption = {
          name: 'local.css',
          file: 'local.css',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        await resolveAssets(options, fileSystem)

        expect(fileResolve).toHaveBeenCalledWith('local.css')
      })

      it('should call fileSystem.fileRead when originalFileName is set', async () => {
        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: vi.fn<AssetLoader['read']>().mockResolvedValue('content'),
        })

        const fileRead = vi
          .fn<FileSystem['fileRead']>()
          .mockResolvedValue('local file content')

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
          resolve: vi
            .fn<FileSystem['resolve']>()
            .mockReturnValue('/project/to-read.js'),
          fileRead,
        })

        const customAsset: AssetOption = {
          name: 'to-read.js',
          file: 'to-read.js',
        }

        const options: Options = {
          source: [],
          assets: {
            page: [customAsset],
          },
        }

        await resolveAssets(options, fileSystem)

        expect(fileRead).toHaveBeenCalledWith('/project/to-read.js')
      })

      it('should call assetLoader.read for built-in assets', async () => {
        const mockRead = vi
          .fn<AssetLoader['read']>()
          .mockResolvedValueOnce('ui-doc-css')
          .mockResolvedValueOnce('ui-doc-js')
          .mockResolvedValueOnce('highlight-css')
          .mockResolvedValueOnce('highlight-js')

        const mockAssetLoader = createMockAssetLoader({
          resolve: vi
            .fn<AssetLoader['resolve']>()
            .mockResolvedValueOnce('/resolved/ui-doc.min.css')
            .mockResolvedValueOnce('/resolved/ui-doc.min.js')
            .mockResolvedValueOnce('/resolved/highlight.min.css')
            .mockResolvedValueOnce('/resolved/highlight.min.js'),
          read: mockRead,
        })

        const fileSystem = createMockFileSystem({
          assetLoader: vi.fn<FileSystem['assetLoader']>().mockReturnValue(mockAssetLoader),
        })

        const options: Options = {
          source: [],
        }

        const assets = await resolveAssets(options, fileSystem)

        expect(mockRead).toHaveBeenCalledTimes(4)
        expect(assets[0].source).toBe('ui-doc-css')
        expect(assets[1].source).toBe('ui-doc-js')
        expect(assets[2].source).toBe('highlight-css')
        expect(assets[3].source).toBe('highlight-js')
      })
    })
  })

  describe('resolveCopyAssets', () => {
    it('should return empty array when copyOptions is undefined', async () => {
      const fileSystem = createMockFileSystem()

      const result = await resolveCopyAssets(undefined, fileSystem)

      expect(result).toEqual([])
    })

    it('should return empty array when copyOptions is empty', async () => {
      const fileSystem = createMockFileSystem()

      const result = await resolveCopyAssets([], fileSystem)

      expect(result).toEqual([])
    })

    it('should resolve copy assets with glob pattern', async () => {
      const mockSearch = vi.fn().mockImplementation(async (callback: (file: string) => void) => {
        callback('/project/src/fonts/regular.woff2')
        callback('/project/src/fonts/bold.woff2')
      })

      const mockFileFinder: FileFinder = {
        search: mockSearch,
        matches: vi.fn(),
        directories: vi.fn(),
      }

      const fileSystem = createMockFileSystem({
        createFileFinder: vi.fn().mockReturnValue(mockFileFinder),
        resolve: vi.fn().mockImplementation((file: string) => `/project/${file}`),
      })

      const result = await resolveCopyAssets(
        [{ from: 'src/fonts/**/*', to: 'fonts' }],
        fileSystem,
      )

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        sourcePath: '/project/src/fonts/regular.woff2',
        outputPath: 'fonts/regular.woff2',
      })
      expect(result[1]).toMatchObject({
        sourcePath: '/project/src/fonts/bold.woff2',
        outputPath: 'fonts/bold.woff2',
      })
    })

    it('should use relative path only when to is undefined', async () => {
      const mockSearch = vi.fn().mockImplementation(async (callback: (file: string) => void) => {
        callback('/project/public/images/logo.svg')
      })

      const mockFileFinder: FileFinder = {
        search: mockSearch,
        matches: vi.fn(),
        directories: vi.fn(),
      }

      const fileSystem = createMockFileSystem({
        createFileFinder: vi.fn().mockReturnValue(mockFileFinder),
        resolve: vi.fn().mockImplementation((file: string) => `/project/${file}`),
      })

      const result = await resolveCopyAssets(
        [{ from: 'public/**/*' }],
        fileSystem,
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        sourcePath: '/project/public/images/logo.svg',
        outputPath: 'images/logo.svg',
      })
    })

    it('should handle multiple copy options', async () => {
      const mockSearch = vi.fn()
        .mockImplementationOnce(async (callback: (file: string) => void) => {
          callback('/project/src/fonts/font.woff2')
        })
        .mockImplementationOnce(async (callback: (file: string) => void) => {
          callback('/project/src/images/icon.svg')
        })

      const mockFileFinder: FileFinder = {
        search: mockSearch,
        matches: vi.fn(),
        directories: vi.fn(),
      }

      const fileSystem = createMockFileSystem({
        createFileFinder: vi.fn().mockReturnValue(mockFileFinder),
        resolve: vi.fn().mockImplementation((file: string) => `/project/${file}`),
      })

      const result = await resolveCopyAssets(
        [
          { from: 'src/fonts/**/*', to: 'fonts' },
          { from: 'src/images/**/*', to: 'images' },
        ],
        fileSystem,
      )

      expect(result).toHaveLength(2)
      expect(result[0].outputPath).toBe('fonts/font.woff2')
      expect(result[1].outputPath).toBe('images/icon.svg')
    })
  })

  describe('rewriteCssUrls', () => {
    interface AssetInput { source: string, output: string }
    const createCopyAssets = (assets: AssetInput[]): CopyAssetResolved[] =>
      assets.map(({ source, output }) => ({
        sourcePath: source,
        outputPath: output,
      }))

    it('should return original content when copyAssets is empty', () => {
      const css = 'body { background: url("./images/bg.png"); }'

      const result = rewriteCssUrls(css, '/project/src/styles.css', [])

      expect(result).toBe(css)
    })

    it('should rewrite quoted url() references', () => {
      const css = '@font-face { src: url("../fonts/font.woff2"); }'
      const copyAssets = createCopyAssets([
        { source: '/project/fonts/font.woff2', output: 'assets/fonts/font.woff2' },
      ])

      const result = rewriteCssUrls(css, '/project/src/styles.css', copyAssets)

      expect(result).toBe('@font-face { src: url("./assets/fonts/font.woff2"); }')
    })

    it('should rewrite single-quoted url() references', () => {
      const css = '.icon { background: url(\'./images/icon.svg\'); }'
      const copyAssets = createCopyAssets([
        { source: '/project/src/images/icon.svg', output: 'images/icon.svg' },
      ])

      const result = rewriteCssUrls(css, '/project/src/styles.css', copyAssets)

      expect(result).toBe('.icon { background: url(\'./images/icon.svg\'); }')
    })

    it('should rewrite unquoted url() references', () => {
      const css = 'body { background: url(images/bg.png); }'
      const copyAssets = createCopyAssets([
        { source: '/project/src/images/bg.png', output: 'static/bg.png' },
      ])

      const result = rewriteCssUrls(css, '/project/src/styles.css', copyAssets)

      expect(result).toBe('body { background: url(./static/bg.png); }')
    })

    it('should skip data URIs', () => {
      const css = 'body { background: url("data:image/png;base64,ABC123"); }'
      const copyAssets = createCopyAssets([
        { source: '/project/data:image/png;base64,ABC123', output: 'invalid.png' },
      ])

      const result = rewriteCssUrls(css, '/project/src/styles.css', copyAssets)

      expect(result).toBe(css)
    })

    it('should skip http URLs', () => {
      const css = 'body { background: url("http://example.com/image.png"); }'
      const copyAssets = createCopyAssets([
        { source: '/project/http://example.com/image.png', output: 'image.png' },
      ])

      const result = rewriteCssUrls(css, '/project/src/styles.css', copyAssets)

      expect(result).toBe(css)
    })

    it('should skip https URLs', () => {
      const css = 'body { background: url("https://example.com/image.png"); }'
      const copyAssets = createCopyAssets([])

      const result = rewriteCssUrls(css, '/project/src/styles.css', copyAssets)

      expect(result).toBe(css)
    })

    it('should skip protocol-relative URLs', () => {
      const css = 'body { background: url("//example.com/image.png"); }'
      const copyAssets = createCopyAssets([])

      const result = rewriteCssUrls(css, '/project/src/styles.css', copyAssets)

      expect(result).toBe(css)
    })

    it('should not modify urls that do not match copy assets', () => {
      const css = 'body { background: url("./unknown.png"); }'
      const copyAssets = createCopyAssets([
        { source: '/project/src/other.png', output: 'other.png' },
      ])

      const result = rewriteCssUrls(css, '/project/src/styles.css', copyAssets)

      expect(result).toBe(css)
    })

    it('should rewrite multiple url() references in same file', () => {
      const css = `
        @font-face { src: url("../fonts/regular.woff2"); }
        @font-face { src: url("../fonts/bold.woff2"); }
      `
      const copyAssets = createCopyAssets([
        { source: '/project/fonts/regular.woff2', output: 'fonts/regular.woff2' },
        { source: '/project/fonts/bold.woff2', output: 'fonts/bold.woff2' },
      ])

      const result = rewriteCssUrls(css, '/project/src/styles.css', copyAssets)

      expect(result).toContain('url("./fonts/regular.woff2")')
      expect(result).toContain('url("./fonts/bold.woff2")')
    })
  })
})
