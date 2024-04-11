import { BlockParser } from './BlockParser'
import { NodeFileReader } from './NodeFileReader'
import {
  Block, BlockParserInterface, FileFinder, FileReader, Options,
} from './types'

type FilePath = string

export class Styleguide {
  protected sources: {[key: FilePath]: {blocks: Block[]}}

  public finder: FileFinder

  public parser: BlockParserInterface

  public reader: FileReader

  protected loaded = false

  constructor(options: Options) {
    this.sources = {}
    this.finder = this.createFileFinder(options.finder)
    this.parser = this.createParser()
    this.reader = this.createReader()
  }

  public load() {
    if (this.loaded) {
      return
    }

    this.finder.scan()

    this.loaded = true
  }

  protected createFileFinder(finder: FileFinder): FileFinder {
    finder.registerOnNewFile(this.onNewFile.bind(this))
    finder.registerOnChangeFile(this.onChangeFile.bind(this))

    return finder
  }

  protected createParser(): BlockParserInterface {
    return new BlockParser()
  }

  protected createReader(): FileReader {
    return new NodeFileReader()
  }

  protected onNewFile(file: string) {
    // TODO handle errors
    const content = this.reader.content(file)
    const source = {
      blocks: this.parser.parse(content),
    }

    if (!source) {
      return false
    }

    this.sources[file] = source

    return true
  }

  protected onChangeFile(file: string) {
    console.log(`changed file: ${file}`)
  }
}
