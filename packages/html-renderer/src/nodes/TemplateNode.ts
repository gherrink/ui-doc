import { Node } from './Node'

export class TemplateNode extends Node<'template'> {
  public readonly content: string

  public constructor(content: string) {
    super('template')
    this.content = content
  }

  public render(): string {
    return this.content
  }
}
