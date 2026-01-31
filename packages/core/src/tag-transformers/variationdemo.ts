import type { TagTransformer } from './tag-transformer.types'
import { createTagTransformerError } from './utils'

/**
 * Parse component patterns from the tag value.
 * Supports:
 * - Auto-discover mode (no prefix or - prefix): "bg.black", "bg.black, -components.button.white"
 * - Explicit mode (+ prefix): "+components.button.black, +components.input"
 *
 * @param value The raw tag value (e.g., "-components.button, +components.input")
 * @returns Object with include patterns, exclude patterns, and whether explicit mode is active
 */
export function parseComponentPatterns(value: string): {
  include: string[]
  exclude: string[]
  explicitMode: boolean
} {
  if (!value || value.trim() === '') {
    return { include: ['*'], exclude: [], explicitMode: false }
  }

  const include: string[] = []
  const exclude: string[] = []
  let explicitMode = false

  const parts = value.split(',').map(p => p.trim()).filter(p => p !== '')

  for (const part of parts) {
    if (part.startsWith('+')) {
      explicitMode = true
      include.push(part.slice(1).toLowerCase())
    } else if (part.startsWith('-')) {
      exclude.push(part.slice(1).toLowerCase())
    }
  }

  // In explicit mode, only use the + prefixed items
  // In auto-discover mode, include all (wildcard)
  if (!explicitMode) {
    return { include: ['*'], exclude, explicitMode: false }
  }

  return { include, exclude: [], explicitMode: true }
}

export const tag: TagTransformer = {
  name: 'variationdemo',
  transform: (block, spec) => {
    if (!spec.name) {
      throw createTagTransformerError(
        'Missing variation key. Use "@variationdemo bg.black" to specify the variation.',
        spec,
      )
    }

    block.variationdemo = spec.name.toLowerCase()

    // Parse component filters from type and description
    const filterValue = [spec.type, spec.description].filter(Boolean).join(' ')
    const { include, exclude, explicitMode } = parseComponentPatterns(filterValue)

    if (explicitMode) {
      block.variationdemoInclude = include
    } else {
      block.variationdemoInclude = ['*']
      if (exclude.length > 0) {
        block.variationdemoExclude = exclude
      }
    }

    return block
  },
}

export default tag
