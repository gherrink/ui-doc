export interface ContextEntry {
  [key: string]: any
  id: string
  title: string
  order: number
  sections: ContextEntry[]
}

export interface MenuItem {
  text: string
  href: string
  active: boolean
}

export type AssetType = 'style' | 'script'
export interface Asset {
  type: AssetType
  src: string
  attrs?: Record<string, string>
}

export interface Context {
  assets: Asset[]
  entries: Record<string, ContextEntry>
  exampleAssets: Asset[]
  menu: MenuItem[]
  pages: ContextEntry[]
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
