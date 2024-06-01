import { Spec as CommentSpec } from 'comment-parser'

export interface Options {
  renderer: RendererInterface
  blockParser?: BlockParserInterface
}

export type FileFinderOnFoundCallback = (file: string) => Promise<void>

export interface FileFinder {
  search(onFound: FileFinderOnFoundCallback): Promise<void>
  matches(file: string): boolean
}

export interface AssetLoader {
  packageExists(packageName: string): Promise<boolean>
  packagePath(packageName: string): Promise<string | undefined>
}

export interface FileSystem {
  createFileFinder(globs: string[]): FileFinder
  assetLoader(): AssetLoader
  fileRead(file: string): Promise<string>
  fileWrite(file: string, content: string): Promise<boolean>
  fileCopy(from: string, to: string): Promise<boolean>
  fileExists(file: string): Promise<boolean>
  fileBasename(file: string): string
}

export type FilePath = string
export interface Source {
  blocks: Block[]
}

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

export type BlockEntry = Record<string, any>

export type BlockCode = BlockEntry & {
  content: string
  title: string
  type: string
}

export type BlockExample = BlockCode & {
  modifier?: string
  code?: string
}

export interface Block {
  [key: string]: any
  key: string
  order: number
  location?: string
  page?: string
  section?: string
  title?: string
  description?: string
  code?: BlockCode
  example?: BlockExample
}

export interface BlockParserInterface {
  registerTagTransformer(transformer: TagTransformer): BlockParserInterface
  parse(content: string): Block[]
}

export interface DescriptionParserInterface {
  parse(description: string): string
}

export type TagTransformFunction = (block: Partial<Block>, spec: CommentSpec) => Partial<Block>

export interface TagTransformer {
  name: string
  transform: TagTransformFunction
}

export interface OutputContext {
  title: string
  logo: string
  name: string
  homeLink: string
  page: ContextEntry
  menu: MenuItem[]
}

export interface RendererInterface {
  generate(context: OutputContext, layout?: string): string
}
