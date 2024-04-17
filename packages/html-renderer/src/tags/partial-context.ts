import { HtmlRendererTag } from '../types'
import { readNestedValue } from './utils'

export const tag: HtmlRendererTag = {
  regex: /{{partial-context:([a-zA-Z0-9-_.]+?)(:([a-zA-Z0-9-_.]+?))?}}/gm,
  render: ({
    content, match, context, renderer,
  }) => {
    const name = match[1].replaceAll('.', '-')
    const contextKey = match[3] || match[1]

    return content.replace(
      match[0],
      renderer.partial(name, readNestedValue(contextKey, context)),
    )
  },
}

export default tag
