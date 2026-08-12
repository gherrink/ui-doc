import type { IncomingMessage, ServerResponse } from 'node:http'

import createRollupPlugin from '@ui-doc/rollup'
import type { HotPayload, Logger, Plugin, ViteDevServer } from 'vite'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Api, Options } from '../src'
import uidocPlugin from '../src'

// Hook types come from the plugin itself rather than from `rollup`, so they follow whichever
// bundler the installed Vite uses - Rollup up to Vite 7, Rolldown from Vite 8. `Extract` drops
// the `{ handler }` object-hook variant, which has no call signature.
type HookFn<K extends keyof Plugin<Api>> = Extract<Plugin<Api>[K], (...args: never[]) => unknown>

// Extended interface for mock request with connect middleware properties
interface MockRequest extends Partial<IncomingMessage> {
  originalUrl?: string
}

// Connect middleware the plugin registers via server.middlewares.use()
type MiddlewareHandler = (req: IncomingMessage, res: ServerResponse, next: () => void) => void

// ServerResponse#write and #end are overloaded, and a vi.fn() mock collapses to a
// single signature. These merge the node overloads into one signature that still
// satisfies every one of them, so the doubles stay assignable to ServerResponse.
type ResponseWrite = (
  chunk: unknown,
  encodingOrCallback?: BufferEncoding | ((error: Error | null | undefined) => void),
  callback?: (error: Error | null | undefined) => void,
) => boolean

type ResponseEnd = (
  chunkOrCallback?: unknown,
  encodingOrCallback?: BufferEncoding | (() => void),
  callback?: () => void,
) => ServerResponse

// Mock @ui-doc/rollup module - vi.mock is hoisted automatically
vi.mock('@ui-doc/rollup', () => ({
  PLUGIN_NAME: 'ui-doc',
  default: vi.fn<typeof createRollupPlugin>(),
}))

