export interface Color {
  hex: string
  rgb: string
  value: { r: number; g: number; b: number }
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

export type BlockColor = BlockEntry & {
  font?: Color
  name: string
  text: string
  value: Color
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
  colors?: BlockColor[]
  example?: BlockExample
}
