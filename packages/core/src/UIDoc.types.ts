import type { Block } from './Block.types'
import type { BlockParser } from './BlockParser.types'
import type { Context, ContextEntry, ContextExample } from './Context.types'
import type { Renderer } from './Renderer.types'

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
