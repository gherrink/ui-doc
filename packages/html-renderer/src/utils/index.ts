export function readNestedValue(name: string, target: unknown): unknown {
  const index = name.indexOf('.')

  if (target === undefined || target === null) {
    return undefined
  }

  if (name === '') {
    return target
  }

  const obj = target as Record<string, unknown>

  if (index <= 0) {
    return obj[name]
  }

  const currentName = name.substring(0, index)
  const nextName = name.substring(index + 1)

  if (!obj[currentName]) {
    return undefined
  }

  return readNestedValue(nextName, obj[currentName])
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#039;')
}
