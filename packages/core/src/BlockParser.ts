import { Block as CommentBlock, parse as parseComments } from 'comment-parser'

import { BlockParseError, TagTransformerError } from './errors'
import tagTransformers from './tag-transformers'
import type {
  Block,
  BlockParserContext,
  BlockParserEventMap,
  BlockParserInterface,
  DescriptionParserInterface,
  TagTransformerInterface,
  TagTransformFunction,
} from './types'

type BlockParserErrorCreate = (reason: string, comment: CommentBlock) => BlockParseError

export class BlockParser implements BlockParserInterface {
  protected tagTransformers: Record<string, TagTransformFunction> = {}

  protected listeners: Record<
    keyof BlockParserEventMap,
    ((event: BlockParserEventMap[keyof BlockParserEventMap]) => void)[]
  > = {
    'block-parsed': [],
  }

  protected descriptionParser: DescriptionParserInterface

  constructor(descriptionParser: DescriptionParserInterface) {
    tagTransformers.forEach(tag => this.registerTagTransformer(tag))
    this.descriptionParser = descriptionParser
  }

  public registerTagTransformer({ name, transform: parse }: TagTransformerInterface): BlockParser {
    this.tagTransformers[name] = parse

    return this
  }

  public on<K extends keyof BlockParserEventMap>(
    type: K,
    listener: (event: BlockParserEventMap[K]) => void,
  ): BlockParser {
    this.listeners[type].push(listener)

    return this
  }

  public off<K extends keyof BlockParserEventMap>(
    type: K,
    listener: (event: BlockParserEventMap[K]) => void,
  ): BlockParser {
    this.listeners[type] = this.listeners[type].filter(l => l !== listener)

    return this
  }

  protected emit<K extends keyof BlockParserEventMap>(
    type: K,
    event: BlockParserEventMap[K],
  ): void {
    if (!this.listeners[type]) {
      return
    }

    this.listeners[type].forEach(listener => listener(event))
  }

  public parse(context: BlockParserContext): Block[] {
    const createError: BlockParserErrorCreate = (reason, comment) => {
      const code = comment.source.map(line => line.source).join('\n')

      return new BlockParseError({
        code,
        line: comment.source[0].number,
        reason,
        source: context.identifier,
      })
    }

    return parseComments(context.content, { spacing: 'preserve' })
      .map((comment: CommentBlock) => this.toBlock(comment, createError))
      .filter((entry): entry is Block => !!entry)
  }

  protected toBlock(comment: CommentBlock, createError: BlockParserErrorCreate): Block | undefined {
    let block: Partial<Block> = {
      key: '',
      order: 0,
    }

    if (comment.tags.length <= 0) {
      throw createError('Empty block.', comment)
    }

    comment.tags.forEach(tag => {
      if (!this.tagTransformers[tag.tag]) {
        throw createError(`Undefined tag type '${tag.tag}'.`, comment)
      }

      tag.description = tag.description.trim()
      tag.name = tag.name.trim()
      tag.type = tag.type.trim()
      try {
        block = this.tagTransformers[tag.tag](block, tag)
      } catch (e) {
        if (e instanceof TagTransformerError) {
          throw createError(e.message, comment)
        } else {
          throw e
        }
      }
    })

    if (comment.description) {
      block.description = this.descriptionParser.parse(comment.description.trim())
    }

    const validationError = this.validateBlock(block)

    if (validationError) {
      throw createError(validationError, comment)
    }

    block.key = this.blockKey(block as Block)
    if (!block.key) {
      return undefined
    }

    this.emit('block-parsed', { block: block as Block })

    return block as Block
  }

  protected validateBlock(block: Partial<Block>): string | undefined {
    if (!(!!block.page || (!!block.page && !!block.section) || !!block.location)) {
      return "Missing block location. Don't know where to place this block, please use @location, @page or @section + @page."
    }

    return undefined
  }

  protected blockKey(block: Block): string {
    if (block.location) {
      return block.location
    }

    return (block.page ?? '') + (block.section ? `.${block.section}` : '')
  }
}
