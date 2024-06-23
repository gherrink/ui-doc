import { BlockParser } from './BlockParser'
import { DescriptionParser } from './DescriptionParser'
import type {
  Asset,
  Block,
  BlockExample,
  BlockParserInterface,
  Context,
  ContextEntry,
  ContextExample,
  FilePath,
  RendererInterface,
  StyleguideEventMap,
  StyleguideGenerateMap,
  StyleguideListeners,
  StyleguideOptions,
  StyleguideOutputCallback,
  StyleguideSource,
} from './types'

export class Styleguide {
  protected sources: Record<FilePath, StyleguideSource>

  protected context: Context

  public blockParser: BlockParserInterface

  public renderer: RendererInterface

  protected listeners: StyleguideListeners<keyof StyleguideEventMap> = {
    'context-entry-deleted': [],
    'context-entry-saved': [],
    example: [],
    output: [],
    page: [],
    'source-edit': [],
  }

  protected texts = {
    copyright: 'Styleguide',
    title: 'Styleguide',
  }

  protected generate: StyleguideGenerateMap = {
    exampleTitle: example =>
      example.title
        ? `${example.title} Example | ${this.texts.title}`
        : `Example | ${this.texts.title}`,
    footerText: () => `© ${new Date().getFullYear()} ${this.texts.copyright}`,
    homeLink: () => this.generate.resolveUrl('index.html', 'page'),
    logo: () => 'LOGO',
    menu: (menu, pages) => {
      Object.values(pages).forEach(page => {
        if (page.id === 'index') {
          return
        }

        menu.push({
          active: false,
          href: this.generate.pageLink(page),
          text: page.title,
        })
      })

      return menu
    },
    name: () => this.texts.title,
    pageLink: page => this.generate.resolveUrl(`${page.id}.html`, 'page'),
    pageTitle: page =>
      page.id !== 'index' ? `${page.title} | ${this.texts.title}` : this.texts.title,
    resolveUrl: uri => `/${uri}`,
  }

  constructor(options: StyleguideOptions) {
    this.sources = {}
    this.blockParser = options.blockParser ?? this.createParser()
    this.renderer = options.renderer
    this.generate = Object.assign(this.generate, options.generate ?? {})
    this.texts = Object.assign(this.texts, options.texts ?? {})
    this.context = {
      entries: {},
      exampleAssets: [],
      examples: {},
      menu: [],
      pageAssets: [],
      pages: {
        index: {
          id: 'index',
          order: 0,
          sections: [],
          title: this.generate.name(),
        },
      },
    }

    this.registerExampleListeners()
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
    this.listeners[type].splice(
      this.listeners[type].findIndex(l => l === listener),
      1,
    )

    return this
  }

  protected emit<K extends keyof StyleguideEventMap>(type: K, event: StyleguideEventMap[K]): void {
    if (!this.listeners[type]) {
      return
    }

    this.listeners[type].forEach(listener => listener(event))
  }

  public addAsset(asset: Asset) {
    asset.src = this.generate.resolveUrl(asset.src, 'asset')
    this.context.pageAssets.push(asset)
  }

  public addExampleAsset(asset: Asset) {
    asset.src = this.generate.resolveUrl(asset.src, 'asset-example')
    this.context.exampleAssets.push(asset)
  }

  protected registerExampleListeners() {
    const exampleKeyToId = (key: string) => key.replaceAll('.', '-')

    this.on('context-entry-saved', ({ entry, key }) => {
      if (!entry.example || entry.example.type !== 'html') {
        return
      }

      const example: BlockExample = entry.example

      if (!example.id) {
        example.id = exampleKeyToId(key)
      }

      if (!example.src || !example.file) {
        example.file = `examples/${example.id}.html`
        example.src = this.generate.resolveUrl(example.file, 'example')
      }

      this.context.examples[example.id] = example as ContextExample
    })

    this.on('context-entry-deleted', ({ entry, key }) => {
      if (entry.example && entry.example.type === 'html') {
        delete this.context.examples[exampleKeyToId(key)]
      }
    })

    this.on('output', ({ promises, write }) => {
      promises.push(
        ...Object.values(this.context.examples).map(example =>
          write(example.file, this.exampleContent(example)),
        ),
      )
    })
  }

  public sourceExists(file: string): boolean {
    return !!this.sources[file]
  }

  public sourceCreate(file: string, content: string) {
    const source: StyleguideSource = {
      blocks: this.blockParser.parse({ content, identifier: file }),
    }

    this.sources[file] = source
    this.emit('source-edit', { file, source, type: 'create' })
    this.sourceToContext(source)
    this.clearMenu()
  }

