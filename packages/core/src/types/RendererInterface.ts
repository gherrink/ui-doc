import type { OutputContext } from './Context'

export interface RendererInterface {
  generate(context: OutputContext, layout?: string): string
}
