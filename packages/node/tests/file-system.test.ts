import type { Stats } from 'node:fs'
import fs from 'node:fs/promises'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { cerateNodeFileSystem, createNodeFileSystem, NodeFileSystem } from '../src'

vi.mock('node:fs/promises')

describe('nodeFileSystem', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('singleton pattern', () => {
    it('should return the same instance on multiple init calls', () => {
      const instance1 = NodeFileSystem.init()
      const instance2 = NodeFileSystem.init()
      expect(instance1).toBe(instance2)
    })

    it('should be created via createNodeFileSystem factory', () => {
      const instance = createNodeFileSystem()
      expect(instance).toBeInstanceOf(NodeFileSystem)
    })

    it('should support deprecated cerateNodeFileSystem alias', () => {
      const instance = cerateNodeFileSystem()
      expect(instance).toBeInstanceOf(NodeFileSystem)
    })
  })

  describe('createFileFinder', () => {
    it('should create a NodeFileFinder with provided globs', () => {
      const fileSystem = createNodeFileSystem()
      const finder = fileSystem.createFileFinder(['/src/**/*.ts'])
      expect(finder.globs).toHaveLength(1)
    })
  })

  describe('assetLoader', () => {
    it('should return the same asset loader instance', () => {
      const fileSystem = createNodeFileSystem()
      const loader1 = fileSystem.assetLoader()
      const loader2 = fileSystem.assetLoader()
      expect(loader1).toBe(loader2)
    })
  })

  describe('resolve', () => {
    it('should resolve relative path to absolute', () => {
      const fileSystem = createNodeFileSystem()
      const resolved = fileSystem.resolve('./file.ts')
      expect(resolved).toMatch(/^\//)
      expect(resolved).toContain('file.ts')
    })

    it('should return absolute path unchanged', () => {
      const fileSystem = createNodeFileSystem()
      const resolved = fileSystem.resolve('/absolute/path/file.ts')
      expect(resolved).toBe('/absolute/path/file.ts')
    })
  })

  describe('fileRead', () => {
    it('should read file contents', async () => {
      vi.spyOn(fs, 'readFile').mockResolvedValue('file content')

      const fileSystem = createNodeFileSystem()
      const content = await fileSystem.fileRead('/test/file.txt')

      expect(content).toBe('file content')
      expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining('file.txt'), 'utf8')
    })
  })

  describe('fileWrite', () => {
    it('should write file and return true on success', async () => {
      vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined)

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.fileWrite('/test/file.txt', 'content')

      expect(result).toBe(true)
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('file.txt'),
        'content',
        'utf8',
      )
    })

    it('should return false on write failure', async () => {
      vi.spyOn(fs, 'writeFile').mockRejectedValue(new Error('Permission denied'))

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.fileWrite('/test/file.txt', 'content')

      expect(result).toBe(false)
    })
  })

  describe('fileCopy', () => {
    it('should copy file and return true on success', async () => {
      vi.spyOn(fs, 'copyFile').mockResolvedValue(undefined)

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.fileCopy('/from/file.txt', '/to/file.txt')

      expect(result).toBe(true)
    })

    it('should return false on copy failure', async () => {
      vi.spyOn(fs, 'copyFile').mockRejectedValue(new Error('File not found'))

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.fileCopy('/from/file.txt', '/to/file.txt')

      expect(result).toBe(false)
    })
  })

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      vi.spyOn(fs, 'access').mockResolvedValue(undefined)

      const fileSystem = createNodeFileSystem()
      const exists = await fileSystem.fileExists('/test/file.txt')

      expect(exists).toBe(true)
    })

    it('should return false when file does not exist', async () => {
      vi.spyOn(fs, 'access').mockRejectedValue(new Error('ENOENT'))

      const fileSystem = createNodeFileSystem()
      const exists = await fileSystem.fileExists('/test/nonexistent.txt')

      expect(exists).toBe(false)
    })
  })

  describe('fileBasename', () => {
    it('should return filename without extension', () => {
      const fileSystem = createNodeFileSystem()
      expect(fileSystem.fileBasename('/path/to/file.txt')).toBe('file')
    })

    it('should handle files without extension', () => {
      const fileSystem = createNodeFileSystem()
      expect(fileSystem.fileBasename('/path/to/Makefile')).toBe('Makefile')
    })

    it('should handle multiple dots in filename', () => {
      const fileSystem = createNodeFileSystem()
      expect(fileSystem.fileBasename('/path/to/file.test.ts')).toBe('file.test')
    })
  })

  describe('fileDirname', () => {
    it('should return directory path', () => {
      const fileSystem = createNodeFileSystem()
      expect(fileSystem.fileDirname('/path/to/file.txt')).toBe('/path/to')
    })

    it('should handle root level files', () => {
      const fileSystem = createNodeFileSystem()
      expect(fileSystem.fileDirname('/file.txt')).toBe('/')
    })
  })

  describe('ensureDirectoryExists', () => {
    it('should create directory and return true', async () => {
      vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined)

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.ensureDirectoryExists('/path/to/dir')

      expect(result).toBe(true)
      expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('dir'), { recursive: true })
    })
  })

  describe('isDirectory', () => {
    it('should return true for directory', async () => {
      vi.spyOn(fs, 'stat').mockResolvedValue({ isDirectory: () => true } as Stats)

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.isDirectory('/path/to/dir')

      expect(result).toBe(true)
    })

    it('should return false for file', async () => {
      vi.spyOn(fs, 'stat').mockResolvedValue({ isDirectory: () => false } as Stats)

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.isDirectory('/path/to/file.txt')

      expect(result).toBe(false)
    })

    it('should return false for non-existent path', async () => {
      vi.spyOn(fs, 'stat').mockRejectedValue(new Error('ENOENT'))

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.isDirectory('/nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('directoryCopy', () => {
    it('should copy directory contents recursively', async () => {
      vi.spyOn(fs, 'stat')
        .mockResolvedValueOnce({ isDirectory: () => true } as Stats)
        .mockResolvedValueOnce({ isDirectory: () => true } as Stats)
      vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined)
      vi.spyOn(fs, 'readdir').mockResolvedValue([
        { isDirectory: () => false, name: 'file1.txt' },
        { isDirectory: () => false, name: 'file2.txt' },
      ] as never)
      const copyFileSpy = vi.spyOn(fs, 'copyFile').mockResolvedValue(undefined)

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.directoryCopy('/from', '/to')

      expect(result).toBe(true)
      expect(copyFileSpy).toHaveBeenCalledTimes(2)
    })

    it('should return false if source is not a directory', async () => {
      vi.spyOn(fs, 'stat').mockResolvedValue({ isDirectory: () => false } as Stats)

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.directoryCopy('/from/file.txt', '/to')

      expect(result).toBe(false)
    })

    it('should copy nested directories', async () => {
      vi.spyOn(fs, 'stat').mockResolvedValue({ isDirectory: () => true } as Stats)
      const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined)
      vi.spyOn(fs, 'readdir')
        .mockResolvedValueOnce([{ isDirectory: () => true, name: 'subdir' }] as never)
        .mockResolvedValueOnce([{ isDirectory: () => false, name: 'nested.txt' }] as never)
      vi.spyOn(fs, 'copyFile').mockResolvedValue(undefined)

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.directoryCopy('/from', '/to')

      expect(result).toBe(true)
      expect(mkdirSpy).toHaveBeenCalledTimes(2)
    })

    it('should return false if any file copy fails', async () => {
      vi.spyOn(fs, 'stat').mockResolvedValue({ isDirectory: () => true } as Stats)
      vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined)
      vi.spyOn(fs, 'readdir').mockResolvedValue([
        { isDirectory: () => false, name: 'file.txt' },
      ] as never)
      vi.spyOn(fs, 'copyFile').mockRejectedValue(new Error('Copy failed'))

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.directoryCopy('/from', '/to')

      expect(result).toBe(false)
    })

    it('should handle empty directories', async () => {
      vi.spyOn(fs, 'stat').mockResolvedValue({ isDirectory: () => true } as Stats)
      vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined)
      vi.spyOn(fs, 'readdir').mockResolvedValue([])
      const copyFileSpy = vi.spyOn(fs, 'copyFile')

      const fileSystem = createNodeFileSystem()
      const result = await fileSystem.directoryCopy('/from', '/to')

      expect(result).toBe(true)
      expect(copyFileSpy).not.toHaveBeenCalled()
    })
  })
})
