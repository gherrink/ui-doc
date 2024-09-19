import type { BlockParser } from './block-parser'
import type { Block } from './blocks'
import type { Context, ContextEntry, ContextExample } from './context'
import type { Renderer } from './renderer'

export interface Options {
  blockParser?: BlockParser
  generate?: Partial<GenerateFunctions>
  renderer: Renderer
  texts?: Partial<Texts>
}
export interface GenerateFunctions {
  exampleTitle: (example: ContextExample) => string
  footerText: () => string
  homeLink: () => string
  logo: () => string
  menu: (menu: Context['menu'], pages: Context['pages']) => Context['menu']
  name: () => string
  pageLink: (page: ContextEntry) => string
  pageTitle: (page: ContextEntry) => string
  resolve: (uri: string, type: string) => string
}

export interface Texts {
  copyright: string
  title: string
}

export interface Source {
  blocks: Block[]
}

export type OutputCallback = (file: string, content: string) => Promise<void> | void
