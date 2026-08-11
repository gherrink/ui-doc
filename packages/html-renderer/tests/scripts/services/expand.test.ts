// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { initExpand } from '../../../scripts/services/expand'
import type { FrameQueue } from '../support/frames'
import { stubAnimationFrames } from '../support/frames'

/**
 * Render markup, then wire it up with initExpand().
 * @param html markup for document.body
 */
function setup(html: string): void {
  document.body.innerHTML = html
  initExpand()
}

/**
 * Look up an element that the test knows exists.
 * @param selector css selector
 * @returns the matching element
 */
function el(selector: string): HTMLElement {
  const found = document.querySelector<HTMLElement>(selector)

  if (!found) {
    throw new Error(`Test fixture is missing "${selector}"`)
  }

  return found
}

/**
 * Ids of every element currently carrying the inert attribute.
 * @returns the ids, in document order
 */
function inertIds(): string[] {
  return Array.from(document.querySelectorAll('[inert]')).map(node => node.id)
}

describe('initExpand', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  describe('aria-expanded toggling', () => {
    it('should flip aria-expanded from false to true on click', () => {
      setup('<button id="btn" aria-expanded="false">Toggle</button>')

      el('#btn').click()

      expect(el('#btn').getAttribute('aria-expanded')).toBe('true')
    })

    it('should flip aria-expanded from true to false on click', () => {
      setup('<button id="btn" aria-expanded="true">Toggle</button>')

      el('#btn').click()

      expect(el('#btn').getAttribute('aria-expanded')).toBe('false')
    })

    it('should keep toggling on repeated clicks', () => {
      setup('<button id="btn" aria-expanded="false">Toggle</button>')

      el('#btn').click()
      el('#btn').click()
      el('#btn').click()

      expect(el('#btn').getAttribute('aria-expanded')).toBe('true')
    })

    it('should treat any value other than "true" as collapsed', () => {
      setup('<button id="btn" aria-expanded="">Toggle</button>')

      el('#btn').click()

      expect(el('#btn').getAttribute('aria-expanded')).toBe('true')
    })

    it('should toggle each expander independently', () => {
      setup(
        '<button id="one" aria-expanded="false"></button>' +
          '<button id="two" aria-expanded="false"></button>',
      )

      el('#one').click()

      expect(el('#one').getAttribute('aria-expanded')).toBe('true')
      expect(el('#two').getAttribute('aria-expanded')).toBe('false')
    })

    it('should ignore elements without an aria-expanded attribute', () => {
      setup('<button id="btn"></button>')

      el('#btn').click()

      expect(el('#btn').hasAttribute('aria-expanded')).toBe(false)
    })
  })

  describe('empty-string guards', () => {
    // querySelectorAll('') and querySelector('#') both throw a SyntaxError.
    // The guards in expand.ts check for "null or empty string", not just null,
    // which is what keeps those calls from ever being made. These tests fail
    // loudly if a guard is ever relaxed to a plain null check.

    it('should not build a selector from an empty aria-controls', () => {
      const querySelector = vi.spyOn(document, 'querySelector')
      const querySelectorAll = vi.spyOn(document, 'querySelectorAll')

      setup('<button id="btn" aria-expanded="false" aria-controls=""></button>')
      el('#btn').click()

      expect(querySelector).not.toHaveBeenCalledWith('#')
      expect(querySelectorAll).not.toHaveBeenCalledWith('# [aria-controls=""]')
    })

    it('should still toggle aria-expanded when aria-controls is empty', () => {
      setup('<button id="btn" aria-expanded="false" aria-controls=""></button>')

      expect(() => {
        el('#btn').click()
      }).not.toThrow()
      expect(el('#btn').getAttribute('aria-expanded')).toBe('true')
    })

    it('should not throw while wiring up an expander with an empty aria-controls', () => {
      expect(() => {
        setup('<button id="btn" aria-expanded="false" aria-controls=""></button>')
      }).not.toThrow()
    })

    it('should never call querySelectorAll with an empty selector for an empty data-inert', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden data-inert=""></div>',
      )
      const querySelectorAll = vi.spyOn(document, 'querySelectorAll')

      el('#btn').click()

      expect(querySelectorAll).not.toHaveBeenCalledWith('')
    })

    it('should not throw when data-inert is empty', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden data-inert=""></div>' +
          '<div id="other"></div>',
      )

      expect(() => {
        el('#btn').click()
      }).not.toThrow()
      expect(el('#btn').getAttribute('aria-expanded')).toBe('true')
      expect(el('#target').hasAttribute('hidden')).toBe(false)
    })

    it('should mark nothing inert when data-inert is empty', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden data-inert=""></div>' +
          '<div id="other"></div>',
      )

      el('#btn').click()

      expect(inertIds()).toEqual([])
    })

    it('should not throw when data-inert is absent', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden></div>',
      )

      expect(() => {
        el('#btn').click()
      }).not.toThrow()
      expect(inertIds()).toEqual([])
    })
  })

  describe('aria-controls wiring', () => {
    it('should remove the hidden attribute from the controlled target when expanding', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden></div>',
      )

      el('#btn').click()

      expect(el('#target').hasAttribute('hidden')).toBe(false)
    })

    it('should set the hidden attribute on the controlled target when collapsing', () => {
      setup(
        '<button id="btn" aria-expanded="true" aria-controls="target"></button>' +
          '<div id="target"></div>',
      )

      el('#btn').click()

      expect(el('#target').hasAttribute('hidden')).toBe(true)
    })

    it('should prefer aria-hidden over hidden when the target already has it', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" aria-hidden="true"></div>',
      )

      el('#btn').click()

      expect(el('#target').getAttribute('aria-hidden')).toBe('false')
      expect(el('#target').hasAttribute('hidden')).toBe(false)
    })

    it('should set aria-hidden true when collapsing an aria-hidden target', () => {
      setup(
        '<button id="btn" aria-expanded="true" aria-controls="target"></button>' +
          '<div id="target" aria-hidden="false"></div>',
      )

      el('#btn').click()

      expect(el('#target').getAttribute('aria-hidden')).toBe('true')
      expect(el('#target').hasAttribute('hidden')).toBe(false)
    })

    it('should leave aria-expanded untouched when the controlled target does not exist', () => {
      // toggleControlTarget() bails out before invoking the callback that flips
      // aria-expanded, so a dangling aria-controls silently disables the button.
      setup('<button id="btn" aria-expanded="false" aria-controls="missing"></button>')

      el('#btn').click()

      expect(el('#btn').getAttribute('aria-expanded')).toBe('false')
    })

    it('should also wire controls nested inside the controlled target', () => {
      setup(
        '<button id="opener" aria-expanded="true" aria-controls="target"></button>' +
          '<div id="target"><button id="closer" aria-controls="target"></button></div>',
      )

      el('#closer').click()

      expect(el('#opener').getAttribute('aria-expanded')).toBe('false')
      expect(el('#target').hasAttribute('hidden')).toBe(true)
    })

    it('should not wire nested controls that point at a different target', () => {
      setup(
        '<button id="opener" aria-expanded="true" aria-controls="target"></button>' +
          '<div id="target"><button id="other" aria-controls="elsewhere"></button></div>' +
          '<div id="elsewhere"></div>',
      )

      el('#other').click()

      expect(el('#opener').getAttribute('aria-expanded')).toBe('true')
      expect(el('#target').hasAttribute('hidden')).toBe(false)
    })
  })

  describe('tabindex management', () => {
    it('should make direct children with tabindex -1 focusable when expanding', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden><a id="direct" tabindex="-1"></a></div>',
      )

      el('#btn').click()

      expect(el('#direct').getAttribute('tabindex')).toBe('0')
    })

    it('should make nested descendants focusable when the target is not hidden', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target"><div><a id="nested" tabindex="-1"></a></div></div>',
      )

      el('#btn').click()

      expect(el('#nested').getAttribute('tabindex')).toBe('0')
    })

    it('should leave nested descendants unfocusable when expanding a hidden target', () => {
      // Ordering bug: toggleControlTarget() runs the tabindex fixup *before*
      // toggleHide() removes `hidden`, so while expanding, the target still
      // matches `[hidden]` and its own descendants are excluded by
      // `:not([hidden] [tabindex="-1"])`. Only the `:scope >` branch survives,
      // so anything nested deeper than one level never regains focusability.
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden><div><a id="nested" tabindex="-1"></a></div></div>',
      )

      el('#btn').click()

      expect(el('#nested').getAttribute('tabindex')).toBe('-1')
    })

    it('should leave nested descendants unfocusable when expanding an aria-hidden target', () => {
      // Same ordering bug through the aria-hidden branch.
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" aria-hidden="true"><div><a id="nested" tabindex="-1"></a></div></div>',
      )

      el('#btn').click()

      expect(el('#nested').getAttribute('tabindex')).toBe('-1')
    })

    it('should leave descendants inside a hidden subtree unfocusable', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden><div hidden><a id="buried" tabindex="-1"></a></div></div>',
      )

      el('#btn').click()

      expect(el('#buried').getAttribute('tabindex')).toBe('-1')
    })

    it('should leave descendants inside an aria-hidden subtree unfocusable', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden>' +
          '<div aria-hidden="true"><a id="buried" tabindex="-1"></a></div>' +
          '</div>',
      )

      el('#btn').click()

      expect(el('#buried').getAttribute('tabindex')).toBe('-1')
    })

    it('should make every tabbable element unfocusable when collapsing', () => {
      setup(
        '<button id="btn" aria-expanded="true" aria-controls="target"></button>' +
          '<div id="target"><a id="one" tabindex="0"></a><div><a id="two" tabindex="0"></a></div></div>',
      )

      el('#btn').click()

      expect(el('#one').getAttribute('tabindex')).toBe('-1')
      expect(el('#two').getAttribute('tabindex')).toBe('-1')
    })

    it('should restore focusability across a collapse and expand cycle', () => {
      setup(
        '<button id="btn" aria-expanded="true" aria-controls="target"></button>' +
          '<div id="target"><a id="link" tabindex="0"></a></div>',
      )

      el('#btn').click()
      el('#btn').click()

      expect(el('#link').getAttribute('tabindex')).toBe('0')
    })
  })

  describe('inert toggling', () => {
    it('should mark elements matching a single data-inert selector as inert', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden data-inert="[data-controlled]"></div>' +
          '<div id="a" data-controlled=""></div><div id="b" data-controlled=""></div>',
      )

      el('#btn').click()

      expect(inertIds()).toEqual(['a', 'b'])
    })

    it('should remove inert again when collapsing', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden data-inert="[data-controlled]"></div>' +
          '<div id="a" data-controlled=""></div>',
      )

      el('#btn').click()
      el('#btn').click()

      expect(inertIds()).toEqual([])
    })

    it('should honour every selector in a comma separated data-inert', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden data-inert="#a,#b,#c"></div>' +
          '<div id="a"></div><div id="b"></div><div id="c"></div><div id="d"></div>',
      )

      el('#btn').click()

      expect(inertIds()).toEqual(['a', 'b', 'c'])
    })

    it('should tolerate whitespace after the separating comma', () => {
      // This is the form the shipped nav-main template uses:
      // data-inert="body > .content, body > footer"
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden data-inert="#a, #b"></div>' +
          '<div id="a"></div><div id="b"></div>',
      )

      el('#btn').click()

      expect(inertIds()).toEqual(['a', 'b'])
    })

    it('should support descendant selectors like the shipped nav template uses', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden data-inert="body > .content, body > footer"></div>' +
          '<div id="content" class="content"></div><footer id="foot"></footer>',
      )

      el('#btn').click()

      expect(inertIds()).toEqual(['content', 'foot'])
    })

    it('should mark nothing inert when no element matches the selector', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden data-inert="#nothing-here"></div>',
      )

      el('#btn').click()

      expect(inertIds()).toEqual([])
    })

    describe('nested targets sharing a selector', () => {
      /**
       * Two nested controlled targets, both claiming inert over `#outside`.
       * @param outerInert the ancestor target's data-inert value
       * @returns markup for the fixture
       */
      function nested(outerInert: string): string {
        return (
          `<div id="outer" data-inert="${outerInert}">` +
          '<button id="inner-btn" aria-expanded="true" aria-controls="inner"></button>' +
          '<div id="inner" data-inert="#outside"></div>' +
          '</div>' +
          '<div id="outside" inert=""></div>'
        )
      }

      it('should keep inert when an ancestor declares the exact same selector', () => {
        setup(nested('#outside'))

        el('#inner-btn').click()

        expect(inertIds()).toEqual(['outside'])
      })

      it('should keep inert when an ancestor lists the selector first', () => {
        setup(nested('#outside,#other'))

        el('#inner-btn').click()

        expect(inertIds()).toEqual(['outside'])
      })

      it('should keep inert when an ancestor lists the selector last', () => {
        setup(nested('#other,#outside'))

        el('#inner-btn').click()

        expect(inertIds()).toEqual(['outside'])
      })

      it('should keep inert when an ancestor lists the selector in the middle', () => {
        setup(nested('#other,#outside,#more'))

        el('#inner-btn').click()

        expect(inertIds()).toEqual(['outside'])
      })

      it('should release inert when the ancestor claims a different selector', () => {
        setup(nested('#unrelated'))

        el('#inner-btn').click()

        expect(inertIds()).toEqual([])
      })

      it('should not treat a selector that merely contains the name as a match', () => {
        setup(nested('#outside-extra'))

        el('#inner-btn').click()

        expect(inertIds()).toEqual([])
      })

      it('should release inert when there is no ancestor claim at all', () => {
        setup(
          '<button id="inner-btn" aria-expanded="true" aria-controls="inner"></button>' +
            '<div id="inner" data-inert="#outside"></div>' +
            '<div id="outside" inert=""></div>',
        )

        el('#inner-btn').click()

        expect(inertIds()).toEqual([])
      })

      it('should stop looking for an ancestor claim beyond ten elements', () => {
        // queryParentSelector defaults to maxDepth 10, counted from
        // target.parentElement. Wrapping the claim eleven levels up puts it out
        // of reach, so the inner target releases inert even though an ancestor
        // still wants it.
        const wrappers = '<div>'.repeat(11)

        setup(
          `<div id="outer" data-inert="#outside">${wrappers}` +
            '<button id="inner-btn" aria-expanded="true" aria-controls="inner"></button>' +
            '<div id="inner" data-inert="#outside"></div>' +
            `${'</div>'.repeat(11)}</div>` +
            '<div id="outside" inert=""></div>',
        )

        el('#inner-btn').click()

        expect(inertIds()).toEqual([])
      })
    })
  })

  describe('data-hide-same-level', () => {
    it('should collapse expanded siblings when opening', () => {
      setup(
        '<div>' +
          '<button id="one" aria-expanded="true" data-hide-same-level></button>' +
          '<button id="two" aria-expanded="false" data-hide-same-level></button>' +
          '</div>',
      )

      el('#two').click()

      expect(el('#one').getAttribute('aria-expanded')).toBe('false')
      expect(el('#two').getAttribute('aria-expanded')).toBe('true')
    })

    it('should re-expand the last sibling when more than one was open', () => {
      // Cascade bug. Clicking #three snapshots [#one, #two] and clicks each in
      // turn. #one carries data-hide-same-level too, so its own handler already
      // clicks #two shut; the relatedTarget guard only stops #one from clicking
      // #three back, not from reaching #two. #three's loop then clicks #two a
      // second time, which re-opens it.
      //
      // Only reachable with three or more siblings, two of them expanded. The
      // shipped templates never nest that many, which is why it has gone
      // unnoticed.
      setup(
        '<div>' +
          '<button id="one" aria-expanded="true" data-hide-same-level></button>' +
          '<button id="two" aria-expanded="true" data-hide-same-level></button>' +
          '<button id="three" aria-expanded="false" data-hide-same-level></button>' +
          '</div>',
      )

      el('#three').click()

      expect(el('#one').getAttribute('aria-expanded')).toBe('false')
      expect(el('#two').getAttribute('aria-expanded')).toBe('true')
      expect(el('#three').getAttribute('aria-expanded')).toBe('true')
    })

    it('should collapse every expanded sibling when they do not cascade', () => {
      setup(
        '<div>' +
          '<button id="one" aria-expanded="true"></button>' +
          '<button id="two" aria-expanded="true"></button>' +
          '<button id="three" aria-expanded="false" data-hide-same-level></button>' +
          '</div>',
      )

      el('#three').click()

      expect(el('#one').getAttribute('aria-expanded')).toBe('false')
      expect(el('#two').getAttribute('aria-expanded')).toBe('false')
      expect(el('#three').getAttribute('aria-expanded')).toBe('true')
    })

    it('should not bounce back into the element that triggered the collapse', () => {
      // The dispatched click carries relatedTarget, and each handler filters it
      // out again. Without that filter the two handlers would call each other
      // until the stack overflows.
      setup(
        '<div>' +
          '<button id="one" aria-expanded="true" data-hide-same-level></button>' +
          '<button id="two" aria-expanded="false" data-hide-same-level></button>' +
          '</div>',
      )

      expect(() => {
        el('#two').click()
      }).not.toThrow()
      expect(el('#two').getAttribute('aria-expanded')).toBe('true')
    })

    it('should leave elements outside the parent alone', () => {
      setup(
        '<div><button id="inside" aria-expanded="false" data-hide-same-level></button></div>' +
          '<button id="outside" aria-expanded="true"></button>',
      )

      el('#inside').click()

      expect(el('#outside').getAttribute('aria-expanded')).toBe('true')
    })

    it('should leave nested expanded elements alone', () => {
      setup(
        '<div>' +
          '<button id="btn" aria-expanded="false" data-hide-same-level></button>' +
          '<div><button id="deeper" aria-expanded="true"></button></div>' +
          '</div>',
      )

      el('#btn').click()

      expect(el('#deeper').getAttribute('aria-expanded')).toBe('true')
    })

    it('should not touch siblings when the attribute is absent', () => {
      setup(
        '<div>' +
          '<button id="one" aria-expanded="true"></button>' +
          '<button id="two" aria-expanded="false"></button>' +
          '</div>',
      )

      el('#two').click()

      expect(el('#one').getAttribute('aria-expanded')).toBe('true')
    })
  })

  describe('data-animate', () => {
    let frames: FrameQueue

    beforeEach(() => {
      frames = stubAnimationFrames()
      vi.stubGlobal('getComputedStyle', () => ({
        animationName: 'none',
        transition: 'opacity 0.5s ease 0s',
      }))
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should reveal the target before animating it in', () => {
      setup(
        '<button id="btn" aria-expanded="false" aria-controls="target"></button>' +
          '<div id="target" hidden data-animate="fade"></div>',
      )

      el('#btn').click()

      expect(el('#target').hasAttribute('hidden')).toBe(false)
      expect(el('#target').classList.contains('fade-enter-active')).toBe(true)
      expect(el('#btn').getAttribute('aria-expanded')).toBe('true')
    })

    it('should keep the target visible until the leave animation ends', () => {
      setup(
        '<button id="btn" aria-expanded="true" aria-controls="target"></button>' +
          '<div id="target" data-animate="fade"></div>',
      )

      el('#btn').click()
      frames.flush()

      expect(el('#target').hasAttribute('hidden')).toBe(false)
      expect(el('#btn').getAttribute('aria-expanded')).toBe('true')

      el('#target').dispatchEvent(new Event('transitionend'))

      expect(el('#target').hasAttribute('hidden')).toBe(true)
      expect(el('#btn').getAttribute('aria-expanded')).toBe('false')
    })

    it('should hide immediately when data-animate is empty', () => {
      setup(
        '<button id="btn" aria-expanded="true" aria-controls="target"></button>' +
          '<div id="target" data-animate=""></div>',
      )

      el('#btn').click()

      expect(el('#target').hasAttribute('hidden')).toBe(true)
      expect(el('#target').className).toBe('')
    })

    it('should release inert before the leave animation finishes', () => {
      // toggleInert() runs ahead of the animation, so the surrounding page
      // becomes interactive again while the panel is still fading out.
      setup(
        '<button id="btn" aria-expanded="true" aria-controls="target"></button>' +
          '<div id="target" data-animate="fade" data-inert="#outside"></div>' +
          '<div id="outside" inert=""></div>',
      )

      el('#btn').click()

      expect(inertIds()).toEqual([])
    })
  })
})
