import type { FileFinder, fileFinderOnFound } from '@styleguide/core'
import fs from 'node:fs/promises'
import path from 'node:path'
import picomatch from 'picomatch'

export class NodeFileFinder implements FileFinder {
  public globs: string[] = []

  constructor(globs: string[] = []) {
    this.globs = globs.map(glob => path.resolve(glob))
  }

  public async search(fileFound: fileFinderOnFound): Promise<void> {
    await Promise.all(this.globs.map(glob => this.searchGlob(glob, fileFound)))
  }

  protected async searchGlob(glob: string, fileFound: fileFinderOnFound): Promise<void> {
    const scan = picomatch.scan(glob, { tokens: true, parts: true })
    const pathBase = path.join(scan.prefix, scan.base)
    const recursive = scan.maxDepth === Infinity
    const regex = picomatch.makeRe(glob)

    return this.scanDirectory(pathBase, regex, fileFound, recursive)
  }

  protected async scanDirectory(directory: string, regex: RegExp, fileFound: fileFinderOnFound, recursive: boolean): Promise<void> {
    const dirs = await fs.readdir(path.resolve(directory), { withFileTypes: true })

    await Promise.all(dirs.map(async dirent => {
      if (dirent.isDirectory()) {
        if (recursive) {
          await this.scanDirectory(path.join(directory, dirent.name), regex, fileFound, recursive)
        }

        return
      }

      if (dirent.isFile()) {
        const file = path.join(directory, dirent.name)

        if (file.match(regex)) {
          await fileFound(path.resolve(file))
        }
      }
    }))
  }

  public matches(file: string): boolean {
    return this.globs.some(glob => picomatch.isMatch(file, glob))
  }
}
