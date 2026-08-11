// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { initExample } from '../../../scripts/services/example'
import type { FakeMutationObserver, FakeResizeObserver } from '../support/observers'
import { stubMutationObserver, stubResizeObserver } from '../support/observers'

/**
 * jsdom never lays a document out, so every scrollHeight is 0. Override it so
 * the height plumbing has something to react to.
 * @param body the element to fake a scroll height on
 * @param height the value scrollHeight should report
 */
function setScrollHeight(body: HTMLElement, height: number): void {
  Object.defineProperty(body, 'scrollHeight', {
    configurable: true,
    get: () => height,
  })
}

/**
 * Override a document's readyState, which is a prototype getter.
 * @param doc the document to override
 * @param state the value readyState should report
 */
function setReadyState(doc: Document, state: DocumentReadyState): void {
  Object.defineProperty(doc, 'readyState', {
    configurable: true,
    get: () => state,
  })
}

describe('initExample', () => {
  let mutationObservers: FakeMutationObserver[]
  let resizeObservers: FakeResizeObserver[]

  beforeEach(() => {
    mutationObservers = stubMutationObserver()
    resizeObservers = stubResizeObserver()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  /**
   * Render one example iframe and return it together with its document.
   * @param height the scroll height the iframe document should report
   * @returns the iframe and its content document
   */
  function createExample(height: number): { doc: Document; iframe: HTMLIFrameElement } {
    document.body.innerHTML = '<div data-example><iframe></iframe></div>'
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    const doc = iframe.contentDocument as Document

    setScrollHeight(doc.body, height)

    return { doc, iframe }
  }

  describe('height synchronisation', () => {
    it('should size the iframe to its content on init', () => {
      const { iframe } = createExample(320)

      initExample()

      expect(iframe.style.height).toBe('320px')
    })

    it('should resize when the mutation observer reports a change', () => {
      const { doc, iframe } = createExample(320)

      initExample()
      setScrollHeight(doc.body, 480)
      mutationObservers[0].trigger()

      expect(iframe.style.height).toBe('480px')
    })

    it('should resize when the resize observer reports a change', () => {
      const { doc, iframe } = createExample(320)

      initExample()
      setScrollHeight(doc.body, 200)
      resizeObservers[0].trigger()

      expect(iframe.style.height).toBe('200px')
    })

    it('should not rewrite the height when the content height is unchanged', () => {
      const { iframe } = createExample(320)

      initExample()
      // A value the code would never produce: it survives only if changeHeight
      // bails out on the unchanged scroll height.
      iframe.style.height = '999px'
      mutationObservers[0].trigger()

      expect(iframe.style.height).toBe('999px')
    })

    it('should keep tracking further changes after a no-op callback', () => {
      const { doc, iframe } = createExample(320)

      initExample()
      mutationObservers[0].trigger()
      setScrollHeight(doc.body, 500)
      mutationObservers[0].trigger()

      expect(iframe.style.height).toBe('500px')
    })
  })

  describe('observers', () => {
    it('should observe the iframe body for mutations, deeply', () => {
      const { doc } = createExample(320)

      initExample()

      expect(mutationObservers[0].observed).toEqual([doc.body])
      expect(mutationObservers[0].options).toEqual({
        attributes: true,
        childList: true,
        subtree: true,
      })
    })

    it('should observe the iframe body for resizes', () => {
      const { doc } = createExample(320)

      initExample()

      expect(resizeObservers[0].observed).toEqual([doc.body])
    })

    it('should set up one pair of observers per example iframe', () => {
      document.body.innerHTML =
        '<div data-example><iframe></iframe></div><div data-example><iframe></iframe></div>'

      initExample()

      expect(mutationObservers).toHaveLength(2)
      expect(resizeObservers).toHaveLength(2)
    })
  })

  describe('selection', () => {
    it('should ignore iframes that are not direct children of a data-example', () => {
      document.body.innerHTML = '<div data-example><div><iframe></iframe></div></div>'

      initExample()

      expect(mutationObservers).toHaveLength(0)
    })

    it('should ignore iframes outside a data-example container', () => {
      document.body.innerHTML = '<div><iframe></iframe></div>'

      initExample()

      expect(mutationObservers).toHaveLength(0)
    })

    it('should skip an iframe with no reachable document', () => {
      document.body.innerHTML = '<div data-example><iframe></iframe></div>'
      const iframe = document.querySelector('iframe') as HTMLIFrameElement

      Object.defineProperty(iframe, 'contentDocument', { configurable: true, get: () => null })
      Object.defineProperty(iframe, 'contentWindow', { configurable: true, get: () => null })

      expect(() => {
        initExample()
      }).not.toThrow()
      expect(mutationObservers).toHaveLength(0)
    })
  })

  describe('deferred initialisation', () => {
    it('should wait for the load event when the document has not finished loading', () => {
      const { doc, iframe } = createExample(320)

      setReadyState(doc, 'loading')
      initExample()

      expect(iframe.style.height).toBe('')
      expect(mutationObservers).toHaveLength(0)

      iframe.dispatchEvent(new Event('load'))

      expect(iframe.style.height).toBe('320px')
      expect(mutationObservers).toHaveLength(1)
    })

    it('should read the document captured before load, not the one loaded into the frame', () => {
      // Stale-reference bug: the content document is resolved once, at init.
      // When the frame is still loading, a real navigation replaces that
      // document, but the load handler keeps measuring and observing the
      // original one. Here the frame ends up sized from the throwaway document
      // rather than from the page it actually loaded.
      document.body.innerHTML = '<div data-example><iframe></iframe></div>'
      const iframe = document.querySelector('iframe') as HTMLIFrameElement
      const before = document.implementation.createHTMLDocument('before')
      const after = document.implementation.createHTMLDocument('after')
      let current = before

      setReadyState(before, 'loading')
      setScrollHeight(before.body, 100)
      setScrollHeight(after.body, 900)
      Object.defineProperty(iframe, 'contentDocument', {
        configurable: true,
        get: () => current,
      })

      initExample()
      current = after
      iframe.dispatchEvent(new Event('load'))

      expect(iframe.style.height).toBe('100px')
      expect(mutationObservers[0].observed).toEqual([before.body])
    })
  })
})
