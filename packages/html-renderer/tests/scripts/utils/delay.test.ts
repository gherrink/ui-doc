// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { throttle } from '../../../scripts/utils/delay'

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call the callback immediately on the first invocation', () => {
    const callback = vi.fn<(value: string) => void>()

    throttle(callback, 100)('first')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should forward all arguments to the callback', () => {
    const callback = vi.fn<(a: string, b: number) => void>()

    throttle(callback, 100)('a', 1)

    expect(callback).toHaveBeenCalledWith('a', 1)
  })

  it('should drop calls made inside the delay window', () => {
    const callback = vi.fn<(value: string) => void>()
    const throttled = throttle(callback, 100)

    throttled('first')
    throttled('second')
    throttled('third')

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('first')
  })

  it('should keep dropping calls one tick before the window closes', () => {
    const callback = vi.fn<(value: string) => void>()
    const throttled = throttle(callback, 100)

    throttled('first')
    vi.advanceTimersByTime(99)
    throttled('second')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should allow the next call once the window has elapsed', () => {
    const callback = vi.fn<(value: string) => void>()
    const throttled = throttle(callback, 100)

    throttled('first')
    vi.advanceTimersByTime(100)
    throttled('second')

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith('second')
  })

  it('should drop the trailing call rather than deferring it', () => {
    // This is a leading-edge throttle with no trailing invocation: the value
    // seen during the window is discarded, not replayed when the window closes.
    const callback = vi.fn<(value: string) => void>()
    const throttled = throttle(callback, 100)

    throttled('first')
    throttled('dropped')
    vi.advanceTimersByTime(1000)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('first')
  })

  it('should throttle each returned function independently', () => {
    const first = vi.fn<() => void>()
    const second = vi.fn<() => void>()
    const throttledFirst = throttle(first, 100)
    const throttledSecond = throttle(second, 100)

    throttledFirst()
    throttledFirst()
    throttledSecond()

    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('should schedule its window through window.setTimeout', () => {
    // Documented constraint: throttle() reaches for `window`, so it only works
    // in a browser context, unlike the rest of utils/.
    const spy = vi.spyOn(window, 'setTimeout')

    throttle(vi.fn<() => void>(), 250)()

    expect(spy).toHaveBeenCalledWith(expect.any(Function), 250)
  })
})
