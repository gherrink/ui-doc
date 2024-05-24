import { BlockParser } from './BlockParser'
import { DescriptionParser } from './DescriptionParser'
import {
  Block,
  BlockParserInterface,
  Context,
  ContextEntry,
  FilePath,
  Options,
  Renderer,
  Source,
} from './types'

export interface StyleguideEvent {}
export interface ContextEntryEvent extends StyleguideEvent { entry: ContextEntry, key: string }
export interface StyleguideEventMap {
  'context-entry': ContextEntryEvent
}

export class Styleguide {
  protected sources: {[key: FilePath]: Source}

  protected context: Context

  public parser: BlockParserInterface

  public renderer: Renderer

  protected listeners: Record<keyof StyleguideEventMap, ((event: StyleguideEventMap[keyof StyleguideEventMap]) => void)[]> = {
    'context-entry': [],
  }

  protected texts = {
    title: 'Styleguide',
  }

  protected generate = {
    titlePage: (page: ContextEntry) => (page.id !== 'index'
      ? `${page.title} | ${this.texts.title}`
      : this.texts.title),
    titleExample: (example: ContextEntry) => (example.title
      ? `${example.title} Example | ${this.texts.title}`
      : `Example | ${this.texts.title}`),
  }

  constructor(options: Options) {
    this.sources = {}
    this.context = {
      pages: [],
      entries: {},
    }

    this.parser = this.createParser()
    this.renderer = options.renderer

    this.registerListeners()
  }

  protected createParser(): BlockParserInterface {
    return new BlockParser(new DescriptionParser())
  }

  public on<K extends keyof StyleguideEventMap>(type: K, listener: (event: StyleguideEventMap[K]) => void): Styleguide {
    this.listeners[type].push(listener)

    return this
  }

  public off<K extends keyof StyleguideEventMap>(type: K, listener: (event: StyleguideEventMap[K]) => void): Styleguide {
    this.listeners[type] = this.listeners[type].filter(l => l !== listener)

    return this
  }

  protected emit<K extends keyof StyleguideEventMap>(type: K, event: StyleguideEventMap[K]): void {
    if (!this.listeners[type]) {
      return
    }

    this.listeners[type].forEach(listener => listener(event))
  }

  protected registerListeners() {
    this.on('context-entry', ({ entry, key }) => {
      if (!entry.example || entry.example.type !== 'html' || entry.example.src) {
        return
      }

      entry.example.fileName = `${key.replaceAll('.', '-')}.html`
      entry.example.src = `/examples/${entry.example.fileName}`
    })
  }

  public sourceRegister(file: string, content: string) {
    // TODO handle errors
    const source: Source = {
      blocks: this.parser.parse(content),
    }

    if (source) {
      this.sources[file] = source
      this.sourceToContext(source)
    }
  }

  public sourceChange(file: string, content: string) {
    console.log(`changed file: ${file}`, content)
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

    this.emit('context-entry', { entry, key: block.key })
  }

  protected contextEntry(key: string): ContextEntry {
    if (!this.context.entries[key]) {
      this.context.entries[key] = {
        id: this.contextEntryKeyToId(key),
        title: '',
        order: 0,
        titleLevel: 2,
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

      entry.titleLevel = parent.titleLevel + 1
      parent.sections.push(entry)
    }
  }

  public output(write: (file: string, content: string) => void) {
    this.context.pages.forEach(page => {
      write(`${page.id}.html`, this.pageContent(page))
    })

    Object.keys(this.context.entries).forEach(key => {
      const entry = this.context.entries[key]

      if (entry.example && entry.example.type === 'html' && entry.example.src) {
        write(`examples/${entry.example.fileName}`, this.exampleContent(entry.example, 'example'))
      }
    })
  }

  public pageContent(page: ContextEntry, layout?: string): string {
    return this.renderer.generate({
      title: this.generate.titlePage(page),
      page: JSON.parse(JSON.stringify(page)),
    }, layout)
  }

  public exampleContent(example: ContextEntry, layout: 'example'): string {
    const context = JSON.parse(JSON.stringify(example))

    context.title = this.generate.titleExample(example)

    return this.renderer.generate(context, layout)
  }
}
