import { BlockParser } from './BlockParser'
import {
  Block, BlockParserInterface, Context, ContextEntry, FilePath, FileReader, FileWriter, Options,
  Renderer,
  Source,
  SourceListener,
} from './types'

export class Styleguide {
  protected sources: {[key: FilePath]: Source}

  protected context: Context

  public listener: SourceListener

  public parser: BlockParserInterface

  public reader: FileReader

  public writer: FileWriter

  public renderer: Renderer

  protected loaded = false

  protected texts = {
    title: 'Styleguide',
  }

  protected generate = {
    pageTitle: (page: ContextEntry) => (page.id !== 'index'
      ? `${page.title} | ${this.texts.title}`
      : this.texts.title),
  }

  constructor(options: Options) {
    this.sources = {}
    this.context = {
      pages: [],
      entries: {},
    }

    this.parser = this.createParser()
    this.listener = this.createSourceListener(options.listener)
    this.reader = options.reader
    this.writer = options.writer
    this.renderer = options.renderer
  }

  public load() {
    if (this.loaded) {
      return
    }

    this.listener.scan()
    this.sourcesToContext()
    // TODO sort

    this.loaded = true
  }

  protected createSourceListener(listener: SourceListener): SourceListener {
    listener.registerOnNewFile(this.onNewFile.bind(this))
    listener.registerOnChangeFile(this.onChangeFile.bind(this))

    return listener
  }

  protected createParser(): BlockParserInterface {
    return new BlockParser()
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

  public output() {
    this.load()
    this.context.pages.forEach(page => {
      this.writer.write(`${page.id}.html`, this.pageContent(page))
    })
  }

  public pageContent(page: ContextEntry): string {
    return this.renderer.generate({
      title: this.generate.pageTitle(page),
      page,
    })
  }
}
