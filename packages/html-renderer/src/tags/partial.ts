import { HtmlRendererTag } from '../types'

export const tag: HtmlRendererTag = {
  regex: /{{partial:([a-zA-Z0-9-_]+?)}}/gm,
  render: ({
    content, match, context, renderer,
  }) => content.replace(
    match[0],
    renderer.partial(match[1], context),
  ),
}

export default tag
