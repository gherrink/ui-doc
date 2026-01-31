import type { BlockCode, BlockColor, BlockExample, BlockIcon, BlockSpace, BlockVariation } from './Block.types'

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
  showcase?: ContextShowcase
  variationdemo?: ContextVariationdemo
}

export interface ContextExample extends BlockExample {
  id: string
  type: 'html'
  src: string
  file: string
}

export interface ContextVariation extends BlockVariation {
  id: string
}

export interface ContextShowcaseItem {
  variation: ContextVariation
  src: string
  file: string
}

export interface ContextShowcase {
  sourceKey: string
  sourceExample: BlockExample
  items: ContextShowcaseItem[]
}

export interface ContextVariationdemoItem {
  componentKey: string
  componentTitle: string
  src: string
  file: string
}

export interface ContextVariationdemo {
  variationKey: string
  variation: ContextVariation
  items: ContextVariationdemoItem[]
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

export interface ContextShowcaseExample extends ContextExample {
  variationKey: string
  variationName: string
}

export interface Context {
  entries: Record<string, ContextEntry>
  exampleAssets: Asset[]
  examples: Record<string, ContextExample>
  menu: MenuItem[]
  pageAssets: Asset[]
  pages: Record<string, ContextEntry>
  showcases: Record<string, ContextShowcaseExample>
  variations: Record<string, ContextVariation>
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
