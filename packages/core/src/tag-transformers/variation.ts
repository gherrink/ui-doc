import type { BlockVariation } from '../Block.types'
import type { TagTransformer } from './tag-transformer.types'
import { code, createTagTransformerError } from './utils'

export const tag: TagTransformer = {
  name: 'variation',
  transform: (block, spec) => {
    const data = code(spec)

    if (!data) {
      return block
    }

    // spec.name contains the key (e.g., "bg.light")
    // spec.type contains the optional type but we use "name" for variations
    // data.title contains the name/description (parsed from spec.name)
    // data.content contains the wrapper HTML

    if (!spec.name) {
      throw createTagTransformerError(
        'Missing variation key. Use "@variation key-name Display Name"',
        spec,
      )
    }

    // The key is in spec.name (first word after @variation)
    // The display name and wrapper are in data.content (spec.description)
    // Format: "@variation bg.black Display Name\n<wrapper>{{content}}</wrapper>"
    const key = spec.name.toLowerCase()
    const content = data.content

    // Split content into display name (first line) and wrapper (rest)
    // The wrapper must contain {{content}} placeholder
    const contentLines = content.split('\n')
    let name = key
    let wrapper = content

    // Check if first line is just text (display name) and rest is HTML
    if (contentLines.length > 1) {
      const firstLine = contentLines[0].trim()
      const restContent = contentLines.slice(1).join('\n').trim()

      // If rest contains the {{content}} placeholder, first line is the display name
      if (restContent.includes('{{content}}')) {
        name = firstLine || key
        wrapper = restContent
      }
    }

    if (!wrapper.includes('{{content}}')) {
      throw createTagTransformerError(
        'Variation wrapper must include {{content}} placeholder.',
        spec,
      )
    }

    const variation: BlockVariation = {
      key,
      name,
      wrapper,
    }

    block.variation = variation

    return block
  },
}

export default tag
