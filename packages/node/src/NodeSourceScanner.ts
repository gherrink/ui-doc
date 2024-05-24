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

  public async scan(onFound: sourceScannerOnFound): Promise<void> {
    await this.finder.search(async file => {
      const content = await this.reader.content(file)

      return onFound(file, content)
    })
  }
}
