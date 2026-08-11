import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'

import type { FileSystem } from '@ui-doc/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NodeAssetLoader } from '../src'

vi.mock('node:fs/promises')
vi.mock('node:module', () => ({
  createRequire: vi.fn<typeof createRequire>(),
}))

function createMockFileSystem(overrides: Partial<FileSystem> = {}): FileSystem {
  return {
    createFileFinder: vi.fn<FileSystem['createFileFinder']>(),
    assetLoader: vi.fn<FileSystem['assetLoader']>(),
    resolve: vi.fn<FileSystem['resolve']>(file => file),
    directoryCopy: vi.fn<FileSystem['directoryCopy']>(),
    ensureDirectoryExists: vi.fn<FileSystem['ensureDirectoryExists']>(),
    isDirectory: vi.fn<FileSystem['isDirectory']>(),
    fileRead: vi.fn<FileSystem['fileRead']>().mockResolvedValue('file content'),
    fileWrite: vi.fn<FileSystem['fileWrite']>(),
    fileCopy: vi.fn<FileSystem['fileCopy']>().mockResolvedValue(true),
    fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(true),
    fileBasename: vi.fn<FileSystem['fileBasename']>(),
    fileDirname: vi.fn<FileSystem['fileDirname']>(),
    ...overrides,
  }
}

