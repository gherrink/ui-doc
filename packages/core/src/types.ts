import { Spec as CommentSpec } from 'comment-parser'

export type Options = {
  finder: FileFinder
}

export interface FileFinder {
  registerOnNewFile(callback: (file: string) => void): void
  registerOnChangeFile(callback: (file: string) => void): void
  scan(): void
}

export interface FileReader {
  content(file: string): string
}

export type FileFinderOptions = {
  globs: string[]
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

export type BlockCode = {
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

export type TagTransformFunction = (block: Partial<Block>, spec: CommentSpec) => Partial<Block>

export type TagTransformer = {
  name: string,
  transform: TagTransformFunction
}
