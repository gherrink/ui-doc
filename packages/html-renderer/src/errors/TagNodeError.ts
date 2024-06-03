export class TagNodeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TagNodeSyntaxError'
  }
}
