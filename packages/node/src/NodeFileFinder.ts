import fs from 'node:fs/promises'
import path from 'node:path'

import type { FileFinder, FileFinderOnFoundCallback } from '@ui-doc/core'
import picomatch from 'picomatch'

export class NodeFileFinder implements FileFinder {
  public globs: string[] = []

  constructor(globs: string[] = []) {
    this.globs = globs.map(glob => path.resolve(glob))
  }

  public async search(fileFound: FileFinderOnFoundCallback): Promise<void> {
    await Promise.all(await Promise.all(this.globs.map(glob => this.searchGlob(glob, fileFound))))
  }

  protected searchGlob(
    glob: string,
    fileFound: FileFinderOnFoundCallback,
  ): Promise<Promise<void>[]> {
    const scan = picomatch.scan(glob, { parts: true, tokens: true })
    const pathBase = path.join(scan.prefix, scan.base)
    const recursive = scan.maxDepth === Infinity
    const regex = picomatch.makeRe(glob)

    return this.scanDirectory(pathBase, regex, fileFound, recursive)
  }

  protected async scanDirectory(
    directory: string,
    regex: RegExp,
    fileFound: FileFinderOnFoundCallback,
    recursive: boolean,
  ): Promise<Promise<void>[]> {
    const dirs = await fs.readdir(path.resolve(directory), { withFileTypes: true })

    return dirs.reduce(async (acc, dirent): Promise<Promise<void>[]> => {
      const list = await acc

      if (dirent.isDirectory()) {
        if (recursive) {
          list.push(
            ...(await this.scanDirectory(
              path.join(directory, dirent.name),
              regex,
              fileFound,
              recursive,
            )),
          )
        }
      } else if (dirent.isFile()) {
        const file = path.join(directory, dirent.name)

        if (file.match(regex)) {
          const onFound = fileFound(path.resolve(file))

          list.push(onFound instanceof Promise ? onFound : Promise.resolve(onFound))
        }
      }

      return Promise.resolve(list)
    }, Promise.resolve<Promise<void>[]>([]))
  }

  public matches(file: string): boolean {
    return this.globs.some(glob => picomatch.isMatch(file, glob))
  }
}
