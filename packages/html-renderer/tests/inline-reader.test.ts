import { describe, expect, it } from 'vitest'

import { InlineReader } from '../src/InlineReader'

describe('reader', () => {
  it('peek', () => {
    const reader = new InlineReader('Hello World')

    expect(reader.peek()).toBe('H')
    expect(reader.peek(2)).toBe('He')
    expect(reader.peek(3)).toBe('Hel')
    expect(reader.peek(4)).toBe('Hell')
    expect(reader.peek(5)).toBe('Hello')
    expect(reader.peek(6)).toBe('Hello ')
    expect(reader.peek(7)).toBe('Hello W')
    expect(reader.peek(8)).toBe('Hello Wo')
    expect(reader.peek(9)).toBe('Hello Wor')
    expect(reader.peek(10)).toBe('Hello Worl')
    expect(reader.peek(11)).toBe('Hello World')
  })

  it('peek over input length', () => {
    const reader = new InlineReader('Hello')

    expect(reader.peek()).toBe('H')
    expect(reader.peek(2)).toBe('He')
    expect(reader.peek(3)).toBe('Hel')
    expect(reader.peek(4)).toBe('Hell')
    expect(reader.peek(5)).toBe('Hello')
    expect(reader.peek(6)).toBe('Hello')
    expect(reader.peek(7)).toBe('Hello')
  })

  it('peek with eof reached', () => {
    const reader = new InlineReader('')

    expect(reader.peek()).toBe('')
    expect(reader.peek(2)).toBe('')
    expect(reader.peek(3)).toBe('')
  })

  it('consume', () => {
    const reader = new InlineReader('Hello World')

    expect(reader.consume()).toBe('H')
    expect(reader.consume()).toBe('e')
    expect(reader.consume()).toBe('l')
    expect(reader.consume()).toBe('l')
    expect(reader.consume()).toBe('o')
    expect(reader.consume()).toBe(' ')
    expect(reader.consume()).toBe('W')
    expect(reader.consume()).toBe('o')
    expect(reader.consume()).toBe('r')
    expect(reader.consume()).toBe('l')
    expect(reader.consume()).toBe('d')
  })

  it('consume with given k', () => {
    const reader = new InlineReader('Hello World!')

    expect(reader.consume(5)).toBe('Hello')
    expect(reader.consume()).toBe(' ')
    expect(reader.consume(6)).toBe('World!')
    expect(reader.consume()).toBe('')
  })

  it('consume with eof reached', () => {
    const reader = new InlineReader('Hello')

    expect(reader.consume()).toBe('H')
    expect(reader.consume()).toBe('e')
    expect(reader.consume()).toBe('l')
    expect(reader.consume()).toBe('l')
    expect(reader.consume()).toBe('o')
    expect(reader.consume()).toBe('')
    expect(reader.consume()).toBe('')
    expect(reader.consume()).toBe('')
  })

  it('isEof', () => {
    const reader = new InlineReader('Hello World')

    expect(reader.isEof()).toBe(false)

    reader.consume(11)

    expect(reader.isEof()).toBe(true)
  })
})
