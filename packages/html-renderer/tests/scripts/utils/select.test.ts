// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'

import { queryParentSelector } from '../../../scripts/utils/select'

describe('queryParentSelector', () => {
  /**
   * Build a detached chain of nested divs.
   *
   * Detached on purpose: appending to the document would put body and html into
   * the ancestor walk and blur the depth boundary the tests below pin down.
   * @param length number of elements in the chain
   * @returns the chain ordered from innermost (index 0) outwards
   */
  function createChain(length: number): HTMLElement[] {
    const chain: HTMLElement[] = []
    let current: HTMLElement | null = null

    for (let index = 0; index < length; index += 1) {
      const element = document.createElement('div')

      if (current) {
        element.appendChild(current)
      }
      chain.push(element)
      current = element
    }

    // chain[0] is the innermost element, chain[length - 1] the outermost
    return chain
  }

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  describe('matching', () => {
    it('should return the element itself when it matches the selector', () => {
      const element = document.createElement('div')

      element.classList.add('needle')

      expect(queryParentSelector(element, '.needle')).toBe(element)
    })

    it('should return the first matching ancestor', () => {
      const chain = createChain(4)

      chain[2].classList.add('needle')

      expect(queryParentSelector(chain[0], '.needle')).toBe(chain[2])
    })

    it('should return the nearest match when several ancestors match', () => {
      const chain = createChain(4)

      chain[1].classList.add('needle')
      chain[3].classList.add('needle')

      expect(queryParentSelector(chain[0], '.needle')).toBe(chain[1])
    })

    it('should return null when no ancestor matches', () => {
      const chain = createChain(4)

      expect(queryParentSelector(chain[0], '.needle')).toBeNull()
    })

    it('should return null when the element is null', () => {
      expect(queryParentSelector(null, '.needle')).toBeNull()
    })

    it('should stop at the top of a detached chain rather than throwing', () => {
      const chain = createChain(3)

      expect(queryParentSelector(chain[0], '.needle', 100)).toBeNull()
    })

    it('should support attribute selectors, which toggleInert relies on', () => {
      const chain = createChain(3)

      chain[2].setAttribute('data-inert', '[data-x],[data-y]')

      expect(queryParentSelector(chain[0], '[data-inert^="[data-x],"]')).toBe(chain[2])
    })
  })

  describe('depth limit', () => {
    it('should examine exactly maxDepth elements by default (10)', () => {
      const chain = createChain(20)

      // chain[9] is the 10th element the walk looks at: the element itself
      // counts as the first.
      chain[9].classList.add('needle')

      expect(queryParentSelector(chain[0], '.needle')).toBe(chain[9])
    })

    it('should not examine the element one past the default depth (11th)', () => {
      const chain = createChain(20)

      chain[10].classList.add('needle')

      expect(queryParentSelector(chain[0], '.needle')).toBeNull()
    })

    it('should examine only the element itself when maxDepth is 1', () => {
      const chain = createChain(4)

      chain[0].classList.add('needle')

      expect(queryParentSelector(chain[0], '.needle', 1)).toBe(chain[0])
    })

    it('should not examine the parent when maxDepth is 1', () => {
      const chain = createChain(4)

      chain[1].classList.add('needle')

      expect(queryParentSelector(chain[0], '.needle', 1)).toBeNull()
    })

    it('should examine exactly three elements when maxDepth is 3', () => {
      const chain = createChain(6)

      chain[2].classList.add('needle')

      expect(queryParentSelector(chain[0], '.needle', 3)).toBe(chain[2])
    })

    it('should not examine the fourth element when maxDepth is 3', () => {
      const chain = createChain(6)

      chain[3].classList.add('needle')

      expect(queryParentSelector(chain[0], '.needle', 3)).toBeNull()
    })

    it('should return null without examining anything when maxDepth is 0', () => {
      const element = document.createElement('div')

      element.classList.add('needle')

      expect(queryParentSelector(element, '.needle', 0)).toBeNull()
    })

    it('should return null when maxDepth is negative', () => {
      const element = document.createElement('div')

      element.classList.add('needle')

      expect(queryParentSelector(element, '.needle', -1)).toBeNull()
    })
  })
})
