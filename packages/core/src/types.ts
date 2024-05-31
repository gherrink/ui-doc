import { Spec as CommentSpec } from 'comment-parser'

export type Options = {
  renderer: RendererInterface
  blockParser?: BlockParserInterface
}

export type fileFinderOnFound = (file: string) => Promise<void>

export interface FileFinder {
  search(onFound: fileFinderOnFound): Promise<void>
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
export type Source = {blocks: Block[]}

export type ContextEntry = {
  [key: string]: any
  id: string
  title: string
  order: number
  sections: ContextEntry[]
}

export type MenuItem = {
  text: string
  href: string
  active: boolean
}

export type Context = {
  pages: ContextEntry[]
  entries: {[key: string]: ContextEntry}
  menu: MenuItem[]
}

export type BlockEntry = {
  [key: string]: any
}

export type BlockCode = BlockEntry & {
  content: string,
  title: string,
  type: string,
}

export type BlockExample = BlockCode & {
  modifier?: string,
  code?: string,
}

export type Block = {
  [key: string]: any,
  key: string,
  order: number,
  location?: string,
  page?: string,
  section?: string,
  title?: string,
  description?: string,
  code?: BlockCode,
  example?: BlockExample,
}

export interface BlockParserInterface {
  registerTagTransformer(transformer: TagTransformer): BlockParserInterface
  parse(content: string): Block[]
}

export interface DescriptionParserInterface {
  parse(description: string): string
}

export type TagTransformFunction = (block: Partial<Block>, spec: CommentSpec) => Partial<Block>

export type TagTransformer = {
  name: string,
  transform: TagTransformFunction
}

export type OutputContext = {
  title: string,
  page: ContextEntry,
  menu: MenuItem[],
}

export interface RendererInterface {
  generate(context: OutputContext, layout?: string): string
}
