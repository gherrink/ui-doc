import fs from 'node:fs/promises'
import path from 'node:path'

import type { FileSystem } from '@ui-doc/core'

import { NodeAssetLoader } from './NodeAssetLoader'
import { NodeFileFinder } from './NodeFileFinder'

export class NodeFileSystem implements FileSystem {
  private static instance: NodeFileSystem

  private assetLoaderInstance?: NodeAssetLoader

  public static init(): NodeFileSystem {
    if (!this.instance) {
      this.instance = new NodeFileSystem()
    }

    return this.instance
  }

  public createFileFinder(globs: string[]): NodeFileFinder {
    return new NodeFileFinder(globs)
  }

  public assetLoader(): NodeAssetLoader {
    if (!this.assetLoaderInstance) {
      this.assetLoaderInstance = new NodeAssetLoader(this)
    }

    return this.assetLoaderInstance
  }

  public async fileRead(file: string): Promise<string> {
    return fs.readFile(path.resolve(file), 'utf8')
  }

  public async fileWrite(file: string, content: string): Promise<boolean> {
    try {
      await fs.writeFile(path.resolve(file), content, 'utf8')

      return true
    } catch (e) {
      return false
    }
  }

  public async fileCopy(from: string, to: string): Promise<boolean> {
    const fromFile = path.resolve(from)
    const toFile = path.resolve(to)

    try {
      await fs.copyFile(fromFile, toFile)

      return true
    } catch (e) {
      return false
    }
  }

  public async fileExists(file: string): Promise<boolean> {
    return fs
      .access(path.resolve(file), fs.constants.F_OK)
      .then(() => true)
      .catch(() => false)
  }

  public fileBasename(file: string): string {
    return path.basename(file, path.extname(file))
  }

  public fileDirname(file: string): string {
    return path.dirname(file)
  }

  public async ensureDirectoryExists(dir: string): Promise<boolean> {
    await fs.mkdir(path.resolve(dir), { recursive: true })

    return true
  }

  public async isDirectory(dir: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path.resolve(dir))

      return stats.isDirectory()
    } catch (e) {
      return false
    }
  }

  public async directoryCopy(from: string, to: string): Promise<boolean> {
    const fromDir = path.resolve(from)
    const toDir = path.resolve(to)

    if (!(await this.isDirectory(fromDir)) || !(await this.ensureDirectoryExists(toDir))) {
      return false
    }

    const dirents = await fs.readdir(fromDir, { withFileTypes: true })

    const res = await Promise.all(
      dirents.map(async dirent => {
        const fromPath = path.join(fromDir, dirent.name)
        const toPath = path.join(toDir, dirent.name)

        return (await dirent.isDirectory())
          ? this.directoryCopy(fromPath, toPath)
          : this.fileCopy(fromPath, toPath)
      }),
    )

    return Promise.resolve(res.every(value => value === true))
  }
}

export function cerateNodeFileSystem(): NodeFileSystem {
  return NodeFileSystem.init()
}