  public sourceUpdate(file: string, content: string) {
    if (!this.sourceExists(file)) {
      this.sourceCreate(file, content)

      return
    }

    const blocksNew = this.blockParser.parse({ content, identifier: file })
    const sourceBlockKeysOld = this.sources[file].blocks.map(block => block.key)
    const sourceBlockKeysNew = blocksNew.map(block => block.key)

    // write new blocks to source
    this.sources[file].blocks = blocksNew
    this.emit('source-edit', { file, source: this.sources[file], type: 'update' })

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

    this.emit('source-edit', { file, source: this.sources[file], type: 'delete' })
    this.sources[file].blocks
      .map(block => block.key)
      .sort((a, b) => b.length - a.length)
      .forEach(key => this.contextEntryDelete(key))
    delete this.sources[file]

    this.clearMenu()
  }

  protected sourceToContext(source: StyleguideSource) {
    source.blocks.forEach(block => {
      this.blockToContext(block)
    })
  }

  protected blockToContext(block: Block) {
    const entry = this.contextEntry(block.key)
    const blockIgnoredKeys = ['key', 'title', 'page', 'section', 'location']
    const entryIgnoredKeys = ['id', 'title', 'titleLevel', 'order', 'sections']
    const blockKeys = Object.keys(block)

    if (
      (typeof block.title === 'string' && block.title) ||
      (entry.title === entry.id && block.title)
    ) {
      entry.title = block.title
    }

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

    this.emit('context-entry-saved', { entry, key: block.key })
  }

  protected contextEntry(key: string): ContextEntry {
    if (!this.context.entries[key]) {
      const id = this.contextEntryKeyToId(key)

      this.context.entries[key] = {
        id,
        order: 0,
        sections: [],
        title: id,
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
      delete this.context.entries[entry.id]
    } else {
      const parent = this.context.entries[parts.slice(0, -1).join('.')]
      const index = parent.sections.findIndex(section => section.id === entry.id)

      parent.sections.splice(index, 1)
    }

    delete this.context.entries[key]

    this.emit('context-entry-deleted', { entry, key })
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
      this.context.pages[key] = entry
    } else {
      const parent = this.contextEntry(parts.slice(0, -1).join('.'))

      entry.titleLevel = parent.titleLevel + 1
      parent.sections.push(entry)
    }
  }

  public pages(): Context['pages'] {
    return this.context.pages
  }

  public entries(): Context['entries'] {
    return this.context.entries
  }

  public async output(output: StyleguideOutputCallback): Promise<void> {
    const write = async (file: string, content: string) => {
      const result = output(file, content)

      return result instanceof Promise ? result : Promise.resolve(result)
    }

    const pages = Object.values(this.context.pages)
    const promises = pages.map(page =>
      write(`${page.id}.html`, this.pageContent(page, page.layout)),
    )

    this.emit('output', { promises, write })

    await Promise.all(promises)
  }

  public page(pageId: string): string | null {
    const page = this.context.pages[pageId]

    return page ? this.pageContent(page, page.layout) : null
  }

  public pageContent(page: ContextEntry, layout?: string): string {
    const context = {
      assets: this.context.pageAssets,
      footerText: this.generate.footerText(),
      homeLink: this.generate.homeLink(),
      logo: this.generate.logo(),
      menu: this.createMenu().map(item => {
        item.active = item.href === this.generate.pageLink(page)

        return item
      }),
      name: this.generate.name(),
      page: JSON.parse(JSON.stringify(page)),
      title: this.generate.pageTitle(page),
    }

    this.emit('page', { layout, page })

    return this.renderer.generate(context, layout)
  }

  public example(exampleId: string): string | null {
    const example = this.context.examples[exampleId]

    return example ? this.exampleContent(example) : null
  }

  public exampleContent(example: ContextExample, layout = 'example'): string {
    const context = JSON.parse(JSON.stringify(example))

    context.title = this.generate.exampleTitle(example)
    context.assets = this.context.exampleAssets
    this.emit('example', { example, layout })

    return this.renderer.generate(context, layout)
  }

  protected createMenu(): Context['menu'] {
    if (this.context.menu.length === 0) {
      this.context.menu = this.generate.menu(this.context.menu, this.context.pages)
    }

    return this.context.menu
  }

  protected clearMenu() {
    this.context.menu = []
  }
}
