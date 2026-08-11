import type { AssetLoader, FilePath, FileSystem } from '@ui-doc/core'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

import process from 'node:process'

export class NodeAssetLoader implements AssetLoader {
  private resolvedPackages: Record<string, string | null> = {}

  private readonly fileSystem: FileSystem

  private readonly require: NodeRequire

  /**
   * Resolves relative to the consuming project rather than to this package.
   * The packages looked up here - @ui-doc/html-renderer and its assets - are
   * the consumer's dependencies, not this one's, so resolving from
   * import.meta.url only worked where a flat node_modules happened to hoist
   * them into view. Under a strict layout (pnpm without shamefully-hoist) that
   * walk never reaches them.
   */
  private readonly consumerRequire: NodeRequire

  public constructor(fileSystem: FileSystem) {
    this.fileSystem = fileSystem
    this.require = createRequire(import.meta.url)
    this.consumerRequire = createRequire(path.join(process.cwd(), 'noop.js'))
  }

  /**
   * Module resolution paths, consumer first then this package's own.
   * @param packageName Package to resolve
   * @returns Candidate node_modules directories, de-duplicated
   */
  private resolvePaths(packageName: string): string[] {
    return [
      ...(this.consumerRequire.resolve.paths(packageName) ?? []),
      ...(this.require.resolve.paths(packageName) ?? []),
    ].filter((value, index, all) => all.indexOf(value) === index)
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

    const paths = this.resolvePaths(packageName)

    if (paths.length === 0) {
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
    // Consumer first, for the same reason as resolvePaths.
    for (const req of [this.consumerRequire, this.require]) {
      try {
        const resolvedFile = req.resolve(file)

        if (await this.fileSystem.fileExists(resolvedFile)) {
          return resolvedFile
        }
      } catch {
        // Not resolvable from this base; try the next.
      }
    }

    return undefined
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
