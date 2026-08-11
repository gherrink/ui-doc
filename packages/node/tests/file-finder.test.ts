import type { Dirent } from 'node:fs'
import fs from 'node:fs/promises'

import type { MockInstance } from 'vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NodeFileFinder } from '../src'

vi.mock('node:fs/promises')

function createDirent(name: string, isDir: boolean): Dirent {
  return {
    isDirectory: () => isDir,
    isFile: () => !isDir,
    name,
  } as Dirent
}

/**
 * NodeFileFinder calls fs.readdir(dir, { withFileTypes: true }), which resolves
 * to Dirent<string>[]. Bare vi.spyOn picks readdir's buffer overload instead,
 * so narrow the spy to the overload actually under test.
 */
function mockReaddir(): MockInstance<
  (path: string, options: { withFileTypes: true }) => Promise<Dirent[]>
> {
  return vi.spyOn(fs, 'readdir') as unknown as MockInstance<
    (path: string, options: { withFileTypes: true }) => Promise<Dirent[]>
  >
}

describe('nodeFileFinder', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should resolve globs to absolute paths', () => {
      const fileFinder = new NodeFileFinder(['./relative/**/*.ts'])
      expect(fileFinder.globs[0]).toMatch(/^\//)
      expect(fileFinder.globs[0]).toContain('relative/**/*.ts')
    })

    it('should handle empty globs array', () => {
      const fileFinder = new NodeFileFinder([])
      expect(fileFinder.globs).toEqual([])
    })

    it('should handle default constructor', () => {
      const fileFinder = new NodeFileFinder()
      expect(fileFinder.globs).toEqual([])
    })

    it('should preserve multiple globs', () => {
      const fileFinder = new NodeFileFinder(['/a/**/*.ts', '/b/**/*.js'])
      expect(fileFinder.globs).toHaveLength(2)
    })
  })

  describe('search', () => {
    it('should find all matching files recursively', async () => {
      const fsReaddirMock = mockReaddir()
        .mockResolvedValueOnce([
          createDirent('sub-dir', true),
          createDirent('bar.test', false),
          createDirent('baz.not', false),
          createDirent('foo.test', false),
        ])
        .mockResolvedValueOnce([
          createDirent('foo-bar.test', false),
          createDirent('baz.not', false),
        ])

      const onFoundMock = vi.fn(async () => Promise.resolve())

      const fileFinder = new NodeFileFinder(['/test/**/*.test'])

      await fileFinder.search(onFoundMock)

      expect(fsReaddirMock).toHaveBeenCalledTimes(2)
      expect(fsReaddirMock).toHaveBeenCalledWith('/test', { withFileTypes: true })
      expect(fsReaddirMock).toHaveBeenCalledWith('/test/sub-dir', { withFileTypes: true })

      expect(onFoundMock).toHaveBeenCalledTimes(3)
      expect(onFoundMock).toHaveBeenCalledWith('/test/bar.test')
      expect(onFoundMock).toHaveBeenCalledWith('/test/foo.test')
      expect(onFoundMock).toHaveBeenCalledWith('/test/sub-dir/foo-bar.test')
    })

    it('should not recurse into subdirectories for non-recursive glob', async () => {
      const fsReaddirMock = mockReaddir().mockResolvedValueOnce([
        createDirent('sub-dir', true),
        createDirent('foo.ts', false),
        createDirent('bar.ts', false),
      ])

      const onFoundMock = vi.fn()

      const fileFinder = new NodeFileFinder(['/test/*.ts'])

      await fileFinder.search(onFoundMock)

      expect(fsReaddirMock).toHaveBeenCalledTimes(1)
      expect(onFoundMock).toHaveBeenCalledTimes(2)
      expect(onFoundMock).toHaveBeenCalledWith('/test/foo.ts')
      expect(onFoundMock).toHaveBeenCalledWith('/test/bar.ts')
    })

    it('should handle empty directory', async () => {
      mockReaddir().mockResolvedValueOnce([])

      const onFoundMock = vi.fn()

      const fileFinder = new NodeFileFinder(['/empty/**/*.ts'])

      await fileFinder.search(onFoundMock)

      expect(onFoundMock).not.toHaveBeenCalled()
    })

    it('should handle multiple globs', async () => {
      mockReaddir()
        .mockResolvedValueOnce([createDirent('a.ts', false)])
        .mockResolvedValueOnce([createDirent('b.js', false)])

      const onFoundMock = vi.fn()

      const fileFinder = new NodeFileFinder(['/src/*.ts', '/lib/*.js'])

      await fileFinder.search(onFoundMock)

      expect(onFoundMock).toHaveBeenCalledTimes(2)
    })

    it('should handle synchronous callback', async () => {
      mockReaddir().mockResolvedValueOnce([createDirent('file.ts', false)])

      const onFoundMock = vi.fn(() => undefined)

      const fileFinder = new NodeFileFinder(['/src/*.ts'])

      await fileFinder.search(onFoundMock)

      expect(onFoundMock).toHaveBeenCalledWith('/src/file.ts')
    })

    it('should skip entries that are neither files nor directories', async () => {
      mockReaddir().mockResolvedValueOnce([
        createDirent('file.ts', false),
        { isDirectory: () => false, isFile: () => false, name: 'symlink' } as Dirent,
      ])

      const onFoundMock = vi.fn()

      const fileFinder = new NodeFileFinder(['/src/*.ts'])

      await fileFinder.search(onFoundMock)

      expect(onFoundMock).toHaveBeenCalledTimes(1)
      expect(onFoundMock).toHaveBeenCalledWith('/src/file.ts')
    })

    it('should search deeply nested directories', async () => {
      mockReaddir()
        .mockResolvedValueOnce([createDirent('level1', true)])
        .mockResolvedValueOnce([createDirent('level2', true)])
        .mockResolvedValueOnce([createDirent('deep.ts', false)])

      const onFoundMock = vi.fn()

      const fileFinder = new NodeFileFinder(['/root/**/*.ts'])

      await fileFinder.search(onFoundMock)

      expect(onFoundMock).toHaveBeenCalledWith('/root/level1/level2/deep.ts')
    })
  })

  describe('matches', () => {
    it('should return true for matching file', () => {
      const fileFinder = new NodeFileFinder(['/src/**/*.ts'])
      expect(fileFinder.matches('/src/index.ts')).toBe(true)
      expect(fileFinder.matches('/src/utils/helper.ts')).toBe(true)
    })

    it('should return false for non-matching file', () => {
      const fileFinder = new NodeFileFinder(['/src/**/*.ts'])
      expect(fileFinder.matches('/src/index.js')).toBe(false)
      expect(fileFinder.matches('/other/index.ts')).toBe(false)
    })

    it('should match any of multiple globs', () => {
      const fileFinder = new NodeFileFinder(['/src/**/*.ts', '/lib/**/*.js'])
      expect(fileFinder.matches('/src/index.ts')).toBe(true)
      expect(fileFinder.matches('/lib/util.js')).toBe(true)
      expect(fileFinder.matches('/src/index.js')).toBe(false)
    })

    it('should return false when no globs configured', () => {
      const fileFinder = new NodeFileFinder([])
      expect(fileFinder.matches('/any/file.ts')).toBe(false)
    })

    it('should handle non-recursive globs', () => {
      const fileFinder = new NodeFileFinder(['/src/*.ts'])
      expect(fileFinder.matches('/src/index.ts')).toBe(true)
      expect(fileFinder.matches('/src/sub/index.ts')).toBe(false)
    })
  })

  describe('directories', () => {
    it('should return base directories from glob patterns', () => {
      const fileFinder = new NodeFileFinder(['/src/**/*.ts'])
      expect(fileFinder.directories()).toEqual(['/src'])
    })

    it('should handle multiple globs', () => {
      const fileFinder = new NodeFileFinder(['/src/**/*.ts', '/lib/**/*.js'])
      expect(fileFinder.directories()).toEqual(['/src', '/lib'])
    })

    it('should handle non-recursive globs', () => {
      const fileFinder = new NodeFileFinder(['/src/*.ts'])
      expect(fileFinder.directories()).toEqual(['/src'])
    })

    it('should handle nested base directories', () => {
      const fileFinder = new NodeFileFinder(['/src/components/**/*.tsx'])
      expect(fileFinder.directories()).toEqual(['/src/components'])
    })

    it('should return empty array when no globs configured', () => {
      const fileFinder = new NodeFileFinder([])
      expect(fileFinder.directories()).toEqual([])
    })

    it('should return empty array for default constructor', () => {
      const fileFinder = new NodeFileFinder()
      expect(fileFinder.directories()).toEqual([])
    })
  })
})
