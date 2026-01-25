import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin, ViteDevServer } from 'vite'
import type { Api, Options } from '../src'

import createRollupPlugin from '@ui-doc/rollup'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import uidocPlugin from '../src'

// Mock @ui-doc/rollup module - vi.mock is hoisted automatically
vi.mock('@ui-doc/rollup', () => ({
  PLUGIN_NAME: 'ui-doc',
  default: vi.fn(),
}))

describe('uidocPlugin', () => {
  const mockUidoc = {
    page: vi.fn((name: string) => `<html>Page: ${name}</html>`),
    example: vi.fn((name: string) => `<html>Example: ${name}</html>`),
    replaceGenerate: vi.fn(),
    on: vi.fn(),
  }

  const mockFileSystem = {
    fileExists: vi.fn().mockResolvedValue(false),
    fileRead: vi.fn(),
    fileDirname: vi.fn(),
  }

  const mockApi = {
    version: '1.0.0',
    uidoc: mockUidoc,
    options: {
      prefix: { uri: 'ui-doc/', path: 'ui-doc/' },
      assets: [] as Array<Record<string, unknown>>,
      staticAssets: undefined,
    },
    fileSystem: mockFileSystem,
    isAssetFromInput: vi.fn().mockReturnValue(false),
    uidocAsset: vi.fn(),
    addAssetFromInput: vi.fn(),
  }

  const mockRollupPlugin = {
    name: 'ui-doc',
    version: '1.0.0',
    api: mockApi,
    buildStart: vi.fn(),
    generateBundle: vi.fn(),
    onLog: undefined,
    config: undefined,
    configureServer: undefined,
  } as unknown as Plugin<Api>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createRollupPlugin).mockResolvedValue(mockRollupPlugin as never)
  })

  describe('resolveOptions', () => {
    it('should set default output.dir to "ui-doc"', async () => {
      const options: Options = { source: 'src/**/*.css' }

      await uidocPlugin(options)

      expect(createRollupPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          output: expect.objectContaining({ dir: 'ui-doc' }),
        }),
      )
    })

    it('should preserve custom output.dir', async () => {
      const options: Options = { source: 'src/**/*.css', output: { dir: 'custom-docs' } }

      await uidocPlugin(options)

      expect(createRollupPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          output: expect.objectContaining({ dir: 'custom-docs' }),
        }),
      )
    })

    it('should not mutate the original options object', async () => {
      const options: Options = { source: 'src/**/*.css' }
      const originalOptions = { ...options }

      await uidocPlugin(options)

      expect(options).toEqual(originalOptions)
    })

    it('should preserve other output options', async () => {
      const options: Options = {
        source: 'src/**/*.css',
        output: { baseUrl: 'https://example.com/' },
      }

      await uidocPlugin(options)

      expect(createRollupPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          output: expect.objectContaining({
            baseUrl: 'https://example.com/',
            dir: 'ui-doc',
          }),
        }),
      )
    })
  })

  describe('plugin creation', () => {
    it('should set plugin name to "ui-doc"', async () => {
      const plugin = await uidocPlugin({ source: 'src/**/*.css' })

      expect(plugin.name).toBe('ui-doc')
    })

    it('should throw if rollup plugin api is not available', async () => {
      vi.mocked(createRollupPlugin).mockResolvedValue({ api: undefined } as never)

      await expect(uidocPlugin({ source: 'src/**/*.css' })).rejects.toThrow(
        'UI-Doc rollup plugin API is not available',
      )
    })

    it('should configure buildStart hook', async () => {
      const plugin = await uidocPlugin({ source: 'src/**/*.css' })

      expect(plugin.buildStart).toBeDefined()
      expect(typeof plugin.buildStart).toBe('function')
    })

    it('should configure generateBundle hook', async () => {
      const plugin = await uidocPlugin({ source: 'src/**/*.css' })

      expect(plugin.generateBundle).toBeDefined()
      expect(typeof plugin.generateBundle).toBe('function')
    })

    it('should configure configureServer hook', async () => {
      const plugin = await uidocPlugin({ source: 'src/**/*.css' })

      expect(plugin.configureServer).toBeDefined()
      expect(typeof plugin.configureServer).toBe('function')
    })
  })

  describe('prepareServe', () => {
    it('should register @vite/client asset', async () => {
      const plugin = await uidocPlugin({ source: 'src/**/*.css' })

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

      const plugin = await uidocPlugin({ source: 'src/**/*.css' })

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
      const plugin = await uidocPlugin({ source: 'src/**/*.css' })

      const configHook = plugin.config as (config: object, env: { command: string }) => void
      configHook({}, { command: 'serve' })

      const buildStartHook = plugin.buildStart as (options: object) => Promise<void>
      await buildStartHook.call({}, {})

      expect(mockUidoc.replaceGenerate).toHaveBeenCalledWith('resolve', expect.any(Function))
    })
  })

  describe('configureServer middleware', () => {
    let mockServer: ViteDevServer
    let mockReq: Partial<IncomingMessage>
    let mockRes: Partial<ServerResponse>
    let nextFn: ReturnType<typeof vi.fn>
    let middlewareHandler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void

    beforeEach(async () => {
      nextFn = vi.fn()
      mockReq = { originalUrl: '/ui-doc/', url: '/ui-doc/' }
      mockRes = {
        write: vi.fn(),
        end: vi.fn(),
        setHeader: vi.fn(),
        statusCode: 200,
      }
      mockServer = {
        middlewares: {
          use: vi.fn((handler: typeof middlewareHandler) => {
            middlewareHandler = handler
          }),
        },
        httpServer: {
          once: vi.fn(),
        },
        config: {
          logger: { info: vi.fn(), error: vi.fn() },
        },
        ws: { send: vi.fn() },
        resolvedUrls: { local: ['http://localhost:5173/'] },
      } as unknown as ViteDevServer

      const plugin = await uidocPlugin({ source: 'src/**/*.css' })
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
      const plugin = await uidocPlugin({ source: 'src/**/*.css' })
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

      const plugin = await uidocPlugin({ source: 'src/**/*.css' })
      const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>

      await expect(configureServer(mockServer)).rejects.toThrow(
        'UI-Doc base url is not available',
      )

      // Reset
      mockApi.options.prefix = originalPrefix
    })
  })

  describe('generateBundle', () => {
    it('should call original generateBundle if it exists', async () => {
      const originalGenerateBundle = vi.fn()
      mockRollupPlugin.generateBundle = originalGenerateBundle

      const plugin = await uidocPlugin({ source: 'src/**/*.css' })
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
      mockApi.options.assets = [
        { name: 'main', fromInput: true, type: 'script' },
      ]

      const plugin = await uidocPlugin({ source: 'src/**/*.css' })
      const generateBundle = plugin.generateBundle as (
        options: object,
        bundle: Record<string, { name: string, fileName: string }>,
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
  })

  describe('buildStart', () => {
    it('should call original buildStart if it exists', async () => {
      const originalBuildStart = vi.fn()
      mockRollupPlugin.buildStart = originalBuildStart

      const plugin = await uidocPlugin({ source: 'src/**/*.css' })
      const buildStart = plugin.buildStart as (options: object) => Promise<void>
      const mockContext = {}
      const inputOptions = { input: {} }

      await buildStart.call(mockContext, inputOptions)

      expect(originalBuildStart).toHaveBeenCalledWith(inputOptions)
    })

    it('should not call prepareServe when not serving', async () => {
      const plugin = await uidocPlugin({ source: 'src/**/*.css' })

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
      const plugin = await uidocPlugin({ source: 'src/**/*.css' })
      const onLog = plugin.onLog as (level: string, log: { plugin: string, pluginCode: string }) => boolean | void

      const result = onLog('info', { plugin: 'ui-doc', pluginCode: 'OUTPUT' })

      expect(result).toBe(false)
    })

    it('should allow other logs through', async () => {
      const plugin = await uidocPlugin({ source: 'src/**/*.css' })
      const onLog = plugin.onLog as (level: string, log: { plugin: string, pluginCode: string }) => boolean | void

      const result = onLog('info', { plugin: 'ui-doc', pluginCode: 'OTHER' })

      expect(result).toBeUndefined()
    })
  })
})
