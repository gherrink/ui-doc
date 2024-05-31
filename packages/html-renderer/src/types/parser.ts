import type { NodeInterface, TagNodeInterface } from './node'
import type { ReaderInterface } from './reader'
import type { Token } from './token'

export interface TagNodeParse {
  identifier: string
  example: string
  hasContent: boolean
  parse(): {
    addToken(token: Token): void
    create(): TagNodeInterface
  }
}

export interface ParserInterface {
  /**
   * Parse the input stream and return the AST.
   * @param {ReaderInterface} reader
   * @returns {NodeInterface} AST
   */
  parse(reader: ReaderInterface): NodeInterface

  /**
   * Register a tag parser.
   * @param {TagNodeParse} tag
   */
  registerTagParser(tag: TagNodeParse): ParserInterface
}
