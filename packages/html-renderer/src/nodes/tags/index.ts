import type { TagNodeParse } from '../../types'
import { parseTagDebugNode } from './debug'
import { parseTagForNode } from './for'
import { parseTagIfNode } from './if'
import { parseTagPageNode } from './page'
import { parseTagPartialNode } from './partial'
import { parseTagVarNode } from './var'

const tagNodes: TagNodeParse[] = [
  parseTagDebugNode,
  parseTagForNode,
  parseTagIfNode,
  parseTagPageNode,
  parseTagPartialNode,
  parseTagVarNode,
]

export default tagNodes
