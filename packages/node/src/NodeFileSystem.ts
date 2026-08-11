import fs from 'node:fs/promises'
import path from 'node:path'

import type { FilePath, FileSystem } from '@ui-doc/core'

import { NodeAssetLoader } from './NodeAssetLoader'
import { NodeFileFinder } from './NodeFileFinder'

export class NodeFileSystem implements FileSystem {
  private static instance: NodeFileSystem

  private assetLoaderInstance?: NodeAssetLoader

  private constructor() {}

  public static init(): NodeFileSystem {
    if (this.instance === undefined) {
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

  public resolve(file: FilePath): FilePath {
    return path.resolve(file)
  }

  public async fileRead(file: FilePath): Promise<string> {
    return fs.readFile(this.resolve(file), 'utf8')
  }

  public async fileWrite(file: FilePath, content: string): Promise<boolean> {
    return fs
      .writeFile(this.resolve(file), content, 'utf8')
      .then(() => true)
      .catch(() => false)
  }

  public async fileCopy(from: FilePath, to: FilePath): Promise<boolean> {
    return fs
      .copyFile(this.resolve(from), this.resolve(to))
      .then(() => true)
      .catch(() => false)
  }

  public async fileExists(file: FilePath): Promise<boolean> {
    return fs
      .access(this.resolve(file), fs.constants.F_OK)
      .then(() => true)
      .catch(() => false)
  }

  public fileBasename(file: FilePath): string {
    return path.basename(file, path.extname(file))
  }

  public fileDirname(file: FilePath): string {
    return path.dirname(file)
  }

  public async ensureDirectoryExists(dir: FilePath): Promise<boolean> {
    await fs.mkdir(this.resolve(dir), { recursive: true })

    return true
  }

  public async isDirectory(dir: FilePath): Promise<boolean> {
    return fs
      .stat(this.resolve(dir))
      .then(stats => stats.isDirectory())
      .catch(() => false)
  }

  public async directoryCopy(from: FilePath, to: FilePath): Promise<boolean> {
    const fromDir = this.resolve(from)
    const toDir = this.resolve(to)

    if (!(await this.isDirectory(fromDir)) || !(await this.ensureDirectoryExists(toDir))) {
      return false
    }

    const dirents = await fs.readdir(fromDir, { withFileTypes: true })

    const res = await Promise.all(
      dirents.map(async dirent => {
        const fromPath = path.join(fromDir, dirent.name)
        const toPath = path.join(toDir, dirent.name)

        return dirent.isDirectory()
          ? this.directoryCopy(fromPath, toPath)
          : this.fileCopy(fromPath, toPath)
      }),
    )

    return res.every(value => value)
  }
}

export function createNodeFileSystem(): NodeFileSystem {
  return NodeFileSystem.init()
}

/** @deprecated Use createNodeFileSystem instead */
export const cerateNodeFileSystem = createNodeFileSystem
