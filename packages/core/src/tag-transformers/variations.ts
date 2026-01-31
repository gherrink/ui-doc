import type { TagTransformer } from './tag-transformer.types'

/**
 * Parse variation patterns from the tag value.
 * Supports: "bg", "bg.light", "bg, theme.primary", "*", "*, -bg.dark", "bg, -bg.dark"
 *
 * @param value The raw tag value (e.g., "bg, theme, -bg.dark")
 * @returns Object with include patterns and exclude patterns
 */
export function parseVariationPatterns(value: string): { include: string[], exclude: string[] } {
  if (!value || value.trim() === '') {
    // Empty value means all variations
    return { include: ['*'], exclude: [] }
  }

  const include: string[] = []
  const exclude: string[] = []

  const parts = value.split(',').map(p => p.trim()).filter(p => p !== '')

  for (const part of parts) {
    if (part.startsWith('-')) {
      exclude.push(part.slice(1).toLowerCase())
    } else {
      include.push(part.toLowerCase())
    }
  }

  // If no include patterns (only excludes), default to all
  if (include.length === 0) {
    include.push('*')
  }

  return { include, exclude }
}

/**
 * Check if a variation key matches a pattern.
 * Supports exact match and group prefix matching.
 *
 * @param pattern The pattern to match against (e.g., "bg" or "bg.light" or "*")
 * @param variationKey The variation key to check (e.g., "bg.light")
 * @returns true if the variation matches the pattern
 */
export function matchesVariationPattern(pattern: string, variationKey: string): boolean {
  // Wildcard matches everything
  if (pattern === '*') {
    return true
  }

  // Exact match
  if (pattern === variationKey) {
    return true
  }

  // Group match: "bg" matches "bg.light", "bg.dark", "bg.subtle.warm"
  if (variationKey.startsWith(`${pattern}.`)) {
    return true
  }

  return false
}

export const tag: TagTransformer = {
  name: 'variations',
  transform: (block, spec) => {
    // Combine name, type and description to get the full value
    // The parser may split "bg, theme" across name and description
    const parts = [spec.name, spec.description].filter(Boolean)
    const value = parts.join(' ')

    const { include, exclude } = parseVariationPatterns(value)

    block.variations = include
    if (exclude.length > 0) {
      block.variationsExclude = exclude
    }

    return block
  },
}

export default tag
