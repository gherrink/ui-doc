import type { Block, BlockExample } from './Block.types'
import type { BlockParser } from './BlockParser.types'
import type { Asset, Context, ContextEntry, ContextExample, ContextShowcase, ContextShowcaseExample, ContextShowcaseItem, ContextVariation, ContextVariationdemo, ContextVariationdemoItem, GenerateExampleContext } from './Context.types'
import type { FilePath } from './FileSystem.types'
import type { Logger } from './Logger.types'
import type { Renderer } from './Renderer.types'
import type { GenerateFunctions, Options, OutputCallback, Source } from './UIDoc.types'
import type { ContextEntryEvent, UIDocEventMap as EventMap } from './UIDocEvent.types'
import { createCommentBlockParser } from './CommentBlockParser'
import { EventEmitterBase } from './EventEmitterBase'
import { noopLogger } from './Logger'
import { createMarkdownDescriptionParser } from './MarkdownDescriptionParser'
import { matchesVariationPattern } from './tag-transformers/variations'

export class UIDoc extends EventEmitterBase<EventMap> {
  protected sources: Record<FilePath, Source>

  protected context: Context

  protected showcasesNeedResolution = true

  public blockParser: BlockParser

  public renderer: Renderer

  public logger: Logger

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
    this.logger = options.logger ?? noopLogger
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
      showcases: {},
      variations: {},
    }

    this.registerExampleListeners()
    this.registerVariationListeners()
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

  protected registerVariationListeners(): void {
    const variationKeyToId = (key: string): string => `variation-${key.replaceAll('.', '-')}`

    // Register variations when blocks with @variation are processed
    this.on('source', ({ source, type }) => {
      if (type === 'delete') {
        // Remove variations defined in this source
        source.blocks.forEach(block => {
          if (block.variation) {
            delete this.context.variations[block.variation.key]
          }
        })

        return
      }

      // Register variations from blocks
      source.blocks.forEach(block => {
        if (block.variation) {
          const variation = block.variation
          const contextVariation: ContextVariation = {
            ...variation,
            id: variationKeyToId(variation.key),
          }
          this.context.variations[variation.key] = contextVariation
        }
      })
    })

    // Handle showcase resolution - runs after all sources are processed
    this.on('context-entry', ({ entry, key, type }) => {
      if (type === 'delete') {
        if (entry.showcase) {
          // Clean up showcase examples
          entry.showcase.items.forEach(item => {
            const showcaseId = this.showcaseExampleId(key, item.variation.key)
            delete this.context.showcases[showcaseId]
          })
          delete entry.showcase
        }
      }
    })

    // Output showcase files to showcases/ folder
    this.on('output', ({ promises, write }) => {
      promises.push(
        ...Object.values(this.context.showcases).map(async showcase =>
          write(showcase.file, this.exampleContent(showcase)),
        ),
      )
    })
  }

  protected resolveAllShowcases(): void {
    // Clear all existing showcases - we'll rebuild from scratch
    this.context.showcases = {}

    Object.entries(this.context.entries).forEach(([key, entry]) => {
      const block = this.findBlockByKey(key)

      // Clear showcase from entry if block no longer has @showcase
      if (block === undefined || block.showcase === undefined || block.showcase === '') {
        if (entry.showcase) {
          delete entry.showcase
        }

        return
      }

      const showcase = this.resolveShowcase(key, block)

      if (showcase) {
        entry.showcase = showcase

        // Register showcase examples so they're available in dev mode
        showcase.items.forEach(item => {
          const showcaseId = this.showcaseExampleId(key, item.variation.key)
          const wrappedContent = item.variation.wrapper.replace(
            '{{content}}',
            showcase.sourceExample.content,
          )

          const showcaseExample: ContextShowcaseExample = {
            id: showcaseId,
            type: 'html',
            content: wrappedContent,
            title: `${showcase.sourceExample.title || ''} - ${item.variation.name}`,
            src: item.src,
            file: item.file,
            variationKey: item.variation.key,
            variationName: item.variation.name,
          }

          this.context.showcases[showcaseId] = showcaseExample
        })
      } else if (entry.showcase) {
        // Showcase resolution failed, clean up
        delete entry.showcase
      }
    })
  }

  protected showcaseExampleId(blockKey: string, variationKey: string): string {
    return `${blockKey.replaceAll('.', '-')}-${variationKey.replaceAll('.', '-')}`
  }

  protected findBlockByKey(key: string): Block | undefined {
    for (const source of Object.values(this.sources)) {
      const block = source.blocks.find(b => b.key === key)

      if (block) {
        return block
      }
    }

    return undefined
  }

  protected resolveShowcase(blockKey: string, block: Block): ContextShowcase | null {
    if (block.showcase === undefined || block.showcase === '') {
      return null
    }

    const sourceBlock = this.findBlockByKey(block.showcase)

    if (!sourceBlock || !sourceBlock.example) {
      this.logger.debug(`Showcase target "${block.showcase}" not found or has no example`, { phase: 'transform' })

      return null
    }

    // Determine which variations to use
    // If the showcase block has its own @variations, use those; otherwise inherit from source
    const variationsInclude = block.variations ?? sourceBlock.variations ?? ['*']
    const variationsExclude = block.variationsExclude ?? sourceBlock.variationsExclude ?? []

    const matchingVariations = this.resolveVariations(variationsInclude, variationsExclude)

    if (matchingVariations.length === 0) {
      this.logger.debug(`No matching variations for showcase "${blockKey}"`, { phase: 'transform' })

      return null
    }

    const items: ContextShowcaseItem[] = matchingVariations.map(variation => {
      const showcaseId = this.showcaseExampleId(blockKey, variation.key)
      const file = `showcases/${showcaseId}.html`

      return {
        variation,
        file,
        src: this.generate.resolve(file, 'showcase'),
      }
    })

    return {
      sourceKey: block.showcase,
      sourceExample: sourceBlock.example,
      items,
    }
  }

  protected resolveVariations(include: string[], exclude: string[]): ContextVariation[] {
    const allVariations = Object.values(this.context.variations)

    return allVariations.filter(variation => {
      // Check if excluded
      for (const pattern of exclude) {
        if (matchesVariationPattern(pattern, variation.key)) {
          return false
        }
      }

      // Check if included
      for (const pattern of include) {
        if (matchesVariationPattern(pattern, variation.key)) {
          return true
        }
      }

      return false
    })
  }

  public variations(): Context['variations'] {
    return this.context.variations
  }

  public sourceExists(file: string): boolean {
    return this.sources[file] !== undefined
  }

  public sourceCreate(file: string, content: string): void {
    this.logger.debug(`Creating source ${file}`, { source: file, phase: 'parse' })
    const source: Source = {
      blocks: this.blockParser.parse({ content, identifier: file }),
    }
    this.logger.debug(`Parsed ${source.blocks.length} blocks`, { source: file, phase: 'parse' })

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

    this.logger.debug(`Updating source ${file}`, { source: file, phase: 'parse' })
    const blocksNew = this.blockParser.parse({ content, identifier: file })
    const sourceBlockKeysOld = this.sources[file].blocks.map(block => block.key)
    const sourceBlockKeysNew = blocksNew.map(block => block.key)
    this.logger.debug(`Parsed ${blocksNew.length} blocks`, { source: file, phase: 'parse' })

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

    this.logger.debug(`Deleting source ${file}`, { source: file, phase: 'parse' })
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
    this.logger.debug(`Transforming block "${block.key}"`, { phase: 'transform' })
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
      delete entry.showcase

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
    this.logger.info(`Generating ${pages.length} pages`, { phase: 'output' })
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
    this.ensureShowcasesResolved()
    this.logger.debug(`Rendering page "${page.id}" with layout "${layout ?? 'default'}"`, { phase: 'render' })
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
    this.ensureShowcasesResolved()
    const example = this.context.examples[exampleId]

    return example !== undefined ? this.exampleContent(example) : null
  }

  public showcase(showcaseId: string): string | null {
    this.ensureShowcasesResolved()
    const showcase = this.context.showcases[showcaseId]

    return showcase !== undefined ? this.exampleContent(showcase) : null
  }

  public showcases(): Context['showcases'] {
    return this.context.showcases
  }

  public exampleContent(example: ContextExample, layout = 'example'): string {
    this.logger.debug(`Rendering example "${example.id}" with layout "${layout}"`, { phase: 'render' })
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
    this.showcasesNeedResolution = true
  }

  protected ensureShowcasesResolved(): void {
    if (this.showcasesNeedResolution) {
      this.resolveAllShowcases()
      this.resolveAllVariationdemos()
      this.showcasesNeedResolution = false
    }
  }

  protected resolveAllVariationdemos(): void {
    Object.entries(this.context.entries).forEach(([key, entry]) => {
      const block = this.findBlockByKey(key)

      if (block === undefined || block.variationdemo === undefined || block.variationdemo === '') {
        if (entry.variationdemo) {
          delete entry.variationdemo
        }

        return
      }

      const demo = this.resolveVariationdemo(key, block)

      if (demo) {
        entry.variationdemo = demo

        // Register demo examples in context.showcases
        demo.items.forEach(item => {
          const showcaseId = this.variationdemoId(key, item.componentKey)
          const componentBlock = this.findBlockByKey(item.componentKey)

          if (!componentBlock || !componentBlock.example) {
            return
          }

          const wrappedContent = demo.variation.wrapper.replace(
            '{{content}}',
            componentBlock.example.content,
          )

          const showcaseExample: ContextShowcaseExample = {
            id: showcaseId,
            type: 'html',
            content: wrappedContent,
            title: `${componentBlock.example.title || ''} - ${demo.variation.name}`,
            src: item.src,
            file: item.file,
            variationKey: demo.variationKey,
            variationName: demo.variation.name,
          }

          this.context.showcases[showcaseId] = showcaseExample
        })
      } else if (entry.variationdemo) {
        delete entry.variationdemo
      }
    })
  }

  protected variationdemoId(blockKey: string, componentKey: string): string {
    return `${blockKey.replaceAll('.', '-')}-${componentKey.replaceAll('.', '-')}`
  }

  protected resolveVariationdemo(blockKey: string, block: Block): ContextVariationdemo | null {
    if (block.variationdemo === undefined || block.variationdemo === '') {
      return null
    }

    const variation = this.context.variations[block.variationdemo]

    if (variation === undefined) {
      this.logger.debug(`Variationdemo target variation "${block.variationdemo}" not found`, { phase: 'transform' })

      return null
    }

    // Find all components that have @variations matching this variation
    const matchingComponents = this.findComponentsForVariation(block.variationdemo)

    // Apply component include/exclude filters
    const filtered = this.filterComponents(
      matchingComponents,
      block.variationdemoInclude ?? ['*'],
      block.variationdemoExclude ?? [],
    )

    if (filtered.length === 0) {
      this.logger.debug(`No matching components for variationdemo "${blockKey}"`, { phase: 'transform' })

      return null
    }

    // Create items for each component
    const items: ContextVariationdemoItem[] = filtered.map(([compKey, compBlock]) => {
      const demoId = this.variationdemoId(blockKey, compKey)
      const file = `showcases/${demoId}.html`

      return {
        componentKey: compKey,
        componentTitle: compBlock.title !== undefined && compBlock.title !== '' ? compBlock.title : compKey,
        file,
        src: this.generate.resolve(file, 'showcase'),
      }
    })

    return { variationKey: block.variationdemo, variation, items }
  }

  protected findComponentsForVariation(variationKey: string): Array<[string, Block]> {
    const results: Array<[string, Block]> = []

    for (const source of Object.values(this.sources)) {
      for (const block of source.blocks) {
        if (!block.variations || !block.example) {
          continue
        }

        // Check if any of block's variation patterns match our target
        const matches = block.variations.some(pattern =>
          matchesVariationPattern(pattern, variationKey),
        )
        const excluded = block.variationsExclude?.some(pattern =>
          matchesVariationPattern(pattern, variationKey),
        )

        if (matches && !excluded) {
          results.push([block.key, block])
        }
      }
    }

    return results
  }

  protected filterComponents(
    components: Array<[string, Block]>,
    include: string[],
    exclude: string[],
  ): Array<[string, Block]> {
    return components.filter(([key]) => {
      // Exclude first
      for (const pattern of exclude) {
        if (this.matchesComponentPattern(pattern, key)) {
          return false
        }
      }

      // Include
      for (const pattern of include) {
        if (this.matchesComponentPattern(pattern, key)) {
          return true
        }
      }

      return false
    })
  }

  protected matchesComponentPattern(pattern: string, componentKey: string): boolean {
    if (pattern === '*') {
      return true
    }

    if (pattern === componentKey) {
      return true
    }

    if (componentKey.startsWith(`${pattern}.`)) {
      return true
    }

    return false
  }
}
