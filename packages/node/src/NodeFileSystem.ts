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

  public async ensureDirectoryExists(dir: string): Promise<void> {
    await fs.mkdir(path.resolve(dir), { recursive: true })
  }
}

export function cerateNodeFileSystem(): NodeFileSystem {
  return NodeFileSystem.init()
}
