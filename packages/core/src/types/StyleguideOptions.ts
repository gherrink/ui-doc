import type { BlockParserInterface } from './BlockParserInterface'
import type { RendererInterface } from './RendererInterface'

export interface StyleguideOptions {
  renderer: RendererInterface
  blockParser?: BlockParserInterface
}
