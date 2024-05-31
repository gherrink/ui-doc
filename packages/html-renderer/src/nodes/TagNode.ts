import type { TagNodeInterface, TagNodeType } from '../types'
import { Node } from './Node'

export abstract class TagNode extends Node implements TagNodeInterface {
  public readonly type: TagNodeType = 'tag'
}
