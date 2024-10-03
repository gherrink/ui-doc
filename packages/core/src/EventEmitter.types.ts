type EventMap<M> = Record<keyof M, any[]>
export type EventListener<M extends EventMap<M>, K extends keyof M> = K extends keyof M
  ? M[K] extends never
    ? () => void
    : M[K] extends unknown[]
      ? (...args: M[K]) => void
      : never
  : never
export type EventArgs<M extends EventMap<M>, K extends keyof M> = K extends keyof M
  ? M[K] extends never
    ? never[]
    : M[K] extends unknown[]
      ? M[K]
      : never
  : never

export type EventListenersMap<M extends EventMap<M>, K extends keyof M = keyof M> = Map<
  K,
  Function[]
>

export interface EventEmitter<M extends EventMap<M>> {
  on<K extends keyof M>(eventName: K, listener: EventListener<M, K>): this
  off<K extends keyof M>(eventName: K, listener: EventListener<M, K>): this
  // emit<K extends keyof M>(eventName: K, ...args: EventArgs<M, K>): void
}
