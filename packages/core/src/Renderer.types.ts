import type { GenerateContext, GenerateExampleContext } from './Context.types'

export interface Renderer {
  generate: (context: GenerateContext | GenerateExampleContext, layout?: string) => string
}
