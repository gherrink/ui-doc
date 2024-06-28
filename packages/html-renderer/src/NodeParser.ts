import { ParserError, TagNodeError } from './errors'
import { HtmlCurlyBraceLexer } from './HtmlCurlyBraceLexer'
import type { TagNode } from './nodes'
import { CommentNode } from './nodes/CommentNode'
import { Node } from './nodes/Node'
import tagParsers from './nodes/tags'
import { TemplateNode } from './nodes/TemplateNode'
import type { Parser, Reader, TagNodeParse } from './types'

export class NodeParser implements Parser {
  protected tags: Record<string, TagNodeParse> = {}

  public static init(): NodeParser {
    const parser = new NodeParser()

    tagParsers.forEach(tag => parser.registerTagParser(tag))

    // TODO may make async
    // (await import('./nodes/tags')).default.forEach(tag => parser.registerTag(tag))

    return parser
  }

  public registerTagParser(tag: TagNodeParse): this {
    this.tags[tag.identifier] = tag

    return this
  }

  public parse(reader: Reader): Node {
    const lexer = new HtmlCurlyBraceLexer(reader)
    const tree = new Node('root')

    return this.parseChildren(lexer, tree)
  }

  protected parseChildren(lexer: HtmlCurlyBraceLexer, parent: Node): Node {
    let token = lexer.consume()

    while (token) {
      switch (token.type) {
        case 'template':
          parent.append(new TemplateNode(token.content))
          break
        case 'comment':
          parent.append(new CommentNode(token.content))
          break
        case 'tag-open':
          if (lexer.peek()?.type === 'tag-end') {
            return parent
          }
          parent.append(this.parseTag(lexer))
          break
        default:
          throw new ParserError(`Unexpected token type "${token.type}"`)
      }
      token = lexer.consume()
    }

    return parent
  }

  protected parseTag(lexer: HtmlCurlyBraceLexer): TagNode {
    const tagIdentifier = lexer.consume()

    if (!tagIdentifier || tagIdentifier.type !== 'tag-identifier') {
      throw new ParserError('Expected tag identifier')
    }

    const tagDefinition = this.tags[tagIdentifier.name]

    if (!tagDefinition) {
      throw new ParserError(`Unknown tag "${tagIdentifier.name}"`)
    }

    const { addToken, create } = tagDefinition.parse()
    let nextToken = lexer.consume()
    let node: TagNode

    try {
      while (nextToken && nextToken.type !== 'tag-close') {
        addToken(nextToken)
        nextToken = lexer.consume()
      }
      node = create()
    } catch (error) {
      if (error instanceof TagNodeError) {
        throw new ParserError(
          `Error parsing tag ${tagIdentifier.name} - ${error.message}\nShould be something like: ${tagDefinition.example}`,
        )
      }

      throw error
    }

    if (!tagDefinition.hasContent) {
      return node
    }

    this.parseChildren(lexer, node)
    const closeTokens = lexer.consume(3)

    if (
      !closeTokens ||
      closeTokens[0]?.type !== 'tag-end' ||
      closeTokens[1]?.type !== 'tag-identifier' ||
      closeTokens[1].name !== tagIdentifier.name ||
      closeTokens[2]?.type !== 'tag-close'
    ) {
      throw new ParserError('Expected closing tag')
    }

    return node
  }
}
