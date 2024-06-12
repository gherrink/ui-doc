import type { Dirent } from 'node:fs'
import fs from 'node:fs/promises'

import { describe, expect, jest, test } from '@jest/globals'

import { NodeFileFinder } from '../src'

jest.mock('node:fs/promises')

describe('NodeFileFinder', () => {
  test('foo', async () => {
    const fsReaddirMock = jest
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

    const onFoundMock = jest.fn(() => Promise.resolve())

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
