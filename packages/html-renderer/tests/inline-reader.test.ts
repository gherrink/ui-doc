import { describe, expect, it } from 'vitest'

import { InlineReader } from '../src/InlineReader'

describe('reader', () => {
  it('peek', () => {
    const reader = new InlineReader('Hello World')

    expect(reader.peak()).toBe('H')
    expect(reader.peak(2)).toBe('He')
    expect(reader.peak(3)).toBe('Hel')
    expect(reader.peak(4)).toBe('Hell')
    expect(reader.peak(5)).toBe('Hello')
    expect(reader.peak(6)).toBe('Hello ')
    expect(reader.peak(7)).toBe('Hello W')
    expect(reader.peak(8)).toBe('Hello Wo')
    expect(reader.peak(9)).toBe('Hello Wor')
    expect(reader.peak(10)).toBe('Hello Worl')
    expect(reader.peak(11)).toBe('Hello World')
  })

  it('peek over input length', () => {
    const reader = new InlineReader('Hello')

    expect(reader.peak()).toBe('H')
    expect(reader.peak(2)).toBe('He')
    expect(reader.peak(3)).toBe('Hel')
    expect(reader.peak(4)).toBe('Hell')
    expect(reader.peak(5)).toBe('Hello')
    expect(reader.peak(6)).toBe('Hello')
    expect(reader.peak(7)).toBe('Hello')
  })

  it('peek with eof reached', () => {
    const reader = new InlineReader('')

    expect(reader.peak()).toBe('')
    expect(reader.peak(2)).toBe('')
    expect(reader.peak(3)).toBe('')
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
