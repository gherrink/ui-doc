import type { AssetLoader, FilePath, FileSystem } from '@ui-doc/core'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'

import path from 'node:path'

export class NodeAssetLoader implements AssetLoader {
  private resolvedPackages: Record<string, string | null> = {}

  private readonly fileSystem: FileSystem

  private readonly require: NodeRequire

  public constructor(fileSystem: FileSystem) {
    this.fileSystem = fileSystem
    this.require = createRequire(import.meta.url)
  }

  public async packageExists(packageName: string): Promise<boolean> {
    return (await this.packagePath(packageName)) !== undefined
  }

  public async packagePath(packageName: string): Promise<string | undefined> {
    if (this.resolvedPackages[packageName] !== undefined) {
      return this.resolvedPackages[packageName] === null
        ? undefined
        : this.resolvedPackages[packageName] ?? undefined
    }

    const paths = this.require.resolve.paths(packageName)

    if (!paths) {
      throw new Error('Could not resolve require paths')
    }

    for (const nodePath of paths) {
      const dir = path.join(nodePath, packageName)
      const exists = await fs
        .access(dir, fs.constants.R_OK)
        .then(() => true)
        .catch(() => false)

      if (exists) {
        this.resolvedPackages[packageName] = dir
        return dir
      }
    }

    this.resolvedPackages[packageName] = null
    return undefined
  }

  public async resolve(file: FilePath): Promise<string | undefined> {
    const resolvedFile = this.require.resolve(file)

    return (await this.fileSystem.fileExists(resolvedFile)) ? resolvedFile : undefined
  }

  /**
   * Copies an asset from a resolved package path to a destination.
   * @param from - Source path relative to node_modules
   * @param to - Destination path
   * @throws Error if the source asset cannot be resolved
   */
  public async copy(from: FilePath, to: FilePath): Promise<void> {
    const fromPath = await this.resolve(from)

    if (fromPath === undefined || fromPath === '') {
      throw new Error(`Could not resolve source asset "${from}"`)
    }

    await this.fileSystem.fileCopy(fromPath, to)
  }

  public async read(file: FilePath): Promise<string> {
    const fromPath = await this.resolve(file)

    if (fromPath === undefined || fromPath === '') {
      throw new Error(`Could not resolve asset "${file}"`)
    }

    return this.fileSystem.fileRead(fromPath)
  }
}
