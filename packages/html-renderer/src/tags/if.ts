import { HtmlRendererTag } from '../types'
import { readNestedValue } from './utils'

export const tag: HtmlRendererTag = {
  regex: /{{if:([a-zA-Z0-9-_.]*)((==|!=)("\w*"|\d*))?}}/gm,
  render: ({
    content, match, context,
  }) => {
    const contextKey = match[1]
    const ifMatch = new RegExp(
      `{{if:${contextKey}${match[2] || ''}}}[\\n]*(.+?)(\\n[ ]*)?{{endif:${contextKey}}}`,
      'gs',
    ).exec(content)

    if (ifMatch === null) {
      throw new Error(`Invalid if statement in ${content}`)
    }

    let value = readNestedValue(contextKey, context)
    let compareValue

    if (match[4]) {
      compareValue = match[4].startsWith('"')
        ? match[4].replace(/"/g, '')
        : parseInt(match[4], 10)
    }

    switch (match[3]) {
      case '==':
        value = value === compareValue
        break
      case '!=':
        value = value !== compareValue
        break
      default: break
    }

    return content.replace(ifMatch[0], value ? ifMatch[1] : '')
  },
}

export default tag
