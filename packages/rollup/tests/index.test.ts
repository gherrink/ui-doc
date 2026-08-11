import type {
  FileFinder,
  FileFinderOnFoundCallback,
  FileSystem,
  OutputCallback,
  UIDoc,
} from '@ui-doc/core'
import { BlockParseError } from '@ui-doc/core'
import type {
  InputOptions,
  NormalizedInputOptions,
  NormalizedOutputOptions,
  OutputBundle,
  PluginContext,
} from 'rollup'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Options } from '../src'
import uidocPlugin, { PLUGIN_NAME } from '../src'
import { resolveOptions } from '../src/utils/option'
import type { ResolvedOptions } from '../src/utils/option.types'

// Mock dependencies
vi.mock('../src/utils/option', () => ({
  resolveOptions: vi.fn<typeof import('../src/utils/option').resolveOptions>(),
}))

describe('uidocPlugin', () => {
  let mockFileFinder: FileFinder
  let mockFileSystem: FileSystem
  let mockUidoc: UIDoc
  let mockResolvedOptions: ResolvedOptions
  let mockPluginContext: PluginContext

  // Individual mock functions for verification
  let mockSearch: ReturnType<typeof vi.fn<FileFinder['search']>>
  let mockMatches: ReturnType<typeof vi.fn<FileFinder['matches']>>
  let mockDirectories: ReturnType<typeof vi.fn<FileFinder['directories']>>
  let mockFileRead: ReturnType<typeof vi.fn<FileSystem['fileRead']>>
  let mockFileCopy: ReturnType<typeof vi.fn<FileSystem['fileCopy']>>
  let mockFileExists: ReturnType<typeof vi.fn<FileSystem['fileExists']>>
  let mockFileDirname: ReturnType<typeof vi.fn<FileSystem['fileDirname']>>
  let mockEnsureDirectoryExists: ReturnType<typeof vi.fn<FileSystem['ensureDirectoryExists']>>
  let mockDirectoryCopy: ReturnType<typeof vi.fn<FileSystem['directoryCopy']>>
  let mockSourceExists: ReturnType<typeof vi.fn<UIDoc['sourceExists']>>
  let mockSourceCreate: ReturnType<typeof vi.fn<UIDoc['sourceCreate']>>
  let mockSourceUpdate: ReturnType<typeof vi.fn<UIDoc['sourceUpdate']>>
  let mockSourceDelete: ReturnType<typeof vi.fn<UIDoc['sourceDelete']>>
  let mockOutput: ReturnType<typeof vi.fn<UIDoc['output']>>
  let mockWarn: ReturnType<typeof vi.fn<PluginContext['warn']>>
  let mockInfo: ReturnType<typeof vi.fn<PluginContext['info']>>
  let mockEmitFile: ReturnType<typeof vi.fn<PluginContext['emitFile']>>
  let mockGetWatchFiles: ReturnType<typeof vi.fn<PluginContext['getWatchFiles']>>
  let mockAddWatchFile: ReturnType<typeof vi.fn<PluginContext['addWatchFile']>>

  beforeEach(() => {
    vi.clearAllMocks()

    // Create individual mock functions
    mockSearch = vi.fn<FileFinder['search']>().mockResolvedValue(undefined)
    mockMatches = vi.fn<FileFinder['matches']>().mockReturnValue(false)
    mockDirectories = vi.fn<FileFinder['directories']>().mockReturnValue([])
    mockFileRead = vi.fn<FileSystem['fileRead']>().mockResolvedValue('file content')
    mockFileCopy = vi.fn<FileSystem['fileCopy']>().mockResolvedValue(true)
    mockFileExists = vi.fn<FileSystem['fileExists']>().mockResolvedValue(false)
    mockFileDirname = vi.fn<FileSystem['fileDirname']>().mockReturnValue('/path/to')
    mockEnsureDirectoryExists = vi.fn<FileSystem['ensureDirectoryExists']>().mockResolvedValue(true)
    mockDirectoryCopy = vi.fn<FileSystem['directoryCopy']>().mockResolvedValue(true)
    mockSourceExists = vi.fn<UIDoc['sourceExists']>().mockReturnValue(false)
    mockSourceCreate = vi.fn<UIDoc['sourceCreate']>()
    mockSourceUpdate = vi.fn<UIDoc['sourceUpdate']>()
    mockSourceDelete = vi.fn<UIDoc['sourceDelete']>()
    mockOutput = vi.fn<UIDoc['output']>().mockResolvedValue(undefined)
    mockWarn = vi.fn<PluginContext['warn']>()
    mockInfo = vi.fn<PluginContext['info']>()
    mockEmitFile = vi.fn<PluginContext['emitFile']>().mockReturnValue('asset-ref')
    mockGetWatchFiles = vi.fn<PluginContext['getWatchFiles']>().mockReturnValue([])
    mockAddWatchFile = vi.fn<PluginContext['addWatchFile']>()

    // Mock FileFinder
    mockFileFinder = {
      search: mockSearch,
      matches: mockMatches,
      directories: mockDirectories,
    }

    // Mock FileSystem
    mockFileSystem = {
      fileRead: mockFileRead,
      fileCopy: mockFileCopy,
      fileExists: mockFileExists,
      fileDirname: mockFileDirname,
      ensureDirectoryExists: mockEnsureDirectoryExists,
      directoryCopy: mockDirectoryCopy,
    } as unknown as FileSystem

    // Mock UIDoc
    mockUidoc = {
      sourceExists: mockSourceExists,
      sourceCreate: mockSourceCreate,
      sourceUpdate: mockSourceUpdate,
      sourceDelete: mockSourceDelete,
      output: mockOutput,
      addAsset: vi.fn<UIDoc['addAsset']>(),
      addExampleAsset: vi.fn<UIDoc['addExampleAsset']>(),
    } as unknown as UIDoc

    // Mock ResolvedOptions
    mockResolvedOptions = {
      assets: [],
      unreadableAssets: [],
      assetsFromInput: new Set<string>(),
      copyAssets: [],
      staticAssets: undefined,
      fileSystem: mockFileSystem,
      finder: mockFileFinder,
      prefix: { path: '', uri: '' },
      uidoc: mockUidoc,
      source: ['src/**/*.css'],
      uidocAsset: vi.fn<ResolvedOptions['uidocAsset']>(),
      isAssetFromInput: vi.fn<ResolvedOptions['isAssetFromInput']>().mockReturnValue(false),
      addAssetFromInput: vi.fn<ResolvedOptions['addAssetFromInput']>(),
    }

    // Mock PluginContext
    mockPluginContext = {
      warn: mockWarn,
      info: mockInfo,
      emitFile: mockEmitFile,
      getWatchFiles: mockGetWatchFiles,
      addWatchFile: mockAddWatchFile,
    } as unknown as PluginContext

    vi.mocked(resolveOptions).mockResolvedValue(mockResolvedOptions)
  })

  describe('plugin factory', () => {
    it('should return plugin with name="ui-doc"', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.name).toBe(PLUGIN_NAME)
    })

    it('should return plugin with version', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.version).toBeDefined()
      expect(typeof plugin.version).toBe('string')
    })

    it('should call resolveOptions with raw options', async () => {
      const rawOptions: Options = { source: ['src/**/*.css'] }

      await uidocPlugin(rawOptions)

      expect(resolveOptions).toHaveBeenCalledWith(rawOptions)
    })
  })

  describe('api', () => {
    it('should expose version', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.api?.version).toBeDefined()
      expect(typeof plugin.api?.version).toBe('string')
    })

    it('should expose fileFinder getter', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.api?.fileFinder).toBe(mockFileFinder)
    })

    it('should expose fileSystem getter', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.api?.fileSystem).toBe(mockFileSystem)
    })

    it('should expose options getter', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.api?.options).toBe(mockResolvedOptions)
    })

    it('should expose uidoc getter', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.api?.uidoc).toBe(mockUidoc)
    })

    it('should expose uidocAsset method', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.api?.uidocAsset).toBe(mockResolvedOptions.uidocAsset)
    })

    it('should expose isAssetFromInput method', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.api?.isAssetFromInput).toBe(mockResolvedOptions.isAssetFromInput)
    })

    it('should expose addAssetFromInput method', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.api?.addAssetFromInput).toBe(mockResolvedOptions.addAssetFromInput)
    })
  })

  describe('buildStart', () => {
    it('should add watch files for new sources', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockSearch.mockImplementation(async (callback: FileFinderOnFoundCallback) => {
        await callback('file1.css')
        await callback('file2.css')
      })

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, {} as NormalizedInputOptions)

      expect(mockAddWatchFile).toHaveBeenCalledWith('file1.css')
      expect(mockAddWatchFile).toHaveBeenCalledWith('file2.css')
      expect(mockAddWatchFile).toHaveBeenCalledTimes(2)
    })

    it('should skip already watched sources', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockGetWatchFiles.mockReturnValue(['file1.css'])
      mockSearch.mockImplementation(async (callback: FileFinderOnFoundCallback) => {
        await callback('file1.css')
        await callback('file2.css')
      })

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, {} as NormalizedInputOptions)

      expect(mockAddWatchFile).toHaveBeenCalledWith('file2.css')
      expect(mockAddWatchFile).toHaveBeenCalledTimes(1)
    })

    it('should create source for new files', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockSearch.mockImplementation(async (callback: FileFinderOnFoundCallback) => {
        await callback('file1.css')
      })
      mockFileRead.mockResolvedValue('content')

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, {} as NormalizedInputOptions)

      expect(mockFileRead).toHaveBeenCalledWith('file1.css')
      expect(mockSourceCreate).toHaveBeenCalledWith('file1.css', 'content')
    })

    it('should skip already existing sources', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockSourceExists.mockReturnValue(true)
      mockSearch.mockImplementation(async (callback: FileFinderOnFoundCallback) => {
        await callback('file1.css')
      })

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, {} as NormalizedInputOptions)

      expect(mockFileRead).not.toHaveBeenCalled()
      expect(mockSourceCreate).not.toHaveBeenCalled()
    })

    it('should resolve assets with fromInput from inputOptions.input object', async () => {
      mockResolvedOptions.assets = [
        {
          name: 'main',
          fileName: 'main.js',
          context: 'example',
          fromInput: true,
        },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const inputOptions: InputOptions = {
        input: {
          main: '/path/to/src/main.js',
        },
      }

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, inputOptions as NormalizedInputOptions)

      const asset = mockResolvedOptions.assets[0]
      expect(asset.fileName).toBe('path/to/src/main.js')
      expect(asset.originalFileName).toBe('/path/to/src/main.js')
    })

    it('should handle array input gracefully', async () => {
      mockResolvedOptions.assets = [
        {
          name: 'main',
          fileName: 'main.js',
          context: 'example',
          fromInput: true,
        },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const inputOptions: InputOptions = {
        input: ['src/main.js'],
      }

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, inputOptions as NormalizedInputOptions)

      const asset = mockResolvedOptions.assets[0]
      expect(asset.fileName).toBe('main.js')
      expect(asset.originalFileName).toBeUndefined()
    })

    it('should warn about assets whose configured file could not be read', async () => {
      mockResolvedOptions.unreadableAssets = [{ name: 'app.css', file: '/project/dist/app.css' }]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, {} as NormalizedInputOptions)

      expect(mockPluginContext.warn).toHaveBeenCalledWith(
        expect.stringContaining('Asset "app.css" could not be read from "/project/dist/app.css"'),
      )
    })

    it('should not warn when every asset was readable', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, {} as NormalizedInputOptions)

      expect(mockPluginContext.warn).not.toHaveBeenCalled()
    })

    it('should handle null input gracefully', async () => {
      mockResolvedOptions.assets = [
        {
          name: 'main',
          fileName: 'main.js',
          context: 'example',
          fromInput: true,
        },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const inputOptions: InputOptions = {
        input: null as unknown as string,
      }

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, inputOptions as NormalizedInputOptions)

      const asset = mockResolvedOptions.assets[0]
      expect(asset.fileName).toBe('main.js')
      expect(asset.originalFileName).toBeUndefined()
    })

    it('should catch BlockParseError and call context.warn', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const error = new BlockParseError({
        message: 'Parse error',
        code: 'ERR_CODE',
        line: 10,
        column: 5,
        source: 'file1.css',
      })

      mockSearch.mockImplementation(async (callback: FileFinderOnFoundCallback) => {
        await callback('file1.css')
      })
      mockSourceCreate.mockImplementation(() => {
        throw error
      })

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, {} as NormalizedInputOptions)

      expect(mockWarn).toHaveBeenCalledWith({
        cause: error,
        loc: { column: 0, file: 'file1.css', line: 10 },
        message: 'Parse error',
        stack: 'ERR_CODE',
      })
    })

    it('should rethrow non-BlockParseError', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const error = new Error('Generic error')

      mockSearch.mockImplementation(async (callback: FileFinderOnFoundCallback) => {
        await callback('file1.css')
      })
      mockSourceCreate.mockImplementation(() => {
        throw error
      })

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>

      await expect(
        buildStart.call(mockPluginContext, {} as NormalizedInputOptions),
      ).rejects.toThrow('Generic error')

      expect(mockWarn).not.toHaveBeenCalled()
    })

    it('should add watch files for source directories', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockDirectories.mockReturnValue(['/path/to/src', '/path/to/lib'])

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, {} as NormalizedInputOptions)

      expect(mockDirectories).toHaveBeenCalled()
      expect(mockAddWatchFile).toHaveBeenCalledWith('/path/to/src')
      expect(mockAddWatchFile).toHaveBeenCalledWith('/path/to/lib')
    })

    it('should skip already watched directories', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockGetWatchFiles.mockReturnValue(['/path/to/src'])
      mockDirectories.mockReturnValue(['/path/to/src', '/path/to/lib'])

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, {} as NormalizedInputOptions)

      expect(mockAddWatchFile).not.toHaveBeenCalledWith('/path/to/src')
      expect(mockAddWatchFile).toHaveBeenCalledWith('/path/to/lib')
    })
  })

  describe('generateBundle', () => {
    it('should emit assets with source using this.emitFile', async () => {
      mockResolvedOptions.assets = [
        {
          name: 'styles',
          fileName: 'styles.css',
          context: 'page',
          source: 'body { color: red; }',
        },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      type GenerateBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
        isWrite: boolean,
      ) => Promise<void>
      const generateBundle = plugin.generateBundle as GenerateBundleHook
      await generateBundle.call(mockPluginContext, {} as NormalizedOutputOptions, {}, false)

      expect(mockEmitFile).toHaveBeenCalledWith({
        name: 'styles',
        fileName: 'styles.css',
        source: 'body { color: red; }',
        type: 'asset',
      })
    })

    it('should skip assets without source', async () => {
      mockResolvedOptions.assets = [
        {
          name: 'styles',
          fileName: 'styles.css',
          context: 'page',
        },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      type GenerateBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
        isWrite: boolean,
      ) => Promise<void>
      const generateBundle = plugin.generateBundle as GenerateBundleHook
      await generateBundle.call(mockPluginContext, {} as NormalizedOutputOptions, {}, false)

      expect(mockEmitFile).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'styles' }))
    })

    it('should call uidocAsset for all assets', async () => {
      mockResolvedOptions.assets = [
        {
          name: 'styles',
          fileName: 'styles.css',
          context: 'page',
          attrs: { rel: 'stylesheet' },
          type: 'style',
          fromInput: true,
        },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      type GenerateBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
        isWrite: boolean,
      ) => Promise<void>
      const generateBundle = plugin.generateBundle as GenerateBundleHook
      await generateBundle.call(mockPluginContext, {} as NormalizedOutputOptions, {}, false)

      expect(mockResolvedOptions.uidocAsset).toHaveBeenCalledWith('styles.css', 'page', {
        attrs: { rel: 'stylesheet' },
        fromInput: true,
        type: 'style',
      })
    })

    it('should call uidoc.output and emit generated files', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockOutput.mockImplementation(async (callback: OutputCallback) => {
        await callback('index.html', '<html>Index</html>')
        await callback('page.html', '<html>Page</html>')
      })

      type GenerateBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
        isWrite: boolean,
      ) => Promise<void>
      const generateBundle = plugin.generateBundle as GenerateBundleHook
      await generateBundle.call(mockPluginContext, {} as NormalizedOutputOptions, {}, false)

      expect(mockOutput).toHaveBeenCalledWith(expect.any(Function))
      expect(mockEmitFile).toHaveBeenCalledWith({
        fileName: 'index.html',
        source: '<html>Index</html>',
        type: 'asset',
      })
      expect(mockEmitFile).toHaveBeenCalledWith({
        fileName: 'page.html',
        source: '<html>Page</html>',
        type: 'asset',
      })
    })

    it('should prefix filenames with prefix.path', async () => {
      mockResolvedOptions.prefix = { path: 'ui-doc/', uri: 'ui-doc/' }
      mockResolvedOptions.assets = [
        {
          name: 'styles',
          fileName: 'styles.css',
          context: 'page',
          source: 'body { color: red; }',
        },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockOutput.mockImplementation(async (callback: OutputCallback) => {
        await callback('index.html', '<html>Index</html>')
      })

      type GenerateBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
        isWrite: boolean,
      ) => Promise<void>
      const generateBundle = plugin.generateBundle as GenerateBundleHook
      await generateBundle.call(mockPluginContext, {} as NormalizedOutputOptions, {}, false)

      expect(mockEmitFile).toHaveBeenCalledWith({
        name: 'styles',
        fileName: 'ui-doc/styles.css',
        source: 'body { color: red; }',
        type: 'asset',
      })
      expect(mockEmitFile).toHaveBeenCalledWith({
        fileName: 'ui-doc/index.html',
        source: '<html>Index</html>',
        type: 'asset',
      })
    })

    it('should call context.info for each emitted asset', async () => {
      mockResolvedOptions.assets = [
        {
          name: 'styles',
          fileName: 'styles.css',
          context: 'page',
          source: 'body { color: red; }',
          originalFileName: 'src/styles.css',
        },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      type GenerateBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
        isWrite: boolean,
      ) => Promise<void>
      const generateBundle = plugin.generateBundle as GenerateBundleHook
      await generateBundle.call(mockPluginContext, {} as NormalizedOutputOptions, {}, false)

      expect(mockInfo).toHaveBeenCalledWith({
        code: 'OUTPUT',
        message: 'styles.css from src/styles.css',
      })
    })

    it('should emit asset without explicit fileName when useAssetFileNames is true', async () => {
      mockResolvedOptions.assets = [
        {
          name: 'hashed',
          fileName: 'hashed.css',
          context: 'page',
          source: 'body { color: blue; }',
          useAssetFileNames: true,
        },
      ]

      mockEmitFile.mockReturnValue('ref-123')
      const mockGetFileName = vi
        .fn<PluginContext['getFileName']>()
        .mockReturnValue('hashed-abc123.css')
      mockPluginContext.getFileName = mockGetFileName

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      type GenerateBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
        isWrite: boolean,
      ) => Promise<void>
      const generateBundle = plugin.generateBundle as GenerateBundleHook
      await generateBundle.call(mockPluginContext, {} as NormalizedOutputOptions, {}, false)

      expect(mockEmitFile).toHaveBeenCalledWith({
        name: 'hashed',
        source: 'body { color: blue; }',
        type: 'asset',
      })
      expect(mockGetFileName).toHaveBeenCalledWith('ref-123')
      expect(mockResolvedOptions.uidocAsset).toHaveBeenCalledWith('hashed-abc123.css', 'page', {
        attrs: undefined,
        fromInput: false,
        type: undefined,
      })
    })

    it('should strip prefix.path from getFileName result when useAssetFileNames is true', async () => {
      mockResolvedOptions.prefix = { path: 'ui-doc/', uri: 'ui-doc/' }
      mockResolvedOptions.assets = [
        {
          name: 'hashed',
          fileName: 'hashed.css',
          context: 'page',
          source: 'body { color: blue; }',
          useAssetFileNames: true,
        },
      ]

      mockEmitFile.mockReturnValue('ref-456')
      const mockGetFileName = vi
        .fn<PluginContext['getFileName']>()
        .mockReturnValue('ui-doc/hashed-xyz789.css')
      mockPluginContext.getFileName = mockGetFileName

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      type GenerateBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
        isWrite: boolean,
      ) => Promise<void>
      const generateBundle = plugin.generateBundle as GenerateBundleHook
      await generateBundle.call(mockPluginContext, {} as NormalizedOutputOptions, {}, false)

      expect(mockEmitFile).toHaveBeenCalledWith({
        name: 'ui-doc/hashed',
        source: 'body { color: blue; }',
        type: 'asset',
      })
      expect(mockResolvedOptions.uidocAsset).toHaveBeenCalledWith('hashed-xyz789.css', 'page', {
        attrs: undefined,
        fromInput: false,
        type: undefined,
      })
    })
  })

  describe('writeBundle', () => {
    it('should skip when outputOptions.dir undefined', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      type WriteBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
      ) => Promise<void>
      const writeBundle = plugin.writeBundle as WriteBundleHook
      await writeBundle.call(mockPluginContext, { dir: undefined } as NormalizedOutputOptions, {})

      expect(mockFileCopy).not.toHaveBeenCalled()
      expect(mockDirectoryCopy).not.toHaveBeenCalled()
    })

    it('should skip when outputOptions.dir empty', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      type WriteBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
      ) => Promise<void>
      const writeBundle = plugin.writeBundle as WriteBundleHook
      await writeBundle.call(mockPluginContext, { dir: '' } as NormalizedOutputOptions, {})

      expect(mockFileCopy).not.toHaveBeenCalled()
      expect(mockDirectoryCopy).not.toHaveBeenCalled()
    })

    it('should copy assets from input when prefix.path not empty', async () => {
      mockResolvedOptions.prefix = { path: 'ui-doc/', uri: 'ui-doc/' }
      mockResolvedOptions.assetsFromInput.add('main.js')
      mockResolvedOptions.assetsFromInput.add('styles.css')

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockFileDirname.mockReturnValue('dist/ui-doc')

      type WriteBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
      ) => Promise<void>
      const writeBundle = plugin.writeBundle as WriteBundleHook
      await writeBundle.call(mockPluginContext, { dir: 'dist' } as NormalizedOutputOptions, {})

      expect(mockEnsureDirectoryExists).toHaveBeenCalledWith('dist/ui-doc')
      expect(mockFileCopy).toHaveBeenCalledWith('dist/main.js', 'dist/ui-doc/main.js')
      expect(mockFileCopy).toHaveBeenCalledWith('dist/styles.css', 'dist/ui-doc/styles.css')
    })

    it('should copy source maps when they exist alongside assets', async () => {
      mockResolvedOptions.prefix = { path: 'ui-doc/', uri: 'ui-doc/' }
      mockResolvedOptions.assetsFromInput.add('main.js')

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockFileDirname.mockReturnValue('dist/ui-doc')
      mockFileExists.mockResolvedValue(true)

      type WriteBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
      ) => Promise<void>
      const writeBundle = plugin.writeBundle as WriteBundleHook
      await writeBundle.call(mockPluginContext, { dir: 'dist' } as NormalizedOutputOptions, {})

      expect(mockFileExists).toHaveBeenCalledWith('dist/main.js.map')
      expect(mockFileCopy).toHaveBeenCalledWith('dist/main.js', 'dist/ui-doc/main.js')
      expect(mockFileCopy).toHaveBeenCalledWith('dist/main.js.map', 'dist/ui-doc/main.js.map')
    })

    it('should not copy source maps when they do not exist', async () => {
      mockResolvedOptions.prefix = { path: 'ui-doc/', uri: 'ui-doc/' }
      mockResolvedOptions.assetsFromInput.add('main.js')

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockFileDirname.mockReturnValue('dist/ui-doc')
      mockFileExists.mockResolvedValue(false)

      type WriteBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
      ) => Promise<void>
      const writeBundle = plugin.writeBundle as WriteBundleHook
      await writeBundle.call(mockPluginContext, { dir: 'dist' } as NormalizedOutputOptions, {})

      expect(mockFileExists).toHaveBeenCalledWith('dist/main.js.map')
      expect(mockFileCopy).toHaveBeenCalledWith('dist/main.js', 'dist/ui-doc/main.js')
      expect(mockFileCopy).not.toHaveBeenCalledWith('dist/main.js.map', 'dist/ui-doc/main.js.map')
    })

    it('should copy static assets when defined', async () => {
      mockResolvedOptions.staticAssets = 'public/assets'

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      type WriteBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
      ) => Promise<void>
      const writeBundle = plugin.writeBundle as WriteBundleHook
      await writeBundle.call(mockPluginContext, { dir: 'dist' } as NormalizedOutputOptions, {})

      expect(mockDirectoryCopy).toHaveBeenCalledWith('public/assets', 'dist/')
      expect(mockInfo).toHaveBeenCalledWith({
        code: 'OUTPUT',
        message: 'copying assets from public/assets',
      })
    })

    it('should not copy static assets when empty', async () => {
      mockResolvedOptions.staticAssets = ''

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      type WriteBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
      ) => Promise<void>
      const writeBundle = plugin.writeBundle as WriteBundleHook
      await writeBundle.call(mockPluginContext, { dir: 'dist' } as NormalizedOutputOptions, {})

      expect(mockDirectoryCopy).not.toHaveBeenCalled()
    })

    it('should use Promise.all for parallel operations', async () => {
      mockResolvedOptions.prefix = { path: 'ui-doc/', uri: 'ui-doc/' }
      mockResolvedOptions.assetsFromInput.add('main.js')
      mockResolvedOptions.staticAssets = 'public/assets'

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      type WriteBundleHook = (
        options: NormalizedOutputOptions,
        bundle: OutputBundle,
      ) => Promise<void>
      const writeBundle = plugin.writeBundle as WriteBundleHook
      await writeBundle.call(mockPluginContext, { dir: 'dist' } as NormalizedOutputOptions, {})

      expect(mockFileCopy).toHaveBeenCalled()
      expect(mockDirectoryCopy).toHaveBeenCalled()
    })
  })

  describe('watchChange', () => {
    it('should update existing source on "update" event', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockSourceExists.mockReturnValue(true)
      mockFileRead.mockResolvedValue('updated content')

      type WatchChangeHook = (
        id: string,
        change: { event: 'update' | 'delete' | 'create' },
      ) => Promise<void>
      const watchChange = plugin.watchChange as WatchChangeHook
      await watchChange.call(mockPluginContext, 'file1.css', { event: 'update' })

      expect(mockFileRead).toHaveBeenCalledWith('file1.css')
      expect(mockSourceUpdate).toHaveBeenCalledWith('file1.css', 'updated content')
    })

    it('should delete existing source on "delete" event', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockSourceExists.mockReturnValue(true)

      type WatchChangeHook = (
        id: string,
        change: { event: 'update' | 'delete' | 'create' },
      ) => Promise<void>
      const watchChange = plugin.watchChange as WatchChangeHook
      await watchChange.call(mockPluginContext, 'file1.css', { event: 'delete' })

      expect(mockSourceDelete).toHaveBeenCalledWith('file1.css')
      expect(mockFileRead).not.toHaveBeenCalled()
    })

    it('should create new matching source on "create" event', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockSourceExists.mockReturnValue(false)
      mockMatches.mockReturnValue(true)
      mockFileRead.mockResolvedValue('new content')

      type WatchChangeHook = (
        id: string,
        change: { event: 'update' | 'delete' | 'create' },
      ) => Promise<void>
      const watchChange = plugin.watchChange as WatchChangeHook
      await watchChange.call(mockPluginContext, 'file1.css', { event: 'create' })

      expect(mockMatches).toHaveBeenCalledWith('file1.css')
      expect(mockFileRead).toHaveBeenCalledWith('file1.css')
      expect(mockSourceCreate).toHaveBeenCalledWith('file1.css', 'new content')
    })

    it('should create new matching source on "update" event when not existing', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockSourceExists.mockReturnValue(false)
      mockMatches.mockReturnValue(true)
      mockFileRead.mockResolvedValue('new content')

      type WatchChangeHook = (
        id: string,
        change: { event: 'update' | 'delete' | 'create' },
      ) => Promise<void>
      const watchChange = plugin.watchChange as WatchChangeHook
      await watchChange.call(mockPluginContext, 'file1.css', { event: 'update' })

      expect(mockMatches).toHaveBeenCalledWith('file1.css')
      expect(mockSourceCreate).toHaveBeenCalledWith('file1.css', 'new content')
    })

    it('should ignore non-matching files', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      mockSourceExists.mockReturnValue(false)
      mockMatches.mockReturnValue(false)

      type WatchChangeHook = (
        id: string,
        change: { event: 'update' | 'delete' | 'create' },
      ) => Promise<void>
      const watchChange = plugin.watchChange as WatchChangeHook
      await watchChange.call(mockPluginContext, 'file1.txt', { event: 'create' })

      expect(mockFileRead).not.toHaveBeenCalled()
      expect(mockSourceCreate).not.toHaveBeenCalled()
    })

    it('should handle BlockParseError in try/catch', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const error = new BlockParseError({
        message: 'Parse error',
        code: 'ERR_CODE',
        line: 10,
        column: 5,
        source: 'file1.css',
      })

      mockSourceExists.mockReturnValue(true)
      mockSourceUpdate.mockImplementation(() => {
        throw error
      })

      type WatchChangeHook = (
        id: string,
        change: { event: 'update' | 'delete' | 'create' },
      ) => Promise<void>
      const watchChange = plugin.watchChange as WatchChangeHook
      await watchChange.call(mockPluginContext, 'file1.css', { event: 'update' })

      expect(mockWarn).toHaveBeenCalledWith({
        cause: error,
        loc: { column: 0, file: 'file1.css', line: 10 },
        message: 'Parse error',
        stack: 'ERR_CODE',
      })
    })

    it('should rethrow non-BlockParseError', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const error = new Error('Generic error')

      mockSourceExists.mockReturnValue(true)
      mockSourceUpdate.mockImplementation(() => {
        throw error
      })

      type WatchChangeHook = (
        id: string,
        change: { event: 'update' | 'delete' | 'create' },
      ) => Promise<void>
      const watchChange = plugin.watchChange as WatchChangeHook

      await expect(
        watchChange.call(mockPluginContext, 'file1.css', { event: 'update' }),
      ).rejects.toThrow('Generic error')

      expect(mockWarn).not.toHaveBeenCalled()
    })
  })

  describe('handleBlockParseError', () => {
    it('should warn with BlockParseError details', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const error = new BlockParseError({
        message: 'Invalid tag syntax',
        code: '@tag invalid',
        line: 15,
        column: 3,
        source: 'file.css',
      })

      mockSearch.mockImplementation(async (callback: FileFinderOnFoundCallback) => {
        await callback('file.css')
      })
      mockSourceCreate.mockImplementation(() => {
        throw error
      })

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>
      await buildStart.call(mockPluginContext, {} as NormalizedInputOptions)

      expect(mockWarn).toHaveBeenCalledWith({
        cause: error,
        loc: { column: 0, file: 'file.css', line: 15 },
        message: 'Invalid tag syntax',
        stack: '@tag invalid',
      })
    })

    it('should rethrow non-BlockParseError', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const error = new TypeError('Type error')

      mockSearch.mockImplementation(async (callback: FileFinderOnFoundCallback) => {
        await callback('file.css')
      })
      mockSourceCreate.mockImplementation(() => {
        throw error
      })

      const buildStart = plugin.buildStart as (options: NormalizedInputOptions) => Promise<void>

      await expect(
        buildStart.call(mockPluginContext, {} as NormalizedInputOptions),
      ).rejects.toThrow('Type error')
    })
  })
})
