import { HtmlRendererTag } from '../types'
import { readNestedValue } from './utils'

export const tag: HtmlRendererTag = {
  regex: /{{if:([a-zA-Z0-9-_.]*)}}/gm,
  render: ({
    content, match, context,
  }) => {
    const varKey = match[1]

    const ifMatch = new RegExp(
      `{{if:${varKey}}}\\n*(.+?)[ ]*{{endif:${varKey}}}`,
      'gs',
    ).exec(content)

    if (ifMatch === null) {
      return content
    }

    const value = readNestedValue(varKey, context)

    return content.replace(ifMatch[0], value ? ifMatch[1] : '')
  },
}

export default tag
