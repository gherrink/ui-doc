// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { initSidebar } from '../../../scripts/services/sidebar'
import type { FakeIntersectionObserver } from '../support/observers'
import { intersectionEntry, stubIntersectionObserver } from '../support/observers'

describe('initSidebar', () => {
  let observers: FakeIntersectionObserver[]

  /**
   * Render markup, then wire it up with initSidebar().
   * @param html markup for document.body
   */
  function setup(html: string): void {
    document.body.innerHTML = html
    initSidebar()
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

  /** Ids of every element currently carrying the active class, in document order. */
  function activeIds(): string[] {
    return Array.from(document.querySelectorAll('.active')).map(node => node.id)
  }

  /**
   * A sidebar linking to two sections, both of which exist on the page.
   * @returns markup for the fixture
   */
  function twoSections(): string {
    return (
      '<nav data-sidebar>' +
      '<ul><li><a id="link-a" href="#a"></a></li><li><a id="link-b" href="#b"></a></li></ul>' +
      '</nav>' +
      '<section id="a"></section><section id="b"></section>'
    )
  }

  beforeEach(() => {
    observers = stubIntersectionObserver()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('wiring', () => {
    it('should create one observer per data-sidebar element', () => {
      setup(`${twoSections()}<nav data-sidebar><a href="#a"></a></nav>`)

      expect(observers).toHaveLength(2)
    })

    it('should create no observer when the page has no sidebar', () => {
      setup('<section id="a"></section>')

      expect(observers).toHaveLength(0)
    })

    it('should observe the section each in-page link points at', () => {
      setup(twoSections())

      expect(observers[0].observed).toEqual([el('#a'), el('#b')])
    })

    it('should use the documented observer options', () => {
      setup(twoSections())

      expect(observers[0].options).toEqual({
        root: null,
        rootMargin: '0px 0px -90% 0px',
        threshold: 0.5,
      })
    })

    it('should skip links whose target is not on the page', () => {
      setup('<nav data-sidebar><a href="#gone"></a></nav>')

      expect(observers[0].observed).toEqual([])
    })

    it('should skip a bare hash link', () => {
      setup('<nav data-sidebar><a href="#"></a></nav><section id="a"></section>')

      expect(observers[0].observed).toEqual([])
    })

    it('should ignore links that do not point into the page', () => {
      setup(
        '<nav data-sidebar><a href="https://example.com/#a"></a></nav><section id="a"></section>',
      )

      expect(observers[0].observed).toEqual([])
    })

    it('should observe only sections belonging to its own sidebar', () => {
      setup(
        '<nav data-sidebar><a href="#a"></a></nav>' +
          '<nav data-sidebar><a href="#b"></a></nav>' +
          '<section id="a"></section><section id="b"></section>',
      )

      expect(observers[0].observed).toEqual([el('#a')])
      expect(observers[1].observed).toEqual([el('#b')])
    })
  })

  describe('active link', () => {
    it('should mark the link of an intersecting section active', () => {
      setup(twoSections())

      observers[0].trigger([intersectionEntry(el('#a'), true)])

      expect(activeIds()).toEqual(['link-a'])
    })

    it('should move the active mark to the newly intersecting section', () => {
      setup(twoSections())

      observers[0].trigger([intersectionEntry(el('#a'), true)])
      observers[0].trigger([intersectionEntry(el('#b'), true)])

      expect(activeIds()).toEqual(['link-b'])
    })

    it('should keep the current active link when nothing intersects', () => {
      setup(twoSections())

      observers[0].trigger([intersectionEntry(el('#a'), true)])
      observers[0].trigger([intersectionEntry(el('#a'), false)])

      expect(activeIds()).toEqual(['link-a'])
    })

    it('should do nothing when the callback receives no entries at all', () => {
      setup(twoSections())

      observers[0].trigger([])

      expect(activeIds()).toEqual([])
    })

    it('should use the first intersecting entry when several intersect', () => {
      setup(twoSections())

      observers[0].trigger([intersectionEntry(el('#b'), true), intersectionEntry(el('#a'), true)])

      expect(activeIds()).toEqual(['link-b'])
    })

    it('should skip leading non-intersecting entries', () => {
      setup(twoSections())

      observers[0].trigger([intersectionEntry(el('#a'), false), intersectionEntry(el('#b'), true)])

      expect(activeIds()).toEqual(['link-b'])
    })

    it('should clear an active class that came from the rendered markup', () => {
      setup(
        '<nav data-sidebar><a id="link-a" class="active" href="#a"></a>' +
          '<a id="link-b" href="#b"></a></nav>' +
          '<section id="a"></section><section id="b"></section>',
      )

      observers[0].trigger([intersectionEntry(el('#b'), true)])

      expect(activeIds()).toEqual(['link-b'])
    })
  })

  describe('nested sections', () => {
    /**
     * A two-level sidebar: a parent link, and a nested list below it. The child
     * anchor sits exactly three parents below the outer list item, which is the
     * relationship sidebar.ts looks for.
     * @returns markup for the fixture
     */
    function nested(): string {
      return (
        '<nav data-sidebar><ul>' +
        '<li id="outer"><a id="link-parent" href="#parent"></a>' +
        '<ul><li><a id="link-child" href="#child"></a></li></ul>' +
        '</li>' +
        '</ul></nav>' +
        '<section id="parent"></section><section id="child"></section>'
      )
    }

    it('should also mark the parent link active for a nested section', () => {
      setup(nested())

      observers[0].trigger([intersectionEntry(el('#child'), true)])

      expect(activeIds()).toEqual(['link-parent', 'link-child'])
    })

    it('should drop the parent mark again when the parent section takes over', () => {
      setup(nested())

      observers[0].trigger([intersectionEntry(el('#child'), true)])
      observers[0].trigger([intersectionEntry(el('#parent'), true)])

      expect(activeIds()).toEqual(['link-parent'])
    })

    it('should not promote anything when the third parent is not a list item', () => {
      setup(
        '<nav data-sidebar><div><div><div>' +
          '<a id="link-a" href="#a"></a>' +
          '</div></div></div><a id="link-b" href="#b"></a></nav>' +
          '<section id="a"></section><section id="b"></section>',
      )

      observers[0].trigger([intersectionEntry(el('#a'), true)])

      expect(activeIds()).toEqual(['link-a'])
    })
  })
})
