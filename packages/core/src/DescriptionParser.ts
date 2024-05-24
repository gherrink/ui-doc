import { marked } from 'marked'

import type { DescriptionParserInterface } from './types'

export class DescriptionParser implements DescriptionParserInterface {
  parse(description: string): string {
    return marked.parse(description, {
      async: false,
    }) as string
  }
}
