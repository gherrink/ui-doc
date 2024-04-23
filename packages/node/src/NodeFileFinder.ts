import fs from 'fs'
import path from 'path'
import picomatch from 'picomatch'

import { FileFinder } from '../../core/src/types'

export class NodeFileFinder implements FileFinder {
  public scan(globs: string[], fileFound: (file: string) => void) {
    globs.forEach(glob => {
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
}
