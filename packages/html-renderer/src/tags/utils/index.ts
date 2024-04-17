export function readNestedValue(name: string, target: any): any {
  const index = name.indexOf('.')

  if (target === undefined || target === null) {
    return undefined
  }

  if (name === '') {
    return target
  }

  if (index <= 0) {
    return target[name]
  }

  const currentName = name.substring(0, index)
  const nextName = name.substring(index + 1)

  if (!target[currentName]) {
    return undefined
  }

  return readNestedValue(nextName, target[currentName])
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
