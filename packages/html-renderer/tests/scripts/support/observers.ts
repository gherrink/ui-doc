import { vi } from 'vitest'

/**
 * jsdom implements neither IntersectionObserver nor ResizeObserver, and it never
 * lays out a document, so even an implementation that existed could not decide
 * when an element intersects. The scripts under test only care that they observe
 * the right nodes and react to the callback, so these fakes record what was
 * observed and hand the callback back to the test to fire on demand.
 */

interface FakeObserver {
  /** Elements passed to observe(), in call order. */
  observed: Element[]
  /** Elements passed to unobserve(), in call order. */
  unobserved: Element[]
  /** Whether disconnect() has been called. */
  disconnected: boolean
}

export interface FakeIntersectionObserver extends FakeObserver {
  options: IntersectionObserverInit | undefined
  /** Invoke the observer callback with the given entries. */
  trigger: (entries: IntersectionObserverEntry[]) => void
}

export interface FakeResizeObserver extends FakeObserver {
  /** Invoke the observer callback with the given entries. */
  trigger: (entries?: ResizeObserverEntry[]) => void
}

export interface FakeMutationObserver extends FakeObserver {
  options: MutationObserverInit | undefined
  /** Invoke the observer callback with the given records. */
  trigger: (records?: MutationRecord[]) => void
}

/**
 * Build the shape of an IntersectionObserverEntry that the scripts actually read.
 * @param target the observed element
 * @param isIntersecting whether the entry should report an intersection
 * @returns an entry usable as an IntersectionObserverEntry
 */
export function intersectionEntry(
  target: Element,
  isIntersecting: boolean,
): IntersectionObserverEntry {
  return {
    boundingClientRect: target.getBoundingClientRect(),
    intersectionRatio: isIntersecting ? 1 : 0,
    intersectionRect: target.getBoundingClientRect(),
    isIntersecting,
    rootBounds: null,
    target,
    time: 0,
  }
}

/**
 * Replace globalThis.IntersectionObserver with a recording fake.
 * @returns the list of instances created, in construction order
 */
export function stubIntersectionObserver(): FakeIntersectionObserver[] {
  const instances: FakeIntersectionObserver[] = []

  class Fake implements IntersectionObserver, FakeIntersectionObserver {
    public readonly root: Element | Document | null
    public readonly rootMargin: string
    public readonly scrollMargin: string = '0px'
    public readonly thresholds: readonly number[]
    public readonly options: IntersectionObserverInit | undefined
    public readonly observed: Element[] = []
    public readonly unobserved: Element[] = []
    public disconnected = false

    public constructor(
      private readonly callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      this.options = options
      this.root = options?.root ?? null
      this.rootMargin = options?.rootMargin ?? '0px'
      this.thresholds = typeof options?.threshold === 'number' ? [options.threshold] : [0]
      instances.push(this)
    }

    public observe(target: Element): void {
      this.observed.push(target)
    }

    public unobserve(target: Element): void {
      this.unobserved.push(target)
    }

    public disconnect(): void {
      this.disconnected = true
    }

    public takeRecords(): IntersectionObserverEntry[] {
      return []
    }

    public trigger(entries: IntersectionObserverEntry[]): void {
      this.callback(entries, this)
    }
  }

  vi.stubGlobal('IntersectionObserver', Fake)

  return instances
}

/**
 * Replace globalThis.ResizeObserver with a recording fake.
 * @returns the list of instances created, in construction order
 */
export function stubResizeObserver(): FakeResizeObserver[] {
  const instances: FakeResizeObserver[] = []

  class Fake implements ResizeObserver, FakeResizeObserver {
    public readonly observed: Element[] = []
    public readonly unobserved: Element[] = []
    public disconnected = false

    public constructor(private readonly callback: ResizeObserverCallback) {
      instances.push(this)
    }

    public observe(target: Element): void {
      this.observed.push(target)
    }

    public unobserve(target: Element): void {
      this.unobserved.push(target)
    }

    public disconnect(): void {
      this.disconnected = true
    }

    public trigger(entries: ResizeObserverEntry[] = []): void {
      this.callback(entries, this)
    }
  }

  vi.stubGlobal('ResizeObserver', Fake)

  return instances
}

/**
 * Replace globalThis.MutationObserver with a recording fake. jsdom ships a real
 * one, but it delivers asynchronously on a microtask, which makes assertions
 * about "did the height change" racy.
 * @returns the list of instances created, in construction order
 */
export function stubMutationObserver(): FakeMutationObserver[] {
  const instances: FakeMutationObserver[] = []

  class Fake implements MutationObserver, FakeMutationObserver {
    public options: MutationObserverInit | undefined
    public readonly observed: Element[] = []
    public readonly unobserved: Element[] = []
    public disconnected = false

    public constructor(private readonly callback: MutationCallback) {
      instances.push(this)
    }

    public observe(target: Node, options?: MutationObserverInit): void {
      this.observed.push(target as Element)
      this.options = options
    }

    public disconnect(): void {
      this.disconnected = true
    }

    public takeRecords(): MutationRecord[] {
      return []
    }

    public trigger(records: MutationRecord[] = []): void {
      this.callback(records, this)
    }
  }

  vi.stubGlobal('MutationObserver', Fake)

  return instances
}
