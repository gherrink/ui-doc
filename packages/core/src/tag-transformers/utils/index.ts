import { Spec } from 'comment-parser'

import { TagTransformerError } from '../../errors'
import type { BlockCode } from '../../types'
import { CSSColor } from '../nodes/CSSColor'
import { CSSVariable } from '../nodes/CSSVariable'

export function createTagTransformerError(message: string, spec: Spec): TagTransformerError {
  const line = spec.source && spec.source.length > 0 ? spec.source[0].number + 1 : 0

  return new TagTransformerError(message, spec.tag, { line })
}

export function identifier(data: Spec): { key: string; name: string } {
  if (!data.name) {
    throw createTagTransformerError(
      `Missing key. You should use "@${data.tag} your-${data.tag}-key"`,
      data,
    )
  }

  const name = data.description || data.name
  const key = data.name.toLowerCase()

  return {
    key,
    name,
  }
}

export function code(data: Spec): BlockCode | undefined {
  if (!data.description) {
    return undefined
  }

  return {
    content: data.description,
    title: data.name,
    type: typeof data.type === 'string' && data.type ? data.type : 'html',
  }
}

/**
 * Check if html is valid by removing all tags and checking if there is any content left
 * @param html to be validated
 * @returns {boolean} true if html is valid
 */
export function isValidHTML(html: string): boolean {
  if (html === '') {
    return false
  }

  const tagRegex = /<([^>]+?)([^>]*?)>(?:(?=([^<]+))\3)*?<\/\1>/gi
  let remaining = html
    // remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // remove new lines
    .replace(/\n/g, '')
    // remove self closing tags - https://developer.mozilla.org/en-US/docs/Glossary/Void_element
    .replace(
      /<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*?)\/?>/gi,
      '',
    )

  // remove tags starting with inner tags and ending with outer tags
  while (tagRegex.test(remaining)) {
    remaining = remaining.replace(tagRegex, '')
  }

  // remove left over whitespace
  return remaining.trim() === ''
}

/**
 * Trim a description by removing leading `-` or `|`
 * @param {string} text
 * @returns string
 */
export function trimDescription(text: string): string {
  return text.replace(/^-|^\|/, '').trim()
}

export function cssColorValue(value: string): CSSColor | CSSVariable {
  return CSSVariable.isVariableString(value)
    ? CSSVariable.fromString(value)
    : CSSColor.fromString(value)
}
