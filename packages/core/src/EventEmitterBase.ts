import type {
  EventArgs,
  EventEmitter,
  EventListener,
  EventMap,
} from './EventEmitter.types'

export abstract class EventEmitterBase<M extends EventMap<M>> implements EventEmitter<M> {
  // Use a simpler map type with type assertions in methods for proper variance handling
  protected listeners: Map<keyof M, ((...args: unknown[]) => void)[]> = new Map()

  public on<K extends keyof M>(eventName: K, listener: EventListener<M, K>): this {
    const listeners = this.listeners.get(eventName) ?? []

    listeners.push(listener as (...args: unknown[]) => void)
    this.listeners.set(eventName, listeners)

    return this
  }

  public off<K extends keyof M>(eventName: K, listener: EventListener<M, K>): this {
    const listeners = this.listeners.get(eventName) ?? []
    const index = listeners.indexOf(listener as (...args: unknown[]) => void)

    if (index >= 0) {
      listeners.splice(index, 1)
    }

    return this
  }

  protected emit<K extends keyof M>(eventName: K, ...args: EventArgs<M, K>): void {
    const listeners = this.listeners.get(eventName) ?? []

    listeners.forEach(listener => listener(...args))
  }
}
