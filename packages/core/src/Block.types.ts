import type { CSSValue } from './tag-transformers/nodes'
import type { CSSColor } from './tag-transformers/nodes/CSSColor'
import type { CSSVariable } from './tag-transformers/nodes/CSSVariable'

export type BlockEntry = object

export type BlockCode = BlockEntry & {
  content: string
  title: string
  type: string
}

export type BlockExample = BlockCode & {
  modifier?: string
  code?: string
  id?: string
  file?: string
  src?: string
}

export type BlockColor = BlockEntry & {
  font?: CSSColor | CSSVariable
  name: string
  text: string
  value: CSSColor | CSSVariable
}

export type BlockSpace = BlockEntry & {
  name: string
  text: string
  value: CSSValue | CSSVariable
}

export type BlockIcon = BlockEntry & {
  name: string
  text: string
  value: CSSValue | CSSVariable
}

export interface Block {
  [key: string]: unknown
  key: string
  order: number
  location?: string
  page?: string
  section?: string
  title?: string
  description?: string
  code?: BlockCode
  colors?: BlockColor[]
  example?: BlockExample
  spaces?: BlockSpace[]
  icons?: BlockIcon[]
  hideCode?: boolean
}
