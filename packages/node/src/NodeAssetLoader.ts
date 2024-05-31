/* eslint-disable no-empty-function */
import type { AssetLoader } from '@styleguide/core'
import fs from 'fs/promises'
import path from 'path'

import { NodeFileSystem } from './NodeFileSystem'

export class NodeAssetLoader implements AssetLoader {
  protected static instance: NodeAssetLoader

  protected resolvedPackages: Record<string, string | null> = {}

  protected fileSystem: NodeFileSystem

  protected constructor(fileSystem: NodeFileSystem = NodeFileSystem.init()) {
    this.fileSystem = fileSystem
  }

  public static init(): NodeAssetLoader {
    if (!this.instance) {
      this.instance = new NodeAssetLoader()
    }

    return this.instance
  }

  public async packageExists(packageName: string): Promise<boolean> {
    return (await this.packagePath(packageName)) !== undefined
  }

  public async packagePath(packageName: string): Promise<string | undefined> {
    if (this.resolvedPackages[packageName] !== undefined) {
      return this.resolvedPackages[packageName] === null ? undefined : (this.resolvedPackages[packageName] as string)
    }

    const paths = require.resolve.paths(packageName)

    if (!paths) {
      throw new Error('Could not resolve require paths')
    }

    this.resolvedPackages[packageName] = await paths.reduce(async (acc, nodePath) => {
      if (await acc !== null) {
        return acc
      }

      const dir = path.join(nodePath, packageName)

      return await fs.access(dir, fs.constants.R_OK).then(() => true).catch(() => false)
        ? dir
        : acc
    }, Promise.resolve<string | null>(null))

    return this.resolvedPackages[packageName] !== null
      ? (this.resolvedPackages[packageName] as string)
      : undefined
  }

  public async resolve(file: string): Promise<string | undefined> {
    const resolvedFile = require.resolve(file)

    return await this.fileSystem.fileExists(resolvedFile)
      ? resolvedFile
      : undefined
  }

  public async copy(from: string, to: string): Promise<void> {
    const fromPath = await this.resolve(from)

    if (!fromPath) {
      throw new Error(`Could not resolve source asset "${from}"`)
    }

    await this.fileSystem.fileCopy(fromPath, to)
  }

  public async read(file: string): Promise<string> {
    const fromPath = await this.resolve(file)

    if (!fromPath) {
      throw new Error(`Could not resolve asset "${file}"`)
    }

    return this.fileSystem.fileRead(fromPath)
  }
}
