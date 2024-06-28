import type { GenerateContext } from './context'

export interface Renderer {
  generate(context: GenerateContext, layout?: string): string
}