describe('nodeAssetLoader', () => {
  let mockRequire: {
    resolve: ReturnType<typeof vi.fn<NodeRequire['resolve']>> & {
      paths: ReturnType<typeof vi.fn<NodeRequire['resolve']['paths']>>
    }
  }

  beforeEach(() => {
    mockRequire = {
      resolve: Object.assign(vi.fn<NodeRequire['resolve']>(), {
        paths: vi.fn<NodeRequire['resolve']['paths']>().mockReturnValue(['/node_modules']),
      }),
    }
    vi.mocked(createRequire).mockReturnValue(mockRequire as unknown as NodeRequire)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('packageExists', () => {
    it('should return true when package exists', async () => {
      vi.spyOn(fs, 'access').mockResolvedValue(undefined)

      const fileSystem = createMockFileSystem()
      const loader = new NodeAssetLoader(fileSystem)
      const exists = await loader.packageExists('lodash')

      expect(exists).toBe(true)
    })

    it('should return false when package does not exist', async () => {
      vi.spyOn(fs, 'access').mockRejectedValue(new Error('ENOENT'))

      const fileSystem = createMockFileSystem()
      const loader = new NodeAssetLoader(fileSystem)
      const exists = await loader.packageExists('nonexistent-package')

      expect(exists).toBe(false)
    })

    it('should cache package existence check', async () => {
      const accessSpy = vi.spyOn(fs, 'access').mockResolvedValue(undefined)

      const fileSystem = createMockFileSystem()
      const loader = new NodeAssetLoader(fileSystem)

      await loader.packageExists('cached-pkg')
      await loader.packageExists('cached-pkg')

      expect(accessSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('packagePath', () => {
    it('should return package path when found', async () => {
      vi.spyOn(fs, 'access').mockResolvedValue(undefined)

      const fileSystem = createMockFileSystem()
      const loader = new NodeAssetLoader(fileSystem)
      const pkgPath = await loader.packagePath('lodash')

      expect(pkgPath).toBe('/node_modules/lodash')
    })

    it('should return undefined when package not found', async () => {
      vi.spyOn(fs, 'access').mockRejectedValue(new Error('ENOENT'))

      const fileSystem = createMockFileSystem()
      const loader = new NodeAssetLoader(fileSystem)
      const pkgPath = await loader.packagePath('nonexistent')

      expect(pkgPath).toBeUndefined()
    })

    it('should search multiple node_modules paths', async () => {
      mockRequire.resolve.paths.mockReturnValue(['/first/node_modules', '/second/node_modules'])

      const accessSpy = vi
        .spyOn(fs, 'access')
        .mockRejectedValueOnce(new Error('ENOENT'))
        .mockResolvedValueOnce(undefined)

      const fileSystem = createMockFileSystem()
      const loader = new NodeAssetLoader(fileSystem)
      const pkgPath = await loader.packagePath('found-in-second')

      expect(accessSpy).toHaveBeenCalledTimes(2)
      expect(pkgPath).toBe('/second/node_modules/found-in-second')
    })

    it('should cache resolved package path', async () => {
      const accessSpy = vi.spyOn(fs, 'access').mockResolvedValue(undefined)

      const fileSystem = createMockFileSystem()
      const loader = new NodeAssetLoader(fileSystem)

      const path1 = await loader.packagePath('cached')
      const path2 = await loader.packagePath('cached')

      expect(path1).toBe(path2)
      expect(accessSpy).toHaveBeenCalledTimes(1)
    })

    it('should cache negative results', async () => {
      const accessSpy = vi.spyOn(fs, 'access').mockRejectedValue(new Error('ENOENT'))

      const fileSystem = createMockFileSystem()
      const loader = new NodeAssetLoader(fileSystem)

      await loader.packagePath('not-found')
      await loader.packagePath('not-found')

      expect(accessSpy).toHaveBeenCalledTimes(1)
    })

    it('should throw error when require.resolve.paths returns null', async () => {
      mockRequire.resolve.paths.mockReturnValue(null)

      const fileSystem = createMockFileSystem()
      const loader = new NodeAssetLoader(fileSystem)

      await expect(loader.packagePath('any-pkg')).rejects.toThrow('Could not resolve require paths')
    })
  })

  describe('resolve', () => {
    it('should resolve and verify file exists', async () => {
      mockRequire.resolve.mockReturnValue('/resolved/path/file.js')

      const fileSystem = createMockFileSystem({
        fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(true),
      })
      const loader = new NodeAssetLoader(fileSystem)
      const resolved = await loader.resolve('some-package/file.js')

      expect(resolved).toBe('/resolved/path/file.js')
    })

    it('should return undefined when file does not exist', async () => {
      mockRequire.resolve.mockReturnValue('/resolved/path/file.js')

      const fileSystem = createMockFileSystem({
        fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(false),
      })
      const loader = new NodeAssetLoader(fileSystem)
      const resolved = await loader.resolve('some-package/nonexistent.js')

      expect(resolved).toBeUndefined()
    })
  })

  describe('copy', () => {
    it('should copy asset from resolved path', async () => {
      mockRequire.resolve.mockReturnValue('/from/asset.css')

      const fileCopyMock = vi.fn<FileSystem['fileCopy']>().mockResolvedValue(true)
      const fileSystem = createMockFileSystem({
        fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(true),
        fileCopy: fileCopyMock,
      })
      const loader = new NodeAssetLoader(fileSystem)

      await loader.copy('package/asset.css', '/dest/asset.css')

      expect(fileCopyMock).toHaveBeenCalledWith('/from/asset.css', '/dest/asset.css')
    })

    it('should throw error when source cannot be resolved', async () => {
      mockRequire.resolve.mockReturnValue('/from/asset.css')

      const fileSystem = createMockFileSystem({
        fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(false),
      })
      const loader = new NodeAssetLoader(fileSystem)

      await expect(loader.copy('nonexistent/file.css', '/dest/file.css')).rejects.toThrow(
        'Could not resolve source asset "nonexistent/file.css"',
      )
    })

    it('should throw error when resolved path is empty', async () => {
      mockRequire.resolve.mockReturnValue('')

      const fileSystem = createMockFileSystem({
        fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(true),
      })
      const loader = new NodeAssetLoader(fileSystem)

      await expect(loader.copy('bad/file.css', '/dest/file.css')).rejects.toThrow(
        'Could not resolve source asset "bad/file.css"',
      )
    })
  })

  describe('read', () => {
    it('should read asset content', async () => {
      mockRequire.resolve.mockReturnValue('/from/asset.txt')

      const fileSystem = createMockFileSystem({
        fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(true),
        fileRead: vi.fn<FileSystem['fileRead']>().mockResolvedValue('asset content'),
      })
      const loader = new NodeAssetLoader(fileSystem)
      const content = await loader.read('package/asset.txt')

      expect(content).toBe('asset content')
    })

    it('should throw error when asset cannot be resolved', async () => {
      mockRequire.resolve.mockReturnValue('/from/asset.txt')

      const fileSystem = createMockFileSystem({
        fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(false),
      })
      const loader = new NodeAssetLoader(fileSystem)

      await expect(loader.read('nonexistent/file.txt')).rejects.toThrow(
        'Could not resolve asset "nonexistent/file.txt"',
      )
    })

    it('should throw error when resolved path is empty', async () => {
      mockRequire.resolve.mockReturnValue('')

      const fileSystem = createMockFileSystem({
        fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(true),
      })
      const loader = new NodeAssetLoader(fileSystem)

      await expect(loader.read('bad/file.txt')).rejects.toThrow(
        'Could not resolve asset "bad/file.txt"',
      )
    })
  })

  // The suite above returns one mock require for both createRequire() calls, so
  // the consumer base and this package's own base are indistinguishable and the
  // dedupe in resolvePaths collapses them. That is why the strict-layout bug
  // fixed in 19342dc reached a demo instead of a test: nothing here could tell
  // the two bases apart. These tests key the mock on its argument so they can.
  describe('consumer-first resolution', () => {
    const consumerBase = path.join(process.cwd(), 'noop.js')

    /**
     * Build a require double whose resolution differs per base.
     * @param paths node_modules directories require.resolve.paths() reports
     * @param resolveImpl require.resolve() behaviour, defaults to throwing
     * @returns A stand-in for NodeRequire
     */
    function createMockRequire(
      paths: string[] | null,
      resolveImpl: (file: string) => string = () => {
        throw new Error('Cannot find module')
      },
    ): NodeRequire {
      return {
        resolve: Object.assign(vi.fn(resolveImpl), {
          paths: vi.fn<NodeRequire['resolve']['paths']>().mockReturnValue(paths),
        }),
      } as unknown as NodeRequire
    }

    /**
     * Route createRequire() to a different double per base.
     * @param consumer Double returned for the consumer's cwd base
     * @param own Double returned for this package's own base
     */
    function useDistinctRequires(consumer: NodeRequire, own: NodeRequire): void {
      vi.mocked(createRequire).mockImplementation(base => (base === consumerBase ? consumer : own))
    }

    it('should anchor one require at the consumer cwd and one at this package', () => {
      useDistinctRequires(createMockRequire(['/consumer/node_modules']), createMockRequire([]))

      // eslint-disable-next-line no-new -- constructing is the behaviour under test
      new NodeAssetLoader(createMockFileSystem())

      expect(createRequire).toHaveBeenCalledTimes(2)
      expect(createRequire).toHaveBeenCalledWith(consumerBase)
      expect(vi.mocked(createRequire).mock.calls.map(([base]) => base)).not.toEqual([
        consumerBase,
        consumerBase,
      ])
    })

    it('should search consumer paths before this package own paths', async () => {
      useDistinctRequires(
        createMockRequire(['/consumer/node_modules']),
        createMockRequire(['/own/node_modules']),
      )

      const accessSpy = vi.spyOn(fs, 'access').mockRejectedValue(new Error('ENOENT'))

      const loader = new NodeAssetLoader(createMockFileSystem())
      await loader.packagePath('some-pkg')

      expect(accessSpy.mock.calls.map(([dir]) => dir)).toEqual([
        '/consumer/node_modules/some-pkg',
        '/own/node_modules/some-pkg',
      ])
    })

    it('should de-duplicate paths shared by both bases', async () => {
      useDistinctRequires(
        createMockRequire(['/shared/node_modules', '/consumer/node_modules']),
        createMockRequire(['/shared/node_modules', '/own/node_modules']),
      )

      const accessSpy = vi.spyOn(fs, 'access').mockRejectedValue(new Error('ENOENT'))

      const loader = new NodeAssetLoader(createMockFileSystem())
      await loader.packagePath('some-pkg')

      expect(accessSpy.mock.calls.map(([dir]) => dir)).toEqual([
        '/shared/node_modules/some-pkg',
        '/consumer/node_modules/some-pkg',
        '/own/node_modules/some-pkg',
      ])
    })

    // The regression this whole block exists for. Under pnpm without
    // shamefully-hoist, @ui-doc/html-renderer sits in the consumer's
    // node_modules and is invisible from this package's own resolution walk.
    it('should find a package present only in the consumer node_modules', async () => {
      useDistinctRequires(
        createMockRequire(['/consumer/node_modules']),
        createMockRequire(['/own/node_modules']),
      )

      vi.spyOn(fs, 'access').mockImplementation(async dir =>
        dir === '/consumer/node_modules/@ui-doc/html-renderer'
          ? Promise.resolve(undefined)
          : Promise.reject(new Error('ENOENT')),
      )

      const loader = new NodeAssetLoader(createMockFileSystem())

      expect(await loader.packagePath('@ui-doc/html-renderer')).toBe(
        '/consumer/node_modules/@ui-doc/html-renderer',
      )
    })

    it('should still find a package present only in this package node_modules', async () => {
      useDistinctRequires(
        createMockRequire(['/consumer/node_modules']),
        createMockRequire(['/own/node_modules']),
      )

      vi.spyOn(fs, 'access').mockImplementation(async dir =>
        dir === '/own/node_modules/@ui-doc/html-renderer'
          ? Promise.resolve(undefined)
          : Promise.reject(new Error('ENOENT')),
      )

      const loader = new NodeAssetLoader(createMockFileSystem())

      expect(await loader.packagePath('@ui-doc/html-renderer')).toBe(
        '/own/node_modules/@ui-doc/html-renderer',
      )
    })

    // packagePath joins strings instead of calling require.resolve precisely so
    // that a scoped name plus a subpath works: @ui-doc/html-renderer exports
    // only '.', './ui-doc.css' and friends, so resolving this specifier for
    // real throws ERR_PACKAGE_PATH_NOT_EXPORTED.
    it('should resolve a scoped name with a subpath', async () => {
      useDistinctRequires(createMockRequire(['/consumer/node_modules']), createMockRequire([]))

      vi.spyOn(fs, 'access').mockResolvedValue(undefined)

      const loader = new NodeAssetLoader(createMockFileSystem())

      expect(await loader.packagePath('@ui-doc/html-renderer/templates')).toBe(
        '/consumer/node_modules/@ui-doc/html-renderer/templates',
      )
    })

    it('should follow the consumer cwd rather than a fixed root', async () => {
      vi.spyOn(process, 'cwd').mockReturnValue('/elsewhere')
      const movedBase = path.join('/elsewhere', 'noop.js')

      const consumer = createMockRequire(['/elsewhere/node_modules'])
      vi.mocked(createRequire).mockImplementation(base =>
        base === movedBase ? consumer : createMockRequire([]),
      )

      vi.spyOn(fs, 'access').mockResolvedValue(undefined)

      const loader = new NodeAssetLoader(createMockFileSystem())

      expect(createRequire).toHaveBeenCalledWith(movedBase)
      expect(await loader.packagePath('some-pkg')).toBe('/elsewhere/node_modules/some-pkg')
    })

    it('should fall back to this package when the consumer cannot resolve', async () => {
      useDistinctRequires(
        createMockRequire(null),
        createMockRequire(null, () => '/own/node_modules/pkg/asset.css'),
      )

      const loader = new NodeAssetLoader(
        createMockFileSystem({
          fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(true),
        }),
      )

      expect(await loader.resolve('pkg/asset.css')).toBe('/own/node_modules/pkg/asset.css')
    })

    it('should fall back when the consumer resolves to a file that is missing', async () => {
      useDistinctRequires(
        createMockRequire(null, () => '/consumer/node_modules/pkg/asset.css'),
        createMockRequire(null, () => '/own/node_modules/pkg/asset.css'),
      )

      const loader = new NodeAssetLoader(
        createMockFileSystem({
          fileExists: vi.fn<FileSystem['fileExists']>(async file =>
            Promise.resolve(file === '/own/node_modules/pkg/asset.css'),
          ),
        }),
      )

      expect(await loader.resolve('pkg/asset.css')).toBe('/own/node_modules/pkg/asset.css')
    })

    it('should prefer the consumer when both bases resolve', async () => {
      useDistinctRequires(
        createMockRequire(null, () => '/consumer/node_modules/pkg/asset.css'),
        createMockRequire(null, () => '/own/node_modules/pkg/asset.css'),
      )

      const loader = new NodeAssetLoader(
        createMockFileSystem({
          fileExists: vi.fn<FileSystem['fileExists']>().mockResolvedValue(true),
        }),
      )

      expect(await loader.resolve('pkg/asset.css')).toBe('/consumer/node_modules/pkg/asset.css')
    })

    it('should return undefined when neither base resolves', async () => {
      useDistinctRequires(createMockRequire(null), createMockRequire(null))

      const loader = new NodeAssetLoader(createMockFileSystem())

      expect(await loader.resolve('pkg/missing.css')).toBeUndefined()
    })
  })
})
