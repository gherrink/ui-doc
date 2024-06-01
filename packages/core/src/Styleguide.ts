import { BlockParser } from './BlockParser'
import { DescriptionParser } from './DescriptionParser'
import {
  Block,
  BlockParserInterface,
  Context,
  ContextEntry,
  FilePath,
  Options,
  RendererInterface,
  Source,
} from './types'

export interface StyleguideEvent {}
export interface ContextEntryEvent extends StyleguideEvent {
  entry: ContextEntry
  key: string
}
export interface StyleguideEventMap {
  'context-entry': ContextEntryEvent
}

export class Styleguide {
  protected sources: Record<FilePath, Source>

  protected context: Context

  public blockParser: BlockParserInterface

  public renderer: RendererInterface

  protected listeners: Record<
    keyof StyleguideEventMap,
    ((event: StyleguideEventMap[keyof StyleguideEventMap]) => void)[]
  > = {
    'context-entry': [],
  }

  protected texts = {
    title: 'Styleguide',
  }

  protected generate = {
    homeLink: () => '/index.html',
    linkPage: (page: ContextEntry) => `/${page.id}.html`,
    logo: () => 'LOGO',
    name: () => this.texts.title,
    titleExample: (example: ContextEntry) =>
      example.title
        ? `${example.title} Example | ${this.texts.title}`
        : `Example | ${this.texts.title}`,
    titlePage: (page: ContextEntry) =>
      page.id !== 'index' ? `${page.title} | ${this.texts.title}` : this.texts.title,
  }

  constructor(options: Options) {
    this.sources = {}
    this.context = {
      entries: {},
      menu: [],
      pages: [],
    }

    this.blockParser = options.blockParser ?? this.createParser()
    this.renderer = options.renderer

    this.registerListeners()
  }

  protected createParser(): BlockParserInterface {
    return new BlockParser(new DescriptionParser())
  }

  public on<K extends keyof StyleguideEventMap>(
    type: K,
    listener: (event: StyleguideEventMap[K]) => void,
  ): Styleguide {
    this.listeners[type].push(listener)

    return this
  }

