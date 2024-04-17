import { HtmlRendererTag } from '../types'
import { readNestedValue } from './utils'

export const tag: HtmlRendererTag = {
  regex: /{{var:([a-zA-Z0-9-_.]+?)}}/gm,
  render: ({
    content, match, context,
  }) => {
    const value = readNestedValue(match[1], context)

    return content.replace(match[0], value || '')
  },
}

export default tag
