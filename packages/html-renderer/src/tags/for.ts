import { HTMLRendererError } from '../errors'
import { HtmlRendererTag } from '../types'
import { readNestedValue } from './utils'

export const tag: HtmlRendererTag = {
  regex: /{{for(:([a-zA-Z0-9-_.]*))?}}/gm,
  render: ({
    content, match, context, renderer,
  }) => {
    const contextKey = match[2] || 'this'
    const contextNew = contextKey === 'this' ? context : readNestedValue(contextKey, context)
    const forMatchDefinition = match[2] ? `:${match[2]}` : ''
    const forMatch = new RegExp(
      `{{for${forMatchDefinition}}}\\n*(.+?)(\n[ ]*)?{{endfor${forMatchDefinition}}}`,
      'gs',
    ).exec(content)

    if (forMatch === null) {
      throw new HTMLRendererError(`Invalid for loop in ${content}`)
    }

    const replacement = () => {
      if (Array.isArray(contextNew)) {
        return contextNew
          .map((item, index) => {
            const currentValue = typeof item === 'object'
              ? { ...item }
              : {}

            return renderer.render(forMatch[1], {
              ...currentValue,
              _parent: context,
              _contextKey: contextKey,
              _loop: { index, value: item },
            })
          })
          .join('')
      }

      if (typeof contextNew === 'object') {
        return Object.keys(contextNew)
          .map((key, index) => {
            const currentValue = typeof contextNew[key] === 'object'
              ? { ...contextNew[key] }
              : {}

            return renderer.render(forMatch[1], {
              ...currentValue,
              _parent: context,
              _contextKey: contextKey,
              _loop: { key, index, value: contextNew[key] },
            })
          })
          .join('')
      }

      return ''
    }

    return content.replace(forMatch[0], replacement())
  },
}

export default tag
