import { marked } from 'marked'

import type { DescriptionParser } from './DescriptionParser.types'

export class MarkdownDescriptionParser implements DescriptionParser {
  parse(description: string): string {
    return marked.parse(description, {
      async: false,
    })
  }
}

export function createMarkdownDescriptionParser(): MarkdownDescriptionParser {
  return new MarkdownDescriptionParser()
}
