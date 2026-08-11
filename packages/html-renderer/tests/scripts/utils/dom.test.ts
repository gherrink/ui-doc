// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { animate, ready } from '../../../scripts/utils/dom'
import type { FrameQueue } from '../support/frames'
import { stubAnimationFrames } from '../support/frames'

/**
 * Override document.readyState, which is a prototype getter in jsdom and so
 * cannot be assigned directly.
 * @param state the value document.readyState should report
 */
function setReadyState(state: DocumentReadyState): void {
  Object.defineProperty(document, 'readyState', {
    configurable: true,
    get: () => state,
  })
}

/**
 * Replace window.getComputedStyle so animate() sees the transition-duration and
 * animation-name it would see in a browser.
 * @param transitionDuration value for `transition-duration`, a comma separated
 *   list when several properties transition
 * @param animationName value for `animation-name`
 */
function stubComputedStyle(transitionDuration: string, animationName: string): void {
  vi.stubGlobal('getComputedStyle', () => ({ animationName, transitionDuration }))
}

describe('ready', () => {
  afterEach(() => {
    setReadyState('complete')
  })

  it('should call the callback immediately when the document is interactive', () => {
    setReadyState('interactive')
    const callback = vi.fn<() => void>()

    ready(callback)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should call the callback immediately when the document is complete', () => {
    setReadyState('complete')
    const callback = vi.fn<() => void>()

    ready(callback)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should call the callback with document as `this`', () => {
    setReadyState('complete')
    const seen: Document[] = []

    ready(function (this: Document) {
      seen.push(this)
    })

    expect(seen).toEqual([document])
  })

  it('should defer to DOMContentLoaded while the document is loading', () => {
    setReadyState('loading')
    const callback = vi.fn<() => void>()

    ready(callback)

    expect(callback).not.toHaveBeenCalled()

    document.dispatchEvent(new Event('DOMContentLoaded'))

    expect(callback).toHaveBeenCalledTimes(1)
  })
})

describe('animate', () => {
  let target: HTMLElement
  let frames: FrameQueue

  beforeEach(() => {
    document.body.innerHTML = '<div id="target"></div>'
    target = document.getElementById('target') as HTMLElement
    frames = stubAnimationFrames()
    // Browser value for an element with no transition and no animation.
    stubComputedStyle('0s', 'none')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('class sequence', () => {
    it('should add the active and from classes synchronously when entering', () => {
      animate(target, 'fade', true)

      expect(target.className.split(' ').sort()).toEqual(['fade-enter-active', 'fade-enter-from'])
    })

    it('should swap the from class for the to class on the first frame', () => {
      animate(target, 'fade', true)

      frames.flush()

      expect(target.classList.contains('fade-enter-from')).toBe(false)
      expect(target.classList.contains('fade-enter-to')).toBe(true)
      expect(target.classList.contains('fade-enter-active')).toBe(true)
    })

    it('should use leave classes when not entering', () => {
      animate(target, 'fade', false)
      frames.flush()

      expect(target.classList.contains('fade-leave-active')).toBe(true)
      expect(target.classList.contains('fade-leave-to')).toBe(true)
    })

    it('should remove the to and active classes when the transition ends', () => {
      animate(target, 'fade', true)
      frames.flush()

      target.dispatchEvent(new Event('transitionend'))

      expect(target.className).toBe('')
    })

    it('should keep other classes on the element untouched', () => {
      target.classList.add('keep-me')

      animate(target, 'fade', true)
      frames.flush()
      target.dispatchEvent(new Event('transitionend'))

      expect(target.className).toBe('keep-me')
    })
  })

  describe('completion', () => {
    it('should invoke the callback when the transition ends', () => {
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()

      expect(callback).not.toHaveBeenCalled()

      target.dispatchEvent(new Event('transitionend'))

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should invoke the callback when the animation ends', () => {
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      target.dispatchEvent(new Event('animationend'))

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should invoke the callback when the transition is cancelled', () => {
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      target.dispatchEvent(new Event('transitioncancel'))

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should invoke the callback when the animation is cancelled', () => {
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      target.dispatchEvent(new Event('animationcancel'))

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should not throw when no callback is given', () => {
      animate(target, 'fade', true)
      frames.flush()

      expect(() => target.dispatchEvent(new Event('transitionend'))).not.toThrow()
    })

    it('should not run the callback twice when both end events fire', () => {
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      target.dispatchEvent(new Event('transitionend'))
      target.dispatchEvent(new Event('animationend'))

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should not run the callback again on a cancel event after completion', () => {
      // afterAnimation() registers four listeners and must remove all four. It
      // used to drop only the two "end" ones, so a cancel arriving afterwards
      // ran the callback a second time.
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      target.dispatchEvent(new Event('transitionend'))
      target.dispatchEvent(new Event('transitioncancel'))

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('no-animation shortcut', () => {
    it('should finish on the following frame when there is no transition', () => {
      stubComputedStyle('0s', 'none')
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()

      expect(callback).not.toHaveBeenCalled()

      frames.flush()

      expect(callback).toHaveBeenCalledTimes(1)
      expect(target.className).toBe('')
    })

    it('should finish on the following frame when every duration in the list is zero', () => {
      stubComputedStyle('0s, 0s', 'none')
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      frames.flush()

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should not shortcut when an animation name is set', () => {
      stubComputedStyle('0s', 'menu-show')
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      frames.flush()

      expect(callback).not.toHaveBeenCalled()
    })

    it('should shortcut for an element a browser reports as untransitioned', () => {
      // The check used to read the `transition` shorthand, which a browser
      // serialises as `all 0s ease 0s` for an element with no transition. That
      // matched neither 'all' nor 'none', so the shortcut never fired and such
      // an element waited for an end event that never came.
      stubComputedStyle('0s', 'none')
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      frames.flush()

      expect(callback).toHaveBeenCalledTimes(1)
      expect(target.classList.contains('fade-enter-active')).toBe(false)
    })

    it('should not shortcut when a real transition is set', () => {
      stubComputedStyle('0.5s', 'none')
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      frames.flush()

      expect(callback).not.toHaveBeenCalled()
    })

    it('should not shortcut when only one property in the list transitions', () => {
      stubComputedStyle('0s, 0.3s', 'none')
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      frames.flush()

      expect(callback).not.toHaveBeenCalled()
    })
  })
})
