import type { BlockCode, BlockColor, BlockExample, BlockIcon, BlockSpace } from './Block.types'

export interface ContextEntry {
  id: string
  title: string
  order: number
  sections: ContextEntry[]
  titleLevel?: number
  description?: string
  layout?: string
  code?: BlockCode
  example?: BlockExample
  colors?: BlockColor[]
  spaces?: BlockSpace[]
  icons?: BlockIcon[]
  hideCode?: boolean
}

export interface ContextExample extends BlockExample {
  id: string
  type: 'html'
  src: string
  file: string
}

export interface MenuItem {
  active: boolean
  href: string
  order: number
  text: string
}

export type AssetType = 'style' | 'script'
export interface Asset {
  type: AssetType
  src: string
  attrs?: Record<string, string>
}

export interface Context {
  entries: Record<string, ContextEntry>
  exampleAssets: Asset[]
  examples: Record<string, ContextExample>
  menu: MenuItem[]
  pageAssets: Asset[]
  pages: Record<string, ContextEntry>
}

export interface GenerateContext {
  [key: string]: unknown
  assets: Asset[]
  title: string
  name: string
  menu: MenuItem[]
  footerText?: string
  logo?: string
  homeLink?: string
  page?: ContextEntry
}

export interface GenerateExampleContext extends ContextExample {
  [key: string]: unknown
  title: string
  assets: Asset[]
}
