import type { DescriptionParser } from './DescriptionParser.types'

import { marked } from 'marked'

export class MarkdownDescriptionParser implements DescriptionParser {
  parse(description: string): string {
    return marked.parse(description, {
      async: false,
    }) as string
  }
}

export function createMarkdownDescriptionParser(): MarkdownDescriptionParser {
  return new MarkdownDescriptionParser()
}
