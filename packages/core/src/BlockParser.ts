import { Block as CommentBlock, parse as parseComments } from 'comment-parser'

import { BlockParseError, TagTransformerError } from './errors'
import tagTransformers from './tag-transformers'
import { Block, TagTransformer, TagTransformFunction } from './types'

export class BlockParser {

  protected tagTransformers: {[key: string]: TagTransformFunction} = {}

  constructor() {
    tagTransformers.forEach(tag => this.registerTagTransformer(tag))
  }

  public registerTagTransformer({ name, transform: parse }: TagTransformer): BlockParser {
    this.tagTransformers[name] = parse

    return this
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

    return (block.page?.key || '') + (block.section?.key ? `.${block.section.key}` : '')
  }

  protected createError(reason: string, comment: CommentBlock): BlockParseError {
    const code = comment.source.map(line => line.source).join('\n')

    return new BlockParseError(reason, code, comment.source[0].number)
  }
}
