import type { BlockExample } from './Block'

export interface ContextEntry {
  [key: string]: any
  id: string
  title: string
  order: number
  sections: ContextEntry[]
}

export interface ContextExample extends BlockExample {
  id: string
  type: 'html'
  src: string
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

export interface OutputContext {
  assets: Asset[]
  title: string
  footerText: string
  logo: string
  name: string
  homeLink: string
  page: ContextEntry
  menu: MenuItem[]
}
