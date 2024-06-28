import type { PositiveInteger } from './base'

export interface Reader {
  /**
   * Get the next character / next k-th character from the input.
   * This is used to look ahead the characters without consuming/removing them from the input stream.
   * Calling the peek() method more than once will return the same character.
   *
   * @param {PositiveInteger} k number
   * @returns {string} next character
   */
  peak(k?: PositiveInteger): string

  /**
   * Get the next character /next k-th token from the input, and remove it from the input.
   * This means, calling the consume() method multiple times will return a new character at each invocation.
   *
   * @param {PositiveInteger} k
   * @returns {string} next character
   */
  consume(k?: PositiveInteger): string

  /**
   * Check if the input stream is empty.
   * @returns {boolean} true if the input stream is empty, false otherwise.
   */
  isEof(): boolean

  /**
   * Get the debug information about the current state of the reader.
   * @returns {object} debug information
   */
  debug(): {
    source: string
    line: PositiveInteger
    pos: PositiveInteger
    content: string
  }
}
