import type { PositiveInteger, ReaderInterface, TokenReturn } from './index'

export interface LexerInterface {
  /**
   * Get the next token /next k-th token.
   * This is used to look ahead the tokens without consuming/removing them from the input stream.
   * Calling the peek() method more than once will return the same token.
   * @param {PositiveInteger} k
   * @returns {Token | undefined} next token or undefined if there are no more tokens.
   */
  peek<T extends PositiveInteger = 1>(k?: T): TokenReturn<T>

  /**
   * Get the next token /next k-th token, and remove it from the token stream.
   * This means, calling the consume() method multiple times will return a new token at each invocation.
   * @param {PositiveInteger} k
   * @returns {Token | undefined} next token or undefined if there are no more tokens.
   */
  consume<T extends PositiveInteger = 1>(k?: T): TokenReturn<T>

  /**
   * Get the debug information about the current state of the lexer.
   * @returns {object} debug information
   */
  debug(): ReturnType<ReaderInterface['debug']>
}
