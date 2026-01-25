import type { Block, BlockExample } from './Block.types'
import type { BlockParser } from './BlockParser.types'
import type { Asset, Context, ContextEntry, ContextExample, GenerateExampleContext } from './Context.types'
import type { FilePath } from './FileSystem.types'
import type { Renderer } from './Renderer.types'
import type { GenerateFunctions, Options, OutputCallback, Source } from './UIDoc.types'
import type { ContextEntryEvent, UIDocEventMap as EventMap } from './UIDocEvent.types'
import { createCommentBlockParser } from './CommentBlockParser'
import { EventEmitterBase } from './EventEmitterBase'
import { createMarkdownDescriptionParser } from './MarkdownDescriptionParser'

export class UIDoc extends EventEmitterBase<EventMap> {
  protected sources: Record<FilePath, Source>

  protected context: Context

  public blockParser: BlockParser

  public renderer: Renderer

  protected texts = {
    copyright: 'UI-Doc',
    title: 'UI-Doc',
  }

  protected generate: GenerateFunctions = {
    exampleTitle: example =>
      example.title
        ? `${example.title} Example | ${this.texts.title}`
        : `Example | ${this.texts.title}`,
    footerText: () => `© ${new Date().getFullYear()} ${this.texts.copyright}`,
    homeLink: () => this.generate.resolve('index.html', 'page'),
    logo: () => 'LOGO',
    menu: (menu, pages) => {
      Object.values(pages).forEach(page => {
        if (page.id === 'index') {
          return
        }

        menu.push({
          active: false,
          href: this.generate.pageLink(page),
          order: page.order,
          text: page.title,
        })
      })

      return menu.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order
        }

        const nameA = a.text.toUpperCase()
        const nameB = b.text.toUpperCase()

        if (nameA === nameB) {
          return 0
        }

        return nameA < nameB ? -1 : 1
      })
    },
    name: () => this.texts.title,
    pageLink: page => this.generate.resolve(`${page.id}.html`, 'page'),
    pageTitle: page =>
      page.id !== 'index' ? `${page.title} | ${this.texts.title}` : this.texts.title,
    resolve: uri => `${uri}`,
  }

  constructor(options: Options) {
    super()
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

  protected createParser(): BlockParser {
    return createCommentBlockParser(createMarkdownDescriptionParser())
  }

  public replaceGenerate<K extends keyof GenerateFunctions>(
    generate: K,
    callback: GenerateFunctions[K],
  ): void {
    this.generate[generate] = callback
  }

  public addAsset(asset: Asset): void {
    asset.src = this.generate.resolve(asset.src, 'asset')
    this.context.pageAssets.push(asset)
  }

  public addExampleAsset(asset: Asset): void {
    asset.src = this.generate.resolve(asset.src, 'asset-example')
    this.context.exampleAssets.push(asset)
  }

  protected registerExampleListeners(): void {
    const exampleKeyToId = (key: string): string => key.replaceAll('.', '-')

    this.on('context-entry', ({ entry, key, type }) => {
      if (type === 'delete' || !entry.example || entry.example.type !== 'html') {
        return
      }

      const example: BlockExample = entry.example

      if (example.id === undefined || example.id === '') {
        example.id = exampleKeyToId(key)
      }

      if ((example.src === undefined || example.src === '') || (example.file === undefined || example.file === '')) {
        example.file = `examples/${example.id}.html`
        example.src = this.generate.resolve(example.file, 'example')
      }

      this.context.examples[example.id] = example as ContextExample
    })

    this.on('context-entry', ({ entry, key, type }) => {
      if (type === 'delete' && entry.example && entry.example.type === 'html') {
        delete this.context.examples[exampleKeyToId(key)]
      }
    })

    this.on('output', ({ promises, write }) => {
      promises.push(
        ...Object.values(this.context.examples).map(async example =>
          write(example.file, this.exampleContent(example)),
        ),
      )
    })
  }

  public sourceExists(file: string): boolean {
    return this.sources[file] !== undefined
  }

  public sourceCreate(file: string, content: string): void {
    const source: Source = {
      blocks: this.blockParser.parse({ content, identifier: file }),
    }

    this.sources[file] = source
    this.emit('source', { file, source, type: 'create' })
    this.sourceToContext(source)
    this.clearMenu()
  }

  public sourceUpdate(file: string, content: string): void {
    if (!this.sourceExists(file)) {
      this.sourceCreate(file, content)

      return
    }

    const blocksNew = this.blockParser.parse({ content, identifier: file })
    const sourceBlockKeysOld = this.sources[file].blocks.map(block => block.key)
    const sourceBlockKeysNew = blocksNew.map(block => block.key)

    // write new blocks to source
    this.sources[file].blocks = blocksNew
    this.emit('source', { file, source: this.sources[file], type: 'update' })

    // update and add new blocks to context
    blocksNew.forEach(block => this.blockToContext(block))

    // remove old blocks
    sourceBlockKeysOld
      .filter(key => !sourceBlockKeysNew.includes(key))
      .sort((a, b) => b.length - a.length)
      .forEach(key => this.contextEntryDelete(key))

    this.clearMenu()
  }

  public sourceDelete(file: string): void {
    if (!this.sourceExists(file)) {
      return
    }

    this.emit('source', { file, source: this.sources[file], type: 'delete' })
    this.sources[file].blocks
      .map(block => block.key)
      .sort((a, b) => b.length - a.length)
      .forEach(key => this.contextEntryDelete(key))
    delete this.sources[file]

    this.clearMenu()
  }

  protected sourceToContext(source: Source): void {
    source.blocks.forEach(block => {
      this.blockToContext(block)
    })
  }

  protected blockToContext(block: Block): void {
    const entry = this.contextEntry(block.key)
    // Explicit list of properties that can be transferred from Block to ContextEntry
    const transferableProps = ['order', 'description', 'code', 'example', 'colors', 'spaces', 'icons', 'hideCode'] as const
    type TransferableProp = typeof transferableProps[number]

    const event: ContextEntryEvent = {
      changes: { deleted: [], updated: {} },
      entry,
      key: block.key,
      type: entry.id === entry.title ? 'create' : 'update',
    }

    // Handle title specially (has different source/target logic)
    if (
      (typeof block.title === 'string' && block.title !== '')
      || (entry.title === entry.id && block.title !== undefined && block.title !== '')
    ) {
      event.changes.updated.title = { from: entry.title, to: block.title }
      entry.title = block.title
    }

    // Transfer properties from block to entry
    transferableProps.forEach((prop: TransferableProp) => {
      const blockValue = block[prop]
      const entryValue = entry[prop]

      if (blockValue !== undefined) {
        event.changes.updated[prop] = { from: entryValue, to: blockValue }
        // Safe assignment: both Block and ContextEntry have identical types for these props
        ;(entry[prop] as typeof blockValue) = blockValue
      } else if (entryValue !== undefined) {
        // Property existed in entry but not in new block - delete it
        event.changes.deleted.push(prop)
        delete entry[prop]
      }
    })

    this.emit('context-entry', event)
  }

  protected contextEntry(key: string): ContextEntry {
    if (this.context.entries[key] === undefined) {
      const id = this.contextEntryKeyToId(key)

      this.context.entries[key] = {
        id,
        order: 0,
        sections: [],
        title: id,
        titleLevel: 1,
      }

      this.contextEntryAppend(key, this.context.entries[key])
    }

    return this.context.entries[key]
  }

  protected contextEntryDelete(key: string): void {
    const parts = key.split('.')
    const entry = this.context.entries[key]

    if (entry === undefined) {
      return
    }

    // if entry has sections it can not be deleted. Reset it instead.
    if (entry.sections.length > 0) {
      entry.title = entry.id
      entry.order = 0
      // Reset all transferable properties
      delete entry.description
      delete entry.layout
      delete entry.code
      delete entry.example
      delete entry.colors
      delete entry.spaces
      delete entry.icons
      delete entry.hideCode

      return
    }

    if (parts.length === 1) {
      delete this.context.entries[entry.id]
      if (key !== 'index') {
        delete this.context.pages[key]
      }
    } else {
      // remove from parent
      const parent = this.context.entries[parts.slice(0, -1).join('.')]
      const index = parent.sections.findIndex(section => section.id === entry.id)

      parent.sections.splice(index, 1)

      // if parent has no more sections and title equal id (means it dose only exist as placeholder
      // and was not defined in source), we can delete it
      if (parent.sections.length === 0 && parent.title === parent.id) {
        this.contextEntryDelete(parts.slice(0, -1).join('.'))
      }
    }

    delete this.context.entries[key]

    this.emit('context-entry', { entry, key, type: 'delete' })
  }

  protected contextEntryKeyToId(key: string): string {
    if (!key.includes('.')) {
      return key
    }

    return key.split('.').slice(1).join('-')
  }

  protected contextEntryAppend(key: string, entry: ContextEntry): void {
    const parts = key.split('.')

    if (parts.length === 1) {
      this.context.pages[key] = entry
    } else {
      const parent = this.contextEntry(parts.slice(0, -1).join('.'))

      entry.titleLevel = (parent.titleLevel ?? 1) + 1
      parent.sections.push(entry)
    }
  }

  public pages(): Context['pages'] {
    return this.context.pages
  }

  public entries(): Context['entries'] {
    return this.context.entries
  }

  public async output(output: OutputCallback): Promise<void> {
    const write = async (file: string, content: string): Promise<void> => {
      const result = output(file, content)

      return result instanceof Promise ? result : Promise.resolve(result)
    }

    const pages = Object.values(this.pages())
    const promises = pages.map(async page =>
      write(`${page.id}.html`, this.pageContent(page, page.layout)),
    )

    this.emit('output', { promises, write })

    await Promise.all(promises)
  }

  public page(pageId: string): string | null {
    const page = this.context.pages[pageId]

    return page !== undefined ? this.pageContent(page, page.layout) : null
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
      page: JSON.parse(JSON.stringify(page)) as ContextEntry,
      title: this.generate.pageTitle(page),
    }

    this.emit('page', { layout, page })

    return this.renderer.generate(context, layout)
  }

  public example(exampleId: string): string | null {
    const example = this.context.examples[exampleId]

    return example !== undefined ? this.exampleContent(example) : null
  }

  public exampleContent(example: ContextExample, layout = 'example'): string {
    const context: GenerateExampleContext = {
      ...JSON.parse(JSON.stringify(example)) as ContextExample,
      title: this.generate.exampleTitle(example),
      assets: this.context.exampleAssets,
    }

    this.emit('example', { example, layout })

    return this.renderer.generate(context, layout)
  }

  protected createMenu(): Context['menu'] {
    if (this.context.menu.length === 0) {
      this.context.menu = this.generate.menu(this.context.menu, this.context.pages)
    }

    return this.context.menu
  }

  protected clearMenu(): void {
    this.context.menu = []
  }
}
