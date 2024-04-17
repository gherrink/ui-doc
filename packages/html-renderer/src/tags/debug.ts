import { HtmlRendererTag } from '../types'
import { readNestedValue } from './utils'

export const tag: HtmlRendererTag = {
  regex: /{{debug(:([a-zA-Z0-9-_.]+?))?}}/gm,
  render: ({
    content, match, context,
  }) => {
    const debugKey = match[2]
    const value = debugKey ? readNestedValue(debugKey, context) : context

    return content.replace(match[0], JSON.stringify(value))
  },
}

export default tag
