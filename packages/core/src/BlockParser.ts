import { Block as CommentBlock, parse as parseComments } from 'comment-parser'

import { BlockParseError, TagTransformerError } from './errors'
import tagTransformers from './tag-transformers'
import {
  Block, BlockParserInterface, TagTransformer, TagTransformFunction,
} from './types'

export interface BlockParserEvent {}
export interface BlockParsedEvent extends BlockParserEvent { block: Block }
export interface BlockParserEventMap {
  'block-parsed': BlockParsedEvent
}

export class BlockParser implements BlockParserInterface {

  protected tagTransformers: {[key: string]: TagTransformFunction} = {}

  protected listeners: Record<keyof BlockParserEventMap, ((event: BlockParserEventMap[keyof BlockParserEventMap]) => void)[]> = {
    'block-parsed': [],
  }

  constructor() {
    tagTransformers.forEach(tag => this.registerTagTransformer(tag))
  }

  public registerTagTransformer({ name, transform: parse }: TagTransformer): BlockParser {
    this.tagTransformers[name] = parse

    return this
  }

  public on<K extends keyof BlockParserEventMap>(type: K, listener: (event: BlockParserEventMap[K]) => void): BlockParser {
    this.listeners[type].push(listener)

    return this
  }

  public off<K extends keyof BlockParserEventMap>(type: K, listener: (event: BlockParserEventMap[K]) => void): BlockParser {
    this.listeners[type] = this.listeners[type].filter(l => l !== listener)

    return this
  }

  protected emit<K extends keyof BlockParserEventMap>(type: K, event: BlockParserEventMap[K]): void {
    if (!this.listeners[type]) {
      return
    }

    this.listeners[type].forEach(listener => listener(event))
  }

  public parse(content: string): Block[] {
    return parseComments(content, { spacing: 'preserve' })
      .map((comment: CommentBlock) => this.toBlock(comment))
      .filter((entry): entry is Block => !!entry)
  }

  protected toBlock(comment: CommentBlock): Block | undefined {
    let block: Partial<Block> = {
      key: '',
      order: 0,
    }

    if (comment.tags.length <= 0) {
      throw this.createError('Empty block.', comment)
    }

    comment.tags.forEach(tag => {
      if (!this.tagTransformers[tag.tag]) {
        throw this.createError(`Undefined tag type '${tag.tag}'.`, comment)
      }

      tag.description = tag.description.trim()
      tag.name = tag.name.trim()
      tag.type = tag.type.trim()
      try {
        block = this.tagTransformers[tag.tag](block, tag)
      } catch (e) {
        if (e instanceof TagTransformerError) {
          // TODO improve this, add source location
          console.error(e.message)
        } else {
          throw e
        }
      }

    })

    this.validateBlock(block, comment)

    block.key = this.blockKey(block as Block)
    if (!block.key) {
      return undefined
    }

    this.emit('block-parsed', { block: block as Block })

    return block as Block
  }

  protected validateBlock(block: Partial<Block>, comment: CommentBlock) {
    if (!(!!block.page || (!!block.page && !!block.section) || !!block.location)) {
      throw this.createError('Missing block location. Don\'t know where to place this block, please use @location, @page or @section + @page.', comment)
    }
  }

  protected blockKey(block: Block): string {
    if (block.location) {
      return block.location
    }

    return (block.page || '') + (block.section ? `.${block.section}` : '')
  }

  protected createError(reason: string, comment: CommentBlock): BlockParseError {
    const code = comment.source.map(line => line.source).join('\n')

    return new BlockParseError(reason, code, comment.source[0].number)
  }
}
