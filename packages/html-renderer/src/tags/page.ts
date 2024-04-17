import { HtmlRendererTag } from '../types'
import { readNestedValue } from './utils'

export const tag: HtmlRendererTag = {
  regex: /{{page(:([a-zA-Z0-9-_.]+?))?}}/gm,
  render: ({
    content, match, context, renderer,
  }) => {
    const name = match[2]
      ? (readNestedValue(match[2], context) || match[2])
      : 'default'

    return content.replace(
      match[0],
      renderer.page(name, context.page || {}),
    )
  },
}

export default tag
