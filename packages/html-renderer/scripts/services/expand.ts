import { animate } from '../utils/dom'
import { queryParentSelector } from '../utils/select'

/**
 * Sometimes you need to prevent the user from interacting with other elements while an element is expanded. Then you need the [inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert) attribute.
 * You can set the `data-inert` attribute with selectors (comma separated) to control the `inert` attribute of elements matching your selectors.
 * @location functions.expand.with-inerts Expand controlling inert
 * @order 30
 * @example
 * <style>
 * button::after {
 *   content: ' ' attr(aria-expanded);
 * }
 * </style>
 * <button aria-expanded="false" aria-controls="target">Expanded:</button>
 * <div id="target" hidden data-inert="[data-inert-controlled],#inert-controlled-2">Controlled Target</div>
 * <div data-inert-controlled=""><button>Button 1.1</button><button>Button 1.2</button></div>
 * <div id="inert-controlled-2"><button>Button 2.1</button><button>Button 2.2</button></div>
 * @code
 * <button aria-expanded="false" aria-controls="target">Expanded:</button>
 * <div id="target" hidden data-inert="[data-inert-controlled],#inert-controlled-2">Controlled Target</div>
 * <div data-inert-controlled="1"><button>Button 1.1</button><button>Button 1.2</button></div>
 * <div id="inert-controlled-2"><button>Button 2.1</button><button>Button 2.2</button></div>
 */
function toggleInert(target: HTMLElement, show: boolean): void {
  const inertSelector = target.getAttribute('data-inert')

  if (!inertSelector) {
    return
  }

  inertSelector.split(',').forEach(selector => {
    // if the target is inside an element with the same selector, we don't want to remove the inert attribute
    const activeParentWithSameSelector = !show
      ? queryParentSelector(
          target.parentElement,
          `[data-inert="${selector}"],[data-inert^="${selector},"],[data-inert$=",${selector}"],[data-inert*=",${selector},"]`,
        )
      : null

    if (activeParentWithSameSelector) {
      return
    }

    document.querySelectorAll(selector).forEach(invertOn => {
      if (show) {
        invertOn.setAttribute('inert', '')
      } else {
        invertOn.removeAttribute('inert')
      }
    })
  })
}

/**
 * If you want to control a specific aria you can combine [aria-expanded](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded) attribute with [aria-controls](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-controls) attribute.
 *
 * When an element with the `aria-expanded` attribute is clicked, the value of the attribute will be toggled between `true` and `false`. Also the element with the id specified in the `aria-controls` attribute will be toggled between `aria-hidden="true"` and `aria-hidden="false"`. If no `aria-hidden` attribute is present, the `hidden` attribute will be used.`
 *
 * @location functions.expand.with-controls Expand with controls
 * @order 10
 * @example
 * <style>
 * button::after {
 *   content: ' ' attr(aria-expanded);
 * }
 * </style>
 * <button aria-expanded="true" aria-controls="target-aria-hidden">Expanded:</button>
 * <div id="target-aria-hidden" aria-hidden="false">Controlled Target</div>
 * <hr>
 * <button aria-expanded="true" aria-controls="target-hidden">Expanded:</button>
 * <div id="target-hidden">Controlled Target</div>
 * @code
 * <button aria-expanded="true" aria-controls="target-aria-hidden">Expanded:</button>
 * <div id="target-aria-hidden" aria-hidden="false">Controlled Target</div>
 * <hr>
 * <button aria-expanded="true" aria-controls="target-hidden">Expanded:</button>
 * <div id="target-hidden">Controlled Target</div>
 */

/**
 * You can add animations/transitions on the controlled element by adding the `data-animate` attribute with the animation name.
 * The animation name will be used to add the necessary classes to the element to trigger the animation.
 * Please refer to the animate function for more information, what classes will be added and when.
 *
 * @location functions.expand.with-animation Expand with animation
 * @order 20
 * @example
 * <style>
 *   .fade-enter-active,
 *   .fade-leave-active {
 *     transition: opacity 0.5s ease;
 *   }
 *
 *   .fade-enter-from,
 *   .fade-leave-to {
 *     opacity: 0;
 *   }
 * </style>
 * <button aria-expanded="true" aria-controls="target-hidden">Toggle Controlled Area</button>
 * <div id="target-hidden" data-animate="fade">Controlled Target</div>
 */
function toggleControlTarget(selector: string, show: boolean, callback: () => void): void {
  const target = document.querySelector<HTMLElement>(selector)

  if (!target) {
    return
  }

  const animationName = target.getAttribute('data-animate')
  const toggleHide = () => {
    if (target.hasAttribute('aria-hidden')) {
      target.setAttribute('aria-hidden', show ? 'false' : 'true')
    } else if (show) {
      target.removeAttribute('hidden')
    } else {
      target.setAttribute('hidden', '')
    }

    callback()
  }

  if (show) {
    // set tabindex=0 for all elements with tabindex=-1 that are not inside an aria-hidden element
    target
      .querySelectorAll<HTMLElement>(
        ':scope > [tabindex="-1"], [tabindex="-1"]:not([aria-hidden="true"] [tabindex="-1"], [hidden] [tabindex="-1"])',
      )
      .forEach(el => {
        el.setAttribute('tabindex', '0')
      })
  } else {
    // set tabindex=-1 for all elements with tabindex=0
    target.querySelectorAll<HTMLElement>('[tabindex="0"]').forEach(el => {
      el.setAttribute('tabindex', '-1')
    })
  }

  toggleInert(target, show)

  if (animationName) {
    if (show) {
      toggleHide()
      animate(target, animationName, show)
    } else {
      animate(target, animationName, show, toggleHide)
    }
  } else {
    toggleHide()
  }
}

/**
 * Initialize expandable/collapsable elements by using the [aria-expanded](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded) attribute.
 *
 * When an element with the `aria-expanded` attribute is clicked, the value of the attribute will be toggled between `true` and `false`.
 *
 * @location functions.expand Expand
 * @example
 * <style>
 * button::after {
 *   content: ' ' attr(aria-expanded);
 * }
 * </style>
 * <button aria-expanded="false">Expanded:</button>
 * @code
 * <button aria-expanded="false">Expanded:</button>
 */
export function initExpand(): void {
  document.querySelectorAll<HTMLElement>('[aria-expanded]').forEach(expander => {
    const controlTarget = expander.getAttribute('aria-controls')
    const toggle = (e: MouseEvent) => {
      const expanded = expander.getAttribute('aria-expanded') === 'true'
      const toggleExpanded = () => {
        expander.setAttribute('aria-expanded', expanded ? 'false' : 'true') // when expanded we need to set false
      }

      // if data-hide-same-level is set, we need to klick all other expanded elements to close them
      if (expander.parentElement && expander.hasAttribute('data-hide-same-level')) {
        Array.from(expander.parentElement.querySelectorAll(':scope > [aria-expanded="true"]'))
          .filter(el => el !== expander && el !== e.relatedTarget)
          .forEach(sibling => {
            sibling.dispatchEvent(
              new MouseEvent('click', { bubbles: true, relatedTarget: expander }),
            )
          })
      }

      if (controlTarget) {
        toggleControlTarget(`#${controlTarget}`, !expanded, toggleExpanded)
      } else {
        toggleExpanded()
      }
    }

    expander.addEventListener('click', toggle)

    if (controlTarget) {
      // select all controls inside the controlled area that have the same aria-controls attribute
      document
        .querySelectorAll<HTMLElement>(`#${controlTarget} [aria-controls="${controlTarget}"]`)
        .forEach(control => {
          control.addEventListener('click', toggle)
        })
    }
  })
}
