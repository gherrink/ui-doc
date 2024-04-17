import { HtmlRendererTag } from '../types'
import { escapeHtml, readNestedValue } from './utils'

export const tag: HtmlRendererTag = {
  regex: /{{var-escaped:([a-zA-Z0-9-_.]+?)}}/gm,
  render: ({
    content, match, context,
  }) => {
    const value = readNestedValue(match[1], context)

    return content.replace(match[0], escapeHtml(value || ''))
  },
}

export default tag
