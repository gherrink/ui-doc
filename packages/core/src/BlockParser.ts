import { Block as CommentBlock, parse as parseComments } from 'comment-parser'

import { TagTransformerError } from './errors'
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

    comment.tags.forEach(tag => {
      if (!this.tagTransformers[tag.tag]) {
        // TODO somehow improve error handling
        console.error(`Undefined tag type '${tag.tag}'.`)
        return
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

    if (!this.isValidBlock(block)) {
      return undefined
    }

    block.key = this.blockKey(block as Block)
    if (!block.key) {
      return undefined
    }

    return block as Block
  }

  protected isValidBlock(block: Partial<Block>): boolean {
    return (!!block.page && !!block.section) || !!block.location
  }

  protected blockKey(block: Block): string {
    if (block.location) {
      return block.location
    }

    return (block.page?.key || '') + (block.section?.key ? `.${block.section.key}` : '')
  }
}
