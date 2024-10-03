import type { GenerateContext } from './Context.types'

export interface Renderer {
  generate(context: GenerateContext, layout?: string): string
}