describe('uidocPlugin', () => {
  const mockUidoc = {
    page: vi.fn<Api['uidoc']['page']>(name => `<html>Page: ${name}</html>`),
    example: vi.fn<Api['uidoc']['example']>(name => `<html>Example: ${name}</html>`),
    replaceGenerate: vi.fn<Api['uidoc']['replaceGenerate']>(),
    // The real `on` is chainable; this double only records the listener, so it
    // borrows the parameters and drops the `this` return.
    on: vi.fn<(...args: Parameters<Api['uidoc']['on']>) => void>(),
  }

  const mockFileSystem = {
    fileExists: vi.fn<Api['fileSystem']['fileExists']>().mockResolvedValue(false),
    fileRead: vi.fn<Api['fileSystem']['fileRead']>(),
    fileDirname: vi.fn<Api['fileSystem']['fileDirname']>(),
  }

  const mockApi = {
    version: '1.0.0',
    uidoc: mockUidoc,
    options: {
      prefix: { uri: 'ui-doc/', path: 'ui-doc/' },
      assets: [] as Array<Record<string, unknown>>,
      staticAssets: undefined as string | undefined,
    },
    fileSystem: mockFileSystem,
    isAssetFromInput: vi.fn<Api['isAssetFromInput']>().mockReturnValue(false),
    uidocAsset: vi.fn<Api['uidocAsset']>(),
    addAssetFromInput: vi.fn<Api['addAssetFromInput']>(),
  }

  const mockRollupPlugin = {
    name: 'ui-doc',
    version: '1.0.0',
    api: mockApi,
    buildStart: vi.fn<HookFn<'buildStart'>>(),
    generateBundle: vi.fn<HookFn<'generateBundle'>>(),
    onLog: undefined,
    config: undefined,
    configureServer: undefined,
  } as unknown as Plugin<Api>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createRollupPlugin).mockResolvedValue(mockRollupPlugin)
  })

  describe('resolveOptions', () => {
    it('should set default output.dir to "ui-doc"', async () => {
      const options: Options = { source: ['src/**/*.css'] }

      await uidocPlugin(options)

      expect(createRollupPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          output: expect.objectContaining({ dir: 'ui-doc' }),
        }),
      )
    })

    it('should preserve custom output.dir', async () => {
      const options: Options = { source: ['src/**/*.css'], output: { dir: 'custom-docs' } }

      await uidocPlugin(options)

      expect(createRollupPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          output: expect.objectContaining({ dir: 'custom-docs' }),
        }),
      )
    })

    it('should not mutate the original options object', async () => {
      const options: Options = { source: ['src/**/*.css'] }
      const originalOptions = { ...options }

      await uidocPlugin(options)

      expect(options).toEqual(originalOptions)
    })

    it('should preserve other output options', async () => {
      const options: Options = {
        source: ['src/**/*.css'],
        output: { baseUri: 'https://example.com/' },
      }

      await uidocPlugin(options)

      expect(createRollupPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          output: expect.objectContaining({
            baseUri: 'https://example.com/',
            dir: 'ui-doc',
          }),
        }),
      )
    })
  })

  describe('plugin creation', () => {
    it('should set plugin name to "ui-doc"', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.name).toBe('ui-doc')
    })

    it('should throw if rollup plugin api is not available', async () => {
      vi.mocked(createRollupPlugin).mockResolvedValue({ api: undefined } as never)

      await expect(uidocPlugin({ source: ['src/**/*.css'] })).rejects.toThrow(
        'UI-Doc rollup plugin API is not available',
      )
    })

    it('should configure buildStart hook', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.buildStart).toBeDefined()
      expect(typeof plugin.buildStart).toBe('function')
    })

    it('should configure generateBundle hook', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.generateBundle).toBeDefined()
      expect(typeof plugin.generateBundle).toBe('function')
    })

    it('should configure configureServer hook', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.configureServer).toBeDefined()
      expect(typeof plugin.configureServer).toBe('function')
    })
  })

  describe('prepareServe', () => {
    it('should register @vite/client asset', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      // Trigger serving mode
      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'serve' })

      // Trigger buildStart to call prepareServe
      const buildStartHook = plugin.buildStart as (options: object) => Promise<void>
      await buildStartHook.call({}, {})

      expect(mockApi.uidocAsset).toHaveBeenCalledWith('@vite/client', 'page', {
        attrs: { type: 'module' },
        type: 'script',
      })
    })

    it('should register assets from options', async () => {
      mockApi.options.assets = [
        { fileName: 'styles.css', context: 'page', name: 'styles', attrs: { rel: 'stylesheet' } },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'serve' })

      const buildStartHook = plugin.buildStart as (options: object) => Promise<void>
      await buildStartHook.call({}, {})

      expect(mockApi.uidocAsset).toHaveBeenCalledWith('styles.css', 'page', {
        attrs: { rel: 'stylesheet' },
        fromInput: false,
      })

      // Reset
      mockApi.options.assets = []
    })

    it('should set up URL resolver when prefix.uri is set', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'serve' })

      const buildStartHook = plugin.buildStart as (options: object) => Promise<void>
      await buildStartHook.call({}, {})

      expect(mockUidoc.replaceGenerate).toHaveBeenCalledWith('resolve', expect.any(Function))
    })

    it('should not set up URL resolver when prefix.uri is empty', async () => {
      const originalPrefix = mockApi.options.prefix
      mockApi.options.prefix = { uri: '', path: '' }

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'serve' })

      const buildStartHook = plugin.buildStart as (options: object) => Promise<void>
      await buildStartHook.call({}, {})

      expect(mockUidoc.replaceGenerate).not.toHaveBeenCalled()
      // Should still register @vite/client
      expect(mockApi.uidocAsset).toHaveBeenCalledWith('@vite/client', 'page', expect.any(Object))

      // Reset
      mockApi.options.prefix = originalPrefix
    })

    it('should resolve URLs for assets from input without prefix', async () => {
      mockApi.isAssetFromInput.mockReturnValue(true)

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'serve' })

      const buildStartHook = plugin.buildStart as (options: object) => Promise<void>
      await buildStartHook.call({}, {})

      // Get the resolver function that was passed to replaceGenerate
      const resolverCall = mockUidoc.replaceGenerate.mock.calls.find(call => call[0] === 'resolve')
      expect(resolverCall).toBeDefined()
      const resolver = resolverCall![1] as (uri: string, type: string) => string

      const result = resolver('styles/main.css', 'asset')

      expect(result).toBe('/styles/main.css')

      // Reset
      mockApi.isAssetFromInput.mockReturnValue(false)
    })

    it('should resolve URLs for @ prefixed assets without uri prefix', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'serve' })

      const buildStartHook = plugin.buildStart as (options: object) => Promise<void>
      await buildStartHook.call({}, {})

      const resolverCall = mockUidoc.replaceGenerate.mock.calls.find(call => call[0] === 'resolve')
      const resolver = resolverCall![1] as (uri: string, type: string) => string

      const result = resolver('@vite/client', 'asset')

      expect(result).toBe('/@vite/client')
    })

    it('should resolve URLs for non-asset types with uri prefix', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'serve' })

      const buildStartHook = plugin.buildStart as (options: object) => Promise<void>
      await buildStartHook.call({}, {})

      const resolverCall = mockUidoc.replaceGenerate.mock.calls.find(call => call[0] === 'resolve')
      const resolver = resolverCall![1] as (uri: string, type: string) => string

      const result = resolver('components.html', 'page')

      expect(result).toBe('/ui-doc/components.html')
    })

    it('should resolve URLs for asset-example type from input without prefix', async () => {
      mockApi.isAssetFromInput.mockReturnValue(true)

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'serve' })

      const buildStartHook = plugin.buildStart as (options: object) => Promise<void>
      await buildStartHook.call({}, {})

      const resolverCall = mockUidoc.replaceGenerate.mock.calls.find(call => call[0] === 'resolve')
      const resolver = resolverCall![1] as (uri: string, type: string) => string

      const result = resolver('example.js', 'asset-example')

      expect(result).toBe('/example.js')

      // Reset
      mockApi.isAssetFromInput.mockReturnValue(false)
    })

    it('should register multiple assets', async () => {
      mockApi.options.assets = [
        { fileName: 'a.css', context: 'page', attrs: {} },
        { fileName: 'b.js', context: 'example', attrs: {}, fromInput: true },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'serve' })

      const buildStartHook = plugin.buildStart as (options: object) => Promise<void>
      await buildStartHook.call({}, {})

      expect(mockApi.uidocAsset).toHaveBeenCalledWith('a.css', 'page', {
        attrs: {},
        fromInput: false,
      })
      expect(mockApi.uidocAsset).toHaveBeenCalledWith('b.js', 'example', {
        attrs: {},
        fromInput: true,
      })
      expect(mockApi.uidocAsset).toHaveBeenCalledWith('@vite/client', 'page', expect.any(Object))

      // Reset
      mockApi.options.assets = []
    })
  })

  describe('configureServer middleware', () => {
    let mockServer: ViteDevServer
    let mockReq: MockRequest
    let mockRes: Partial<ServerResponse>
    let nextFn: ReturnType<typeof vi.fn<() => void>>
    let middlewareHandler: MiddlewareHandler

    beforeEach(async () => {
      nextFn = vi.fn<() => void>()
      mockReq = { originalUrl: '/ui-doc/', url: '/ui-doc/' }
      mockRes = {
        write: vi.fn<ResponseWrite>(),
        end: vi.fn<ResponseEnd>(),
        setHeader: vi.fn<ServerResponse['setHeader']>(),
        statusCode: 200,
      }
      mockServer = {
        middlewares: {
          use: vi.fn<(handler: MiddlewareHandler) => void>(handler => {
            middlewareHandler = handler
          }),
        },
        httpServer: {
          once: vi.fn<(event: string, handler: () => void) => void>(),
        },
        config: {
          logger: { info: vi.fn<Logger['info']>(), error: vi.fn<Logger['error']>() },
        },
        ws: { send: vi.fn<(payload: HotPayload) => void>() },
        resolvedUrls: { local: ['http://localhost:5173/'] },
      } as unknown as ViteDevServer

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)
    })

    it('should pass through requests not matching prefix', () => {
      mockReq.originalUrl = '/other-path/'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(nextFn).toHaveBeenCalled()
      expect(mockRes.write).not.toHaveBeenCalled()
    })

    it('should serve index page for root path', () => {
      mockReq.originalUrl = '/ui-doc/'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(mockUidoc.page).toHaveBeenCalledWith('index')
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8')
      expect(mockRes.write).toHaveBeenCalledWith('<html>Page: index</html>')
      expect(mockRes.end).toHaveBeenCalled()
    })

    it('should serve named pages', () => {
      mockReq.originalUrl = '/ui-doc/components.html'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(mockUidoc.page).toHaveBeenCalledWith('components')
      expect(mockRes.write).toHaveBeenCalledWith('<html>Page: components</html>')
    })

    it('should serve example pages', () => {
      mockReq.originalUrl = '/ui-doc/examples/button.html'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(mockUidoc.example).toHaveBeenCalledWith('button')
      expect(mockRes.write).toHaveBeenCalledWith('<html>Example: button</html>')
    })

    it('should return 404 for unknown pages', () => {
      mockUidoc.page.mockReturnValueOnce(null)
      mockReq.originalUrl = '/ui-doc/nonexistent.html'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(mockRes.statusCode).toBe(404)
      expect(mockRes.end).toHaveBeenCalled()
    })

    it('should handle undefined originalUrl gracefully', () => {
      mockReq.originalUrl = undefined

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(nextFn).toHaveBeenCalled()
    })

    it('should serve registered assets', async () => {
      // Assets must be set before configureServer is called
      mockApi.options.assets = [{ name: 'styles.css', source: 'body { color: red; }' }]

      // Re-initialize middleware with the asset
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)

      mockReq.originalUrl = '/ui-doc/styles.css'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(mockRes.write).toHaveBeenCalledWith('body { color: red; }')
      expect(mockRes.end).toHaveBeenCalled()

      // Reset
      mockApi.options.assets = []
    })

    it('should throw error when prefix.uri is not available', async () => {
      const originalPrefix = mockApi.options.prefix
      mockApi.options.prefix = { uri: '', path: '' }

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>

      await expect(configureServer(mockServer)).rejects.toThrow('UI-Doc base url is not available')

      // Reset
      mockApi.options.prefix = originalPrefix
    })

    it('should serve page URL with underscore and dash', () => {
      mockReq.originalUrl = '/ui-doc/component_name-v2.html'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(mockUidoc.page).toHaveBeenCalledWith('component_name-v2')
    })

    it('should not match page URL with uppercase letters', () => {
      mockReq.originalUrl = '/ui-doc/Components.html'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(mockUidoc.page).not.toHaveBeenCalled()
      expect(nextFn).toHaveBeenCalled()
    })

    it('should serve example URL with numeric name', () => {
      mockReq.originalUrl = '/ui-doc/examples/button-123.html'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(mockUidoc.example).toHaveBeenCalledWith('button-123')
    })

    it('should pass through index page without trailing slash (requires redirect)', () => {
      // Note: The source code requires the trailing slash due to startsWith check
      // So /ui-doc without trailing slash passes through to next middleware
      mockReq.originalUrl = '/ui-doc'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(nextFn).toHaveBeenCalled()
      expect(mockUidoc.page).not.toHaveBeenCalled()
    })

    it('should serve asset with dots in filename', async () => {
      mockApi.options.assets = [{ name: 'my.custom.asset.js', source: 'content' }]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)

      mockReq.originalUrl = '/ui-doc/my.custom.asset.js'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(mockRes.write).toHaveBeenCalledWith('content')
      expect(mockRes.end).toHaveBeenCalled()

      // Reset
      mockApi.options.assets = []
    })
  })

  describe('configureServer static assets', () => {
    let mockServer: ViteDevServer
    let mockReq: MockRequest
    let mockRes: Partial<ServerResponse>
    let nextFn: ReturnType<typeof vi.fn<() => void>>
    let middlewareHandler: MiddlewareHandler

    beforeEach(async () => {
      nextFn = vi.fn<() => void>()
      mockReq = { originalUrl: '/ui-doc/', url: '/ui-doc/' }
      mockRes = {
        write: vi.fn<ResponseWrite>(),
        end: vi.fn<ResponseEnd>(),
        setHeader: vi.fn<ServerResponse['setHeader']>(),
        statusCode: 200,
      }
      mockServer = {
        middlewares: {
          use: vi.fn<(handler: MiddlewareHandler) => void>(handler => {
            middlewareHandler = handler
          }),
        },
        httpServer: {
          once: vi.fn<(event: string, handler: () => void) => void>(),
        },
        config: {
          logger: { info: vi.fn<Logger['info']>(), error: vi.fn<Logger['error']>() },
        },
        ws: { send: vi.fn<(payload: HotPayload) => void>() },
        resolvedUrls: { local: ['http://localhost:5173/'] },
      } as unknown as ViteDevServer
    })

    it('should serve static asset from file system when it exists', async () => {
      mockApi.options.staticAssets = '/path/to/static'
      mockFileSystem.fileExists.mockResolvedValue(true)

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)

      mockReq.originalUrl = '/ui-doc/images/logo.png'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      // Wait for async fileExists to resolve
      await vi.waitFor(() => {
        expect(mockFileSystem.fileExists).toHaveBeenCalledWith('/path/to/static/images/logo.png')
      })

      // Reset
      mockApi.options.staticAssets = undefined
      mockFileSystem.fileExists.mockResolvedValue(false)
    })

    it('should handle file existence error gracefully', async () => {
      mockApi.options.staticAssets = '/path/to/static'
      const error = new Error('Permission denied')
      mockFileSystem.fileExists.mockRejectedValue(error)
      const loggerErrorMock = vi.fn<Logger['error']>()
      mockServer.config.logger.error = loggerErrorMock

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)

      mockReq.originalUrl = '/ui-doc/images/logo.png'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      await vi.waitFor(() => {
        expect(loggerErrorMock).toHaveBeenCalledWith(
          expect.stringContaining('UI-Doc: Error checking asset file:'),
        )
      })

      // Reset
      mockApi.options.staticAssets = undefined
      mockFileSystem.fileExists.mockResolvedValue(false)
    })

    it('should skip static asset check when fileSystem is undefined', async () => {
      const originalFileSystem = mockApi.fileSystem
      mockApi.options.staticAssets = '/path/to/static'
      Object.defineProperty(mockApi, 'fileSystem', { value: undefined, writable: true })

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)

      mockReq.originalUrl = '/ui-doc/some-asset.png'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(nextFn).toHaveBeenCalled()
      expect(mockFileSystem.fileExists).not.toHaveBeenCalled()

      // Reset
      mockApi.options.staticAssets = undefined
      Object.defineProperty(mockApi, 'fileSystem', { value: originalFileSystem, writable: true })
    })

    it('should skip static asset check when staticAssets is undefined', async () => {
      mockApi.options.staticAssets = undefined

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)

      mockReq.originalUrl = '/ui-doc/some-asset.png'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      expect(nextFn).toHaveBeenCalled()
      expect(mockFileSystem.fileExists).not.toHaveBeenCalled()
    })

    it('should handle static asset URL with query string', async () => {
      mockApi.options.staticAssets = '/path/to/static'
      mockFileSystem.fileExists.mockResolvedValue(true)

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)

      mockReq.originalUrl = '/ui-doc/images/logo.png?v=123'

      middlewareHandler(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn)

      await vi.waitFor(() => {
        expect(mockFileSystem.fileExists).toHaveBeenCalledWith('/path/to/static/images/logo.png')
      })

      // Reset
      mockApi.options.staticAssets = undefined
      mockFileSystem.fileExists.mockResolvedValue(false)
    })
  })

  describe('generateBundle', () => {
    it('should call original generateBundle if it exists', async () => {
      const originalGenerateBundle = vi.fn<HookFn<'generateBundle'>>()
      mockRollupPlugin.generateBundle = originalGenerateBundle

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const generateBundle = plugin.generateBundle as (
        options: object,
        bundle: object,
        isWrite: boolean,
      ) => Promise<void>
      const mockContext = {}

      await generateBundle.call(mockContext, {}, {}, true)

      expect(originalGenerateBundle).toHaveBeenCalledWith({}, {}, true)
    })

    it('should process assets from input', async () => {
      mockApi.options.assets = [{ name: 'main', fromInput: true, type: 'script' }]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const generateBundle = plugin.generateBundle as (
        options: object,
        bundle: Record<string, { name: string; fileName: string }>,
        isWrite: boolean,
      ) => Promise<void>

      const mockBundle = {
        'main-abc123.js': { name: 'main', fileName: 'assets/main-abc123.js' },
      }

      await generateBundle.call({}, {}, mockBundle, true)

      const asset = mockApi.options.assets[0]
      expect(asset.fileName).toBe('assets/main-abc123.js')

      // Reset
      mockApi.options.assets = []
    })

    it('should process script asset with importedAssets metadata', async () => {
      mockApi.options.assets = [{ name: 'main', fromInput: true, type: 'script', fileName: '' }]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const generateBundle = plugin.generateBundle as (
        options: object,
        bundle: Record<string, object>,
        isWrite: boolean,
      ) => Promise<void>

      const mockBundle = {
        'main.js': {
          name: 'main',
          fileName: 'assets/main.js',
          viteMetadata: {
            importedAssets: new Set(['assets/image.png', 'assets/font.woff2']),
          },
        },
      }

      await generateBundle.call({}, {}, mockBundle, true)

      expect(mockApi.addAssetFromInput).toHaveBeenCalledWith('assets/image.png')
      expect(mockApi.addAssetFromInput).toHaveBeenCalledWith('assets/font.woff2')

      // Reset
      mockApi.options.assets = []
    })

    it('should process script asset with importedCss metadata', async () => {
      mockApi.options.assets = [
        { name: 'main', fromInput: true, type: 'script', context: 'page', fileName: '' },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const generateBundle = plugin.generateBundle as (
        options: object,
        bundle: Record<string, object>,
        isWrite: boolean,
      ) => Promise<void>

      const mockBundle = {
        'main.js': {
          name: 'main',
          fileName: 'assets/main.js',
          viteMetadata: {
            importedCss: new Set(['assets/main.css', 'assets/vendor.css']),
          },
        },
      }

      await generateBundle.call({}, {}, mockBundle, true)

      expect(mockApi.addAssetFromInput).toHaveBeenCalledWith('assets/main.css')
      expect(mockApi.addAssetFromInput).toHaveBeenCalledWith('assets/vendor.css')
      expect(mockApi.uidocAsset).toHaveBeenCalledWith('assets/main.css', 'page', { type: 'style' })
      expect(mockApi.uidocAsset).toHaveBeenCalledWith('assets/vendor.css', 'page', {
        type: 'style',
      })

      // Reset
      mockApi.options.assets = []
    })

    it('should process style asset with importedCss metadata', async () => {
      mockApi.options.assets = [{ name: 'styles', fromInput: true, type: 'style', fileName: '' }]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const generateBundle = plugin.generateBundle as (
        options: object,
        bundle: Record<string, object>,
        isWrite: boolean,
      ) => Promise<void>

      const mockBundle = {
        'styles.css': {
          name: 'styles',
          fileName: 'assets/styles.css',
          viteMetadata: {
            importedCss: new Set(['assets/generated.css']),
          },
        },
      }

      await generateBundle.call({}, {}, mockBundle, true)

      const asset = mockApi.options.assets[0]
      expect(asset.fileName).toBe('assets/generated.css')

      // Reset
      mockApi.options.assets = []
    })

    it('should not modify style asset fileName when importedCss is empty', async () => {
      mockApi.options.assets = [{ name: 'styles', fromInput: true, type: 'style', fileName: '' }]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const generateBundle = plugin.generateBundle as (
        options: object,
        bundle: Record<string, object>,
        isWrite: boolean,
      ) => Promise<void>

      const mockBundle = {
        'styles.css': {
          name: 'styles',
          fileName: 'assets/styles.css',
          viteMetadata: {
            importedCss: new Set<string>(),
          },
        },
      }

      await generateBundle.call({}, {}, mockBundle, true)

      const asset = mockApi.options.assets[0]
      expect(asset.fileName).toBe('')

      // Reset
      mockApi.options.assets = []
    })

    it('should skip asset processing when bundle entry not found', async () => {
      mockApi.options.assets = [
        { name: 'missing', fromInput: true, type: 'script', fileName: 'original.js' },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const generateBundle = plugin.generateBundle as (
        options: object,
        bundle: Record<string, object>,
        isWrite: boolean,
      ) => Promise<void>

      const mockBundle = {
        'other.js': { name: 'other', fileName: 'assets/other.js' },
      }

      await generateBundle.call({}, {}, mockBundle, true)

      const asset = mockApi.options.assets[0]
      expect(asset.fileName).toBe('original.js')
      expect(mockApi.addAssetFromInput).not.toHaveBeenCalled()

      // Reset
      mockApi.options.assets = []
    })

    it('should not update script asset fileName when bundle fileName is empty', async () => {
      mockApi.options.assets = [{ name: 'main', fromInput: true, type: 'script', fileName: '' }]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const generateBundle = plugin.generateBundle as (
        options: object,
        bundle: Record<string, object>,
        isWrite: boolean,
      ) => Promise<void>

      const mockBundle = {
        'main.js': {
          name: 'main',
          fileName: '',
        },
      }

      await generateBundle.call({}, {}, mockBundle, true)

      const asset = mockApi.options.assets[0]
      expect(asset.fileName).toBe('')

      // Reset
      mockApi.options.assets = []
    })

    it('should skip non-fromInput assets', async () => {
      mockApi.options.assets = [
        { name: 'static', fromInput: false, type: 'script', fileName: 'static.js' },
      ]

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const generateBundle = plugin.generateBundle as (
        options: object,
        bundle: Record<string, object>,
        isWrite: boolean,
      ) => Promise<void>

      const mockBundle = {
        'static.js': {
          name: 'static',
          fileName: 'assets/static-hashed.js',
        },
      }

      await generateBundle.call({}, {}, mockBundle, true)

      const asset = mockApi.options.assets[0]
      expect(asset.fileName).toBe('static.js')

      // Reset
      mockApi.options.assets = []
    })
  })

  describe('buildStart', () => {
    it('should call original buildStart if it exists', async () => {
      const originalBuildStart = vi.fn<HookFn<'buildStart'>>()
      mockRollupPlugin.buildStart = originalBuildStart

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const buildStart = plugin.buildStart as (options: object) => Promise<void>
      const mockContext = {}
      const inputOptions = { input: {} }

      await buildStart.call(mockContext, inputOptions)

      expect(originalBuildStart).toHaveBeenCalledWith(inputOptions)
    })

    it('should not call prepareServe when not serving', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      // Don't call config hook or call with 'build' command
      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'build' })

      const buildStart = plugin.buildStart as (options: object) => Promise<void>
      await buildStart.call({}, {})

      // prepareServe should not have been called, so no vite/client asset
      expect(mockApi.uidocAsset).not.toHaveBeenCalledWith(
        '@vite/client',
        expect.anything(),
        expect.anything(),
      )
    })
  })

  describe('onLog', () => {
    it('should hide rollup OUTPUT logs', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const onLog = plugin.onLog as (
        level: string,
        log: { plugin: string; pluginCode: string },
      ) => boolean | void

      const result = onLog('info', { plugin: 'ui-doc', pluginCode: 'OUTPUT' })

      expect(result).toBe(false)
    })

    it('should allow other logs through', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const onLog = plugin.onLog as (
        level: string,
        log: { plugin: string; pluginCode: string },
      ) => boolean | void

      const result = onLog('info', { plugin: 'ui-doc', pluginCode: 'OTHER' })

      expect(result).toBeUndefined()
    })

    it('should allow logs from other plugins through', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const onLog = plugin.onLog as (
        level: string,
        log: { plugin: string; pluginCode: string },
      ) => boolean | void

      const result = onLog('info', { plugin: 'other-plugin', pluginCode: 'OUTPUT' })

      expect(result).toBeUndefined()
    })
  })

  describe('hTTP server events', () => {
    it('should log server ready message with multiple local URLs', async () => {
      vi.useFakeTimers()
      const loggerInfoMock = vi.fn<Logger['info']>()
      const mockServer = {
        middlewares: { use: vi.fn<(handler: MiddlewareHandler) => void>() },
        httpServer: {
          once: vi.fn<(event: string, handler: () => void) => void>((event, handler) => {
            if (event === 'listening') {
              handler()
            }
          }),
        },
        config: {
          logger: { info: loggerInfoMock, error: vi.fn<Logger['error']>() },
        },
        ws: { send: vi.fn<(payload: HotPayload) => void>() },
        resolvedUrls: {
          local: ['http://localhost:5173/', 'http://192.168.1.100:5173/'],
        },
      } as unknown as ViteDevServer

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)

      // Advance timer past the 300ms delay
      vi.advanceTimersByTime(300)

      expect(loggerInfoMock).toHaveBeenCalledWith(expect.stringContaining('UI-Doc'))
      expect(loggerInfoMock).toHaveBeenCalledWith(expect.stringContaining('localhost:5173'))
      expect(loggerInfoMock).toHaveBeenCalledWith(expect.stringContaining('192.168.1.100:5173'))

      vi.useRealTimers()
    })

    it('should handle server ready event without local URLs', async () => {
      vi.useFakeTimers()
      const loggerInfoMock = vi.fn<Logger['info']>()
      const mockServer = {
        middlewares: { use: vi.fn<(handler: MiddlewareHandler) => void>() },
        httpServer: {
          once: vi.fn<(event: string, handler: () => void) => void>((event, handler) => {
            if (event === 'listening') {
              handler()
            }
          }),
        },
        config: {
          logger: { info: loggerInfoMock, error: vi.fn<Logger['error']>() },
        },
        ws: { send: vi.fn<(payload: HotPayload) => void>() },
        resolvedUrls: { local: undefined },
      } as unknown as ViteDevServer

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)

      vi.advanceTimersByTime(300)

      // Should log banner but no URL-specific logs
      expect(loggerInfoMock).toHaveBeenCalledWith(expect.stringContaining('UI-Doc'))
      // Only the banner log should be called
      expect(loggerInfoMock).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('should handle server ready event with empty local URLs array', async () => {
      vi.useFakeTimers()
      const loggerInfoMock = vi.fn<Logger['info']>()
      const mockServer = {
        middlewares: { use: vi.fn<(handler: MiddlewareHandler) => void>() },
        httpServer: {
          once: vi.fn<(event: string, handler: () => void) => void>((event, handler) => {
            if (event === 'listening') {
              handler()
            }
          }),
        },
        config: {
          logger: { info: loggerInfoMock, error: vi.fn<Logger['error']>() },
        },
        ws: { send: vi.fn<(payload: HotPayload) => void>() },
        resolvedUrls: { local: [] },
      } as unknown as ViteDevServer

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)

      vi.advanceTimersByTime(300)

      expect(loggerInfoMock).toHaveBeenCalledWith(expect.stringContaining('UI-Doc'))
      expect(loggerInfoMock).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('should trigger HMR full reload on context-entry event', async () => {
      const wsSendMock = vi.fn<(payload: HotPayload) => void>()
      let contextEntryHandler: (() => void) | undefined
      const mockServer = {
        middlewares: { use: vi.fn<(handler: MiddlewareHandler) => void>() },
        httpServer: {
          once: vi.fn<(event: string, handler: () => void) => void>((event, handler) => {
            if (event === 'listening') {
              handler()
            }
          }),
        },
        config: {
          logger: { info: vi.fn<Logger['info']>(), error: vi.fn<Logger['error']>() },
        },
        ws: { send: wsSendMock },
        resolvedUrls: { local: [] },
      } as unknown as ViteDevServer

      mockUidoc.on.mockImplementation((event, handler) => {
        if (event === 'context-entry') {
          contextEntryHandler = handler
        }
      })

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
      await configureServer(mockServer)

      // Trigger the context-entry event
      expect(contextEntryHandler).toBeDefined()
      contextEntryHandler!()

      expect(wsSendMock).toHaveBeenCalledWith({
        type: 'full-reload',
        path: '/ui-doc/*',
      })
    })

    it('should handle null httpServer gracefully', async () => {
      const mockServer = {
        middlewares: { use: vi.fn<(handler: MiddlewareHandler) => void>() },
        httpServer: null,
        config: {
          logger: { info: vi.fn<Logger['info']>(), error: vi.fn<Logger['error']>() },
        },
        ws: { send: vi.fn<(payload: HotPayload) => void>() },
        resolvedUrls: { local: [] },
      } as unknown as ViteDevServer

      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>

      // Should not throw
      await expect(configureServer(mockServer)).resolves.not.toThrow()
    })
  })

  describe('config hook', () => {
    it('should set serving to true for serve command and call prepareServe', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'serve' })

      const buildStart = plugin.buildStart as (options: object) => Promise<void>
      await buildStart.call({}, {})

      // prepareServe should be called, indicated by uidocAsset being called for vite client
      expect(mockApi.uidocAsset).toHaveBeenCalledWith('@vite/client', 'page', expect.any(Object))
    })

    // Note: build/non-standard command behavior is covered by
    // "buildStart > should not call prepareServe when not serving"
  })

  describe('plugin version', () => {
    it('should set version from package.json on plugin', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.version).toBeDefined()
      expect(typeof plugin.version).toBe('string')
    })

    it('should set version from package.json on api', async () => {
      const plugin = await uidocPlugin({ source: ['src/**/*.css'] })

      expect(plugin.api?.version).toBeDefined()
      expect(typeof plugin.api?.version).toBe('string')
    })
  })
})
