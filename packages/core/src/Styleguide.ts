import { BlockParser } from './BlockParser'
import { NodeFileReader } from './NodeFileReader'
import {
  Block, BlockParserInterface, Context, ContextEntry, FileFinder, FilePath, FileReader, Options,
  Source,
} from './types'

export class Styleguide {
  protected sources: {[key: FilePath]: Source}

  protected context: Context

  public finder: FileFinder

  public parser: BlockParserInterface

  public reader: FileReader

  protected loaded = false

  constructor(options: Options) {
    this.sources = {}
    this.context = {
      pages: [],
      entries: {},
    }
    this.finder = this.createFileFinder(options.finder)
    this.parser = this.createParser()
    this.reader = this.createReader()
  }

  public load() {
    if (this.loaded) {
      return
    }

    this.finder.scan()
    this.sourcesToContext()

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
    const source: Source = {
      blocks: this.parser.parse(content),
    }

    if (source) {
      this.sources[file] = source
    }
  }

  protected onChangeFile(file: string) {
    console.log(`changed file: ${file}`)
  }

  protected sourcesToContext() {
    Object.keys(this.sources).forEach(source => {
      this.sourceToContext(this.sources[source])
    })
  }

  protected sourceToContext(source: Source) {
    source.blocks.forEach(block => {
      this.blockToContext(block)
    })
  }

  protected blockToContext(block: Block) {
    const entry = this.contextEntry(block.key)

    entry.title = block.title || ''

    const ignored = ['key', 'title', 'page', 'section', 'location']

    Object.keys(block).forEach(blockType => {
      if (!ignored.includes(blockType)) {
        entry[blockType] = block[blockType]
      }
    })
  }

  protected contextEntry(key: string) {
    if (!this.context.entries[key]) {
      this.context.entries[key] = {
        id: this.contextEntryKeyToId(key),
        title: '',
        order: 0,
        sections: [],
      }

      this.contextEntryAppend(key, this.context.entries[key])
    }

    return this.context.entries[key]
  }

  protected contextEntryKeyToId(key: string) {
    if (!key.includes('.')) {
      return key
    }

    return key.split('.').slice(1).join('-')
  }

  protected contextEntryAppend(key: string, entry: ContextEntry) {
    const parts = key.split('.')

    if (parts.length === 1) {
      this.context.pages.push(entry)
    } else {
      const parent = this.contextEntry(parts.slice(0, -1).join('.'))

      parent.sections.push(entry)
    }
  }
}
