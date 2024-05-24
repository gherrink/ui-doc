import { FileFinder } from '@styleguide/core'
import fs from 'node:fs'
import path from 'node:path'
import picomatch from 'picomatch'

export class NodeFileFinder implements FileFinder {
  public globs: string[] = []

  constructor(globs: string[] = []) {
    this.globs = globs
  }

  public search(fileFound: (file: string) => void) {
    this.globs.forEach(glob => {
      const scan = picomatch.scan(glob, { tokens: true, parts: true })
      const pathBase = path.join(scan.prefix, scan.base)
      const recursive = scan.maxDepth === Infinity
      const regex = picomatch.makeRe(glob)

      this.scanDirectory(pathBase, regex, fileFound, recursive)
    })
  }

  protected scanDirectory(directory: string, regex: RegExp, fileFound: (file: string) => void, recursive: boolean) {
    fs.readdirSync(path.resolve(directory), { withFileTypes: true }).forEach(dirent => {
      if (dirent.isDirectory()) {
        if (recursive) {
          this.scanDirectory(path.join(directory, dirent.name), regex, fileFound, recursive)
        }

        return
      }

      if (dirent.isFile()) {
        const file = path.join(directory, dirent.name)

        if (file.match(regex)) {
          fileFound(file)
        }
      }
    })
  }

  public matches(file: string): boolean {
    return this.globs.some(glob => picomatch.isMatch(file, glob))
  }
}
