import type { Block as CommentBlock, Spec as CommentSpec } from 'comment-parser'
import { parse as parseComments } from 'comment-parser'

import type { Block } from './Block.types'
import type { BlockParser, BlockParserContext } from './BlockParser.types'
import type { BlockParserEventMap as EventMap } from './BlockParserEvent.types'
import type { DescriptionParser } from './DescriptionParser.types'
import { BlockParseError, TagTransformerError } from './errors'
import { EventEmitterBase } from './EventEmitterBase'
import { noopLogger } from './Logger'
import type { Logger } from './Logger.types'
import tagTransformers from './tag-transformers'
import type { TagTransformer, TagTransformFunction } from './tag-transformers/tag-transformer.types'

type BlockParserErrorCreate = (
  reason: string,
  comment: CommentBlock,
  info?: { tag?: CommentSpec },
) => BlockParseError

export class CommentBlockParser extends EventEmitterBase<EventMap> implements BlockParser {
  protected tagTransformers: Record<string, TagTransformFunction> = {}

  protected descriptionParser: DescriptionParser

  protected logger: Logger

  constructor(descriptionParser: DescriptionParser, logger?: Logger) {
    super()
    tagTransformers.forEach(tag => this.registerTagTransformer(tag))
    this.descriptionParser = descriptionParser
    this.logger = logger ?? noopLogger
  }

  public registerTagTransformer({ name, transform: parse }: TagTransformer): this {
    this.tagTransformers[name] = parse

    return this
  }

  public parse(context: BlockParserContext): Block[] {
    this.logger.debug(`Parsing ${context.identifier}`, {
      source: context.identifier,
      phase: 'parse',
    })
    const createError: BlockParserErrorCreate = (reason, comment, { tag } = {}) => {
      const code = comment.source.map(line => line.source).join('\n')

      return new BlockParseError({
        code,
        column: 0,
        line: (tag ? tag.source[0].number : comment.source[0].number) + 1,
        message: reason,
        source: context.identifier,
      })
    }

    const blocks = parseComments(context.content, { spacing: 'preserve' })
      .map((comment: CommentBlock) => this.toBlock(comment, createError))
      .filter((entry): entry is Block => !!entry)

    this.logger.debug(`Found ${blocks.length} valid blocks`, {
      source: context.identifier,
      phase: 'parse',
    })

    return blocks
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
      if (this.tagTransformers[tag.tag] === undefined) {
        throw createError(`Undefined tag type '${tag.tag}'.`, comment, { tag })
      }

      tag.description = tag.description.trim()
      tag.name = tag.name.trim()
      tag.type = tag.type.trim()
      try {
        block = this.tagTransformers[tag.tag](block, tag)
      } catch (e) {
        if (e instanceof TagTransformerError) {
          throw createError(e.message, comment, { tag })
        } else {
          throw e
        }
      }
    })

    if (comment.description) {
      block.description = this.descriptionParser.parse(comment.description.trim())
    }

    const validationError = this.validateBlock(block)

    if (validationError !== undefined) {
      throw createError(validationError, comment)
    }

    block.key = this.blockKey(block as Block)
    if (block.key === '') {
      return undefined
    }

    this.emit('parsed', block as Block)

    return block as Block
  }

  protected validateBlock(block: Partial<Block>): string | undefined {
    if (
      (block.page === undefined || block.page === '') &&
      (block.location === undefined || block.location === '')
    ) {
      return "Missing block location. Don't know where to place this block, please use @location, @page or @section + @page."
    }

    return undefined
  }

  protected blockKey(block: Block): string {
    if (block.location !== undefined && block.location !== '') {
      return block.location
    }

    return (
      (block.page ?? '') +
      (block.section !== undefined && block.section !== '' ? `.${block.section}` : '')
    )
  }
}

export function createCommentBlockParser(
  descriptionParser: DescriptionParser,
  logger?: Logger,
): CommentBlockParser {
  return new CommentBlockParser(descriptionParser, logger)
}
