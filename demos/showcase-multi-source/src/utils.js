/**
 * JavaScript utility functions.
 * These are documented alongside CSS components.
 *
 * @page utils Utilities
 * @order 20
 */

/**
 * Formats a date to a human-readable string.
 * Takes a Date object and optional style ('long' or 'short').
 *
 * @location utils.formatDate Format Date
 * @example
 * <pre><code>formatDate(new Date()) // "January 15, 2024"
 * formatDate(new Date(), 'short') // "1/15/24"</code></pre>
 */
export function formatDate(date, style = 'long') {
  if (style === 'short') {
    return date.toLocaleDateString('en-US')
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Debounces a function call.
 * Prevents rapid successive calls by waiting for a quiet period.
 *
 * @location utils.debounce Debounce
 * @example
 * <pre><code>const debouncedSearch = debounce(search, 300)
 * input.addEventListener('input', debouncedSearch)</code></pre>
 */
export function debounce(fn, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * Generates a unique ID with an optional prefix.
 *
 * @location utils.uniqueId Unique ID
 * @example
 * <pre><code>uniqueId() // "id-a1b2c3"
 * uniqueId('user') // "user-x9y8z7"</code></pre>
 */
export function uniqueId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Clamps a number between min and max values.
 *
 * @location utils.clamp Clamp
 * @example
 * <pre><code>clamp(5, 0, 10) // 5
 * clamp(-5, 0, 10) // 0
 * clamp(15, 0, 10) // 10</code></pre>
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
