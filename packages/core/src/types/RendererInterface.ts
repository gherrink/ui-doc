import type { OutputContext } from './context'

export interface RendererInterface {
  generate(context: OutputContext, layout?: string): string
}
