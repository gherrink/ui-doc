import fs from 'fs'
import path from 'path'
import picomatch from 'picomatch'

import { FileFinder, FileFinderOptions } from './types'

export class BaseFileFinder implements FileFinder {
  protected fileGlobs: string[]

  protected onNewFile?: (file: string) => void

  constructor(options: FileFinderOptions) {
    this.fileGlobs = options.globs
  }

  public registerOnNewFile(callback: (file: string) => void) {
    this.onNewFile = callback
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public registerOnChangeFile(callback: (file: string) => void) {}

  public scan() {
    this.fileGlobs.forEach(glob => {
      const scan = picomatch.scan(glob, { tokens: true, parts: true })
      const pathBase = path.join(scan.prefix, scan.base)
      const recursive = scan.maxDepth === Infinity
      const regex = picomatch.makeRe(glob)

      this.scanDirectory(pathBase, regex, recursive)
    })
  }

  protected scanDirectory(directory: string, regex: RegExp, recursive: boolean) {
    fs.readdirSync(path.resolve(directory), { withFileTypes: true }).forEach(dirent => {
      if (dirent.isDirectory()) {
        if (recursive) {
          this.scanDirectory(path.join(directory, dirent.name), regex, recursive)
        }

        return
      }

      if (dirent.isFile()) {
        const file = path.join(directory, dirent.name)

        if (this.onNewFile && file.match(regex)) {
          this.onNewFile(file)
        }
      }
    })
  }
}
