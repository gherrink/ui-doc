import { Spec as CommentSpec } from 'comment-parser'

export type Options = {
  renderer: RendererInterface
  blockParser?: BlockParserInterface
}

export interface FileReader {
  content(file: string): Promise<string>
}

export interface FileWriter {
  write(file: string, content: string): Promise<boolean>
}

export type fileFinderOnFound = (file: string) => Promise<void>

export interface FileFinder {
  search(onFound: fileFinderOnFound): Promise<void>
  matches(file: string): boolean
}

export type sourceScannerOnFound = (file: string, content: string) => Promise<void>

export interface SourceScanner {
  scan(onFound: sourceScannerOnFound): Promise<void>
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

export type Context = {
  pages: ContextEntry[]
  entries: {[key: string]: ContextEntry}
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
}

export interface RendererInterface {
  generate(context: OutputContext, layout?: string): string
}
