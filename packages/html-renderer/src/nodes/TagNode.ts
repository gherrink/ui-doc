import { Node } from './Node'

export type TagNodeType =
  | 'tag'
  | 'tag-debug'
  | 'tag-var'
  | 'tag-for'
  | 'tag-if'
  | 'tag-page'
  | 'tag-partial'

export abstract class TagNode<T extends TagNodeType = TagNodeType> extends Node<T> {}
