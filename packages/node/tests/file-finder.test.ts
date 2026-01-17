import type { Dirent } from 'node:fs'
import fs from 'node:fs/promises'

import { describe, expect, it, vi } from 'vitest'

import { NodeFileFinder } from '../src'

vi.mock('node:fs/promises')

describe('nodeFileFinder', () => {
  it('foo', async () => {
    const fsReaddirMock = vi
      .spyOn(fs, 'readdir')
      .mockResolvedValueOnce([
        { isDirectory: () => true, isFile: () => false, name: 'sub-dir' } as Dirent,
        { isDirectory: () => false, isFile: () => true, name: 'bar.test' } as Dirent,
        { isDirectory: () => false, isFile: () => true, name: 'baz.not' } as Dirent,
        { isDirectory: () => false, isFile: () => true, name: 'foo.test' } as Dirent,
      ])
      .mockResolvedValueOnce([
        { isDirectory: () => false, isFile: () => true, name: 'foo-bar.test' } as Dirent,
        { isDirectory: () => false, isFile: () => true, name: 'baz.not' } as Dirent,
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

    expect(true).toBe(true)
  })
})