  public off<K extends keyof StyleguideEventMap>(
    type: K,
    listener: (event: StyleguideEventMap[K]) => void,
  ): Styleguide {
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
      if (entry.example && entry.example.type === 'html' && !entry.example.src) {
        entry.example.fileName = `${key.replaceAll('.', '-')}.html`
        entry.example.src = `/examples/${entry.example.fileName}`
      }
    })
  }

  public sourceExists(file: string): boolean {
    return !!this.sources[file]
  }

  public sourceCreate(file: string, content: string) {
    // TODO handle errors
    const source: Source = {
      blocks: this.blockParser.parse(content),
    }

    this.sources[file] = source
    this.sourceToContext(source)
    this.clearMenu()
  }

  public sourceUpdate(file: string, content: string) {
    if (!this.sourceExists(file)) {
      this.sourceCreate(file, content)

      return
    }

    const blocksNew = this.blockParser.parse(content)
    const sourceBlockKeysOld = this.sources[file].blocks.map(block => block.key)
    const sourceBlockKeysNew = blocksNew.map(block => block.key)

    // write new blocks to source
    this.sources[file].blocks = blocksNew

    // update and add new blocks to context
    blocksNew.forEach(block => this.blockToContext(block))

    // remove old blocks
    sourceBlockKeysOld
      .filter(key => !sourceBlockKeysNew.includes(key))
      .sort((a, b) => b.length - a.length)
      .forEach(key => this.contextEntryDelete(key))

    this.clearMenu()
  }

  public sourceDelete(file: string) {
    if (!this.sourceExists(file)) {
      return
    }

    this.sources[file].blocks
      .map(block => block.key)
      .sort((a, b) => b.length - a.length)
      .forEach(key => this.contextEntryDelete(key))
    delete this.sources[file]

    this.clearMenu()
  }

  protected sourceToContext(source: Source) {
    source.blocks.forEach(block => {
      this.blockToContext(block)
    })
  }

  protected blockToContext(block: Block) {
    const entry = this.contextEntry(block.key)
    const blockIgnoredKeys = ['key', 'title', 'page', 'section', 'location']
    const entryIgnoredKeys = ['id', 'title', 'titleLevel', 'order', 'sections']
    const blockKeys = Object.keys(block)

    entry.title = !entry.title || block.title ? block.title ?? '' : entry.title

    blockKeys.forEach(blockType => {
      if (!blockIgnoredKeys.includes(blockType)) {
        entry[blockType] = block[blockType]
      }
    })

    Object.keys(entry).forEach(key => {
      if (!entryIgnoredKeys.includes(key) && !blockKeys.includes(key)) {
        delete entry[key]
      }
    })

    this.emit('context-entry', { entry, key: block.key })
  }

  protected contextEntry(key: string): ContextEntry {
    if (!this.context.entries[key]) {
      this.context.entries[key] = {
        id: this.contextEntryKeyToId(key),
        order: 0,
        sections: [],
        title: '',
        titleLevel: 2,
      }

      this.contextEntryAppend(key, this.context.entries[key])
    }

    return this.context.entries[key]
  }

  protected contextEntryDelete(key: string) {
    const parts = key.split('.')
    const entry = this.context.entries[key]

    if (!entry) {
      return
    }

    // if entry has sections it can not be deleted. Reset it instead.
    if (entry.sections.length > 0) {
      const ignore = ['id', 'title', 'order', 'titleLevel', 'sections']

      Object.keys(entry).forEach(entryKey => {
        if (!ignore.includes(entryKey)) {
          delete entry[entryKey]
        }
      })

      return
    }

    if (parts.length === 1) {
      const index = this.context.pages.findIndex(page => page.id === entry.id)

      this.context.pages.splice(index, 1)
    } else {
      const parent = this.context.entries[parts.slice(0, -1).join('.')]
      const index = parent.sections.findIndex(section => section.id === entry.id)

      parent.sections.splice(index, 1)
    }

    delete this.context.entries[key]
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

  public pages(): ContextEntry[] {
    return this.context.pages
  }

  public entries(): Record<string, ContextEntry> {
    return this.context.entries
  }

  public async output(write: (file: string, content: string) => Promise<void>): Promise<void> {
    await Promise.all([
      ...this.context.pages.map(page => write(`${page.id}.html`, this.pageContent(page))),
      ...Object.keys(this.context.entries).map(key => {
        const entry = this.context.entries[key]

        return entry.example && entry.example.type === 'html' && entry.example.src
          ? write(
              `examples/${entry.example.fileName}`,
              this.exampleContent(entry.example, 'example'),
            )
          : Promise.resolve()
      }),
    ])
  }

  public pageContent(page: ContextEntry, layout?: string): string {
    return this.renderer.generate(
      {
        homeLink: this.generate.homeLink(),
        logo: this.generate.logo(),
        menu: this.createMenu().map(item => {
          item.active = item.href === this.generate.linkPage(page)

          return item
        }),
        name: this.generate.name(),
        page: JSON.parse(JSON.stringify(page)),
        title: this.generate.titlePage(page),
      },
      layout,
    )
  }

  public exampleContent(example: ContextEntry, layout: 'example'): string {
    const context = JSON.parse(JSON.stringify(example))

    context.title = this.generate.titleExample(example)

    return this.renderer.generate(context, layout)
  }

  protected createMenu(): Context['menu'] {
    if (this.context.menu.length === 0) {
      this.context.pages.forEach(page => {
        this.context.menu.push({
          active: false,
          href: this.generate.linkPage(page),
          text: page.title,
        })
      })
    }

    return this.context.menu
  }

  protected clearMenu() {
    this.context.menu = []
  }
}
