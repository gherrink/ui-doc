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

export interface Context {
  pages: ContextEntry[]
  entries: Record<string, ContextEntry>
  menu: MenuItem[]
}

export interface OutputContext {
  title: string
  footerText: string
  logo: string
  name: string
  homeLink: string
  page: ContextEntry
  menu: MenuItem[]
}
