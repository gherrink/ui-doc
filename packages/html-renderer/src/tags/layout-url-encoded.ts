import { OutputContext } from '@styleguide/core'

import { HtmlRendererTag } from '../types'
import { readNestedValue } from './utils'

export const tag: HtmlRendererTag = {
  regex: /{{layout-url-encoded:([a-zA-Z0-9-_]+?)(:([a-zA-Z0-9-_.]+?))?}}/gm,
  render: ({
    content, match, context, renderer,
  }) => {
    const newContext: OutputContext = match[3] ? (readNestedValue(match[3], context) || {}) : context
    const html = renderer.generate(newContext, match[1] || 'default')

    return content.replace(match[0], encodeURIComponent(html))
  },
}

export default tag
