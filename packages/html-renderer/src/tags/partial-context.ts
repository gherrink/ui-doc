import { HtmlRendererTag } from '../types'
import { readNestedValue } from './utils'

export const tag: HtmlRendererTag = {
  regex: /{{partial-context:([a-zA-Z0-9-_.]+?)(:([a-zA-Z0-9-_.]+?))?}}/gm,
  render: ({
    content, match, context, renderer,
  }) => {
    const name = match[1].replaceAll('.', '-')
    const contextKey = match[3] || match[1]
    const newContext = readNestedValue(contextKey, context)

    Object.assign(typeof newContext === 'object' ? newContext : {}, { _parent: context })

    return content.replace(
      match[0],
      renderer.partial(name, newContext),
    )
  },
}

export default tag
