import { HtmlRendererTag } from '../types'
import { readNestedValue } from './utils'

export const tag: HtmlRendererTag = {
  regex: /{{for(:([a-zA-Z0-9-_.]*))?}}/gm,
  render: ({
    content, match, context, renderer,
  }) => {
    const varKey = match[2] || 'this'
    const varContext = varKey === 'this' ? context : readNestedValue(varKey, context)

    if (!varKey || !(Array.isArray(varContext) || typeof varContext === 'object')) {
      return ''
    }

    const forMatchDefinition = match[2] ? `:${match[2]}` : ''
    const forMatch = new RegExp(
      `{{for${forMatchDefinition}}}\\n*(.+?)(\n[ ]*)?{{endfor${forMatchDefinition}}}`,
      'gs',
    ).exec(content)

    if (forMatch === null) {
      return ''
    }

    const replaceFunction = Array.isArray(varContext)
      ? () => varContext
        .map((item, index) => {
          const currentValue = typeof item === 'object'
            ? { ...item }
            : {}

          return renderer.render(forMatch[1], {
            ...currentValue,
            _parent: context,
            _varKey: varKey,
            _loop: { index, value: item },
          })
        })
        .join('')
      : () => Object.keys(varContext)
        .map((key, index) => {
          const currentValue = typeof varContext[key] === 'object'
            ? { ...varContext[key] }
            : {}

          return renderer.render(forMatch[1], {
            ...currentValue,
            _parent: context,
            _varKey: varKey,
            _loop: { key, index, value: varContext[key] },
          })
        })
        .join('')

    return content.replace(forMatch[0], replaceFunction())
  },
}

export default tag
