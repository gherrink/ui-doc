import type { Node, TagNode } from './nodes'
import type { Reader } from './Reader.types'
import type { Token } from './Token.types'

export interface TagNodeParse {
  identifier: string
  example: string
  hasContent: boolean
  parse(): {
    addToken(token: Token): void
    create(): TagNode
  }
}

export interface Parser {
  /**
   * Parse the input stream and return the AST.
   * @param {Reader} reader
   * @returns {Node} AST
   */
  parse(reader: Reader): Node

  /**
   * Register a tag parser.
   * @param {TagNodeParse} tag
   */
  registerTagParser(tag: TagNodeParse): this
}
