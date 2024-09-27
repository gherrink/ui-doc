/**
 * Query the first parent element that matches the selector
 *
 * @param element to search in
 * @param selector to be matched
 * @param maxDepth maximum depth to search
 * @returns element that matches the selector
 */

export function queryParentSelector<K extends keyof HTMLElementTagNameMap>(
  element: HTMLElement | null,
  selector: K,
  maxDepth?: number,
): HTMLElementTagNameMap[K] | null
export function queryParentSelector<K extends keyof SVGElementTagNameMap>(
  element: HTMLElement | null,
  selector: K,
  maxDepth?: number,
): SVGElementTagNameMap[K] | null
export function queryParentSelector<K extends keyof MathMLElementTagNameMap>(
  element: HTMLElement | null,
  selectors: K,
  maxDepth?: number,
): MathMLElementTagNameMap[K] | null
export function queryParentSelector<E extends Element = Element>(
  element: HTMLElement | null,
  selector: string,
  maxDepth?: number,
): E | null
export function queryParentSelector(
  element: HTMLElement | null,
  selector: string,
  maxDepth = 10,
): Element | null {
  if (maxDepth <= 0 || element === null) {
    return null
  }

  if (element.matches(selector)) {
    return element as Element
  }

  return element.parentElement
    ? queryParentSelector(element.parentElement, selector, maxDepth - 1)
    : null
}
