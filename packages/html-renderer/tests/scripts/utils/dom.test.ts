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
 * Replace window.getComputedStyle so animate() sees the transition and
 * animation-name it would see in a browser.
 * @param transition value for the `transition` shorthand
 * @param animationName value for `animation-name`
 */
function stubComputedStyle(transition: string, animationName: string): void {
  vi.stubGlobal('getComputedStyle', () => ({ animationName, transition }))
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
    stubComputedStyle('all 0s ease 0s', 'none')
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

    it('should run the callback again on a cancel event after completion', () => {
      // Known leak: afterAnimation() removes only the `animationend` and
      // `transitionend` listeners, never the two `*cancel` listeners it also
      // registered. A cancel event arriving after the animation finished
      // therefore re-runs the callback. Pinned so the behaviour cannot change
      // unnoticed while it is being fixed.
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      target.dispatchEvent(new Event('transitionend'))
      target.dispatchEvent(new Event('transitioncancel'))

      expect(callback).toHaveBeenCalledTimes(2)
    })
  })

  describe('no-animation shortcut', () => {
    it('should finish on the following frame when computed transition is "none"', () => {
      stubComputedStyle('none', 'none')
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()

      expect(callback).not.toHaveBeenCalled()

      frames.flush()

      expect(callback).toHaveBeenCalledTimes(1)
      expect(target.className).toBe('')
    })

    it('should finish on the following frame when computed transition is "all"', () => {
      stubComputedStyle('all', 'none')
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      frames.flush()

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should not shortcut when an animation name is set', () => {
      stubComputedStyle('none', 'menu-show')
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      frames.flush()

      expect(callback).not.toHaveBeenCalled()
    })

    it('should not shortcut for the browser default transition value', () => {
      // A browser reports `all 0s ease 0s` for an element without a transition,
      // which is not in the ['all', 'none'] list the shortcut checks. The
      // shortcut therefore never fires in a real browser: an element with no
      // transition and no animation waits for an end event that never comes.
      stubComputedStyle('all 0s ease 0s', 'none')
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      frames.flush()

      expect(callback).not.toHaveBeenCalled()
      expect(target.classList.contains('fade-enter-active')).toBe(true)
    })

    it('should not shortcut when a real transition is set', () => {
      stubComputedStyle('opacity 0.5s ease 0s', 'none')
      const callback = vi.fn<() => void>()

      animate(target, 'fade', true, callback)
      frames.flush()
      frames.flush()

      expect(callback).not.toHaveBeenCalled()
    })
  })
})
