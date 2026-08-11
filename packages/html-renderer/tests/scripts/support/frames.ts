import { vi } from 'vitest'

export interface FrameQueue {
  /**
   * Run every callback queued so far. Callbacks queued *by* those callbacks are
   * held back for the next flush, so one flush is one animation frame.
   * @returns the number of callbacks that ran
   */
  flush: () => number
  /** Number of callbacks waiting for the next flush. */
  pending: () => number
}

/**
 * Replace requestAnimationFrame with a manually drained queue. jsdom's own
 * implementation is driven by a timer, which makes frame-ordering assertions
 * depend on wall clock; draining by hand keeps "first frame" and "second frame"
 * exactly one flush apart.
 * @returns the queue controller
 */
export function stubAnimationFrames(): FrameQueue {
  let queue: FrameRequestCallback[] = []
  let handle = 0

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback): number => {
    queue.push(callback)
    handle += 1

    return handle
  })

  return {
    flush: () => {
      const due = queue

      queue = []
      due.forEach(callback => {
        callback(0)
      })

      return due.length
    },
    pending: () => queue.length,
  }
}
