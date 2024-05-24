import {
  FileFinder, FileReader, SourceScanner, sourceScannerOnFound,
} from '@styleguide/core'

import { NodeFileFinder } from './NodeFileFinder'

export class NodeSourceScanner implements SourceScanner {
  protected finder: FileFinder

  protected reader: FileReader

  constructor(globs: string[], reader: FileReader) {
    this.finder = new NodeFileFinder(globs)
    this.reader = reader
  }

  scan(onFound: sourceScannerOnFound) {
    this.finder.search(file => {
      const content = this.reader.content(file)

      onFound(file, content)
    })
  }
}
