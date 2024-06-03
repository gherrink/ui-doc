import type { BlockParserInterface } from './BlockParser'
import type { RendererInterface } from './RendererInterface'

export interface StyleguideOptions {
  renderer: RendererInterface
  blockParser?: BlockParserInterface
}
