import type { FileSystem } from '@ui-doc/core'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NodeAssetLoader } from '../src'

vi.mock('node:fs/promises')
vi.mock('node:module', () => ({
  createRequire: vi.fn(),
}))

function createMockFileSystem(overrides: Partial<FileSystem> = {}): FileSystem {
  return {
    createFileFinder: vi.fn(),
    assetLoader: vi.fn(),
    resolve: vi.fn((file: string) => file),
    directoryCopy: vi.fn(),
    ensureDirectoryExists: vi.fn(),
    isDirectory: vi.fn(),
    fileRead: vi.fn().mockResolvedValue('file content'),
    fileWrite: vi.fn(),
    fileCopy: vi.fn().mockResolvedValue(true),
    fileExists: vi.fn().mockResolvedValue(true),
    fileBasename: vi.fn(),
    fileDirname: vi.fn(),
    ...overrides,
  }
}

describe('nodeAssetLoader', () => {
  let mockRequire: {
    resolve: ReturnType<typeof vi.fn> & { paths: ReturnType<typeof vi.fn> }
  }

  beforeEach(() => {
    mockRequire = {
      resolve: Object.assign(vi.fn(), {
        paths: vi.fn().mockReturnValue(['/node_modules']),
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

      await expect(loader.packagePath('any-pkg')).rejects.toThrow(
        'Could not resolve require paths',
      )
    })
  })

  describe('resolve', () => {
    it('should resolve and verify file exists', async () => {
      mockRequire.resolve.mockReturnValue('/resolved/path/file.js')

      const fileSystem = createMockFileSystem({ fileExists: vi.fn().mockResolvedValue(true) })
      const loader = new NodeAssetLoader(fileSystem)
      const resolved = await loader.resolve('some-package/file.js')

      expect(resolved).toBe('/resolved/path/file.js')
    })

    it('should return undefined when file does not exist', async () => {
      mockRequire.resolve.mockReturnValue('/resolved/path/file.js')

      const fileSystem = createMockFileSystem({ fileExists: vi.fn().mockResolvedValue(false) })
      const loader = new NodeAssetLoader(fileSystem)
      const resolved = await loader.resolve('some-package/nonexistent.js')

      expect(resolved).toBeUndefined()
    })
  })

  describe('copy', () => {
    it('should copy asset from resolved path', async () => {
      mockRequire.resolve.mockReturnValue('/from/asset.css')

      const fileCopyMock = vi.fn().mockResolvedValue(true)
      const fileSystem = createMockFileSystem({
        fileExists: vi.fn().mockResolvedValue(true),
        fileCopy: fileCopyMock,
      })
      const loader = new NodeAssetLoader(fileSystem)

      await loader.copy('package/asset.css', '/dest/asset.css')

      expect(fileCopyMock).toHaveBeenCalledWith('/from/asset.css', '/dest/asset.css')
    })

    it('should throw error when source cannot be resolved', async () => {
      mockRequire.resolve.mockReturnValue('/from/asset.css')

      const fileSystem = createMockFileSystem({ fileExists: vi.fn().mockResolvedValue(false) })
      const loader = new NodeAssetLoader(fileSystem)

      await expect(loader.copy('nonexistent/file.css', '/dest/file.css')).rejects.toThrow(
        'Could not resolve source asset "nonexistent/file.css"',
      )
    })

    it('should throw error when resolved path is empty', async () => {
      mockRequire.resolve.mockReturnValue('')

      const fileSystem = createMockFileSystem({ fileExists: vi.fn().mockResolvedValue(true) })
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
        fileExists: vi.fn().mockResolvedValue(true),
        fileRead: vi.fn().mockResolvedValue('asset content'),
      })
      const loader = new NodeAssetLoader(fileSystem)
      const content = await loader.read('package/asset.txt')

      expect(content).toBe('asset content')
    })

    it('should throw error when asset cannot be resolved', async () => {
      mockRequire.resolve.mockReturnValue('/from/asset.txt')

      const fileSystem = createMockFileSystem({ fileExists: vi.fn().mockResolvedValue(false) })
      const loader = new NodeAssetLoader(fileSystem)

      await expect(loader.read('nonexistent/file.txt')).rejects.toThrow(
        'Could not resolve asset "nonexistent/file.txt"',
      )
    })

    it('should throw error when resolved path is empty', async () => {
      mockRequire.resolve.mockReturnValue('')

      const fileSystem = createMockFileSystem({ fileExists: vi.fn().mockResolvedValue(true) })
      const loader = new NodeAssetLoader(fileSystem)

      await expect(loader.read('bad/file.txt')).rejects.toThrow(
        'Could not resolve asset "bad/file.txt"',
      )
    })
  })
})
