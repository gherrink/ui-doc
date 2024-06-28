import type {
  Lexer,
  PositiveInteger,
  Reader,
  Token,
  TokenBoolean,
  TokenComment,
  TokenIdentifier,
  TokenNumber,
  TokenOperator,
  TokenReturn,
  TokenString,
  TokenTemplate,
  TokenTypeIdentifier,
} from './types'

const IDENTIFIER_CHARS: Record<TokenTypeIdentifier, string> = {
  identifier: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-.',
  'tag-identifier': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
}

export class HtmlCurlyBraceLexer implements Lexer {
  protected reader: Reader

  protected currentTokens: (Token | undefined)[] = []

  protected tagConsuming = false

  protected tagIdentified = false

  public constructor(reader: Reader) {
    this.reader = reader
  }

  public debug(): ReturnType<Reader['debug']> {
    return this.reader.debug()
  }

  public peek<T extends PositiveInteger = 1>(k: T = 1 as T): TokenReturn<T> {
    this.consumeNextTokens(k)

    return k === 1
      ? (this.currentTokens.slice(0, k)[0] as TokenReturn<T>)
      : (this.currentTokens.slice(0, k) as TokenReturn<T>)
  }

  public consume<T extends PositiveInteger = 1>(k: T = 1 as T): TokenReturn<T> {
    this.consumeNextTokens(k)

    return k === 1
      ? (this.currentTokens.splice(0, k)[0] as TokenReturn<T>)
      : (this.currentTokens.splice(0, k) as TokenReturn<T>)
  }

  protected consumeNextTokens(k: PositiveInteger = 1) {
    while (this.currentTokens.length < k) {
      this.currentTokens.push(this.consumeNextToken())
    }
  }

  protected consumeNextToken(): Token | undefined {
    if (this.reader.isEof()) {
      return undefined
    }

    if (this.tagConsuming) {
      return this.progressTag()
    }

    const char = this.reader.peak()

    if (char === '{' && this.reader.peak(2) === '{{') {
      return this.consumeTagOpen()
    }

    if (char === '<' && this.reader.peak(4) === '<!--') {
      return this.consumeComment()
    }

    return this.consumeTemplate()
  }

  protected consumeTagOpen(): Token {
    this.reader.consume(2)

    this.tagConsuming = true
    this.tagIdentified = false

    return {
      type: 'tag-open',
    }
  }

  protected consumeTagClose(): Token {
    this.reader.consume(2)

    this.tagConsuming = false
    this.tagIdentified = false

    return {
      type: 'tag-close',
    }
  }

  protected consumeTagSeparator(): Token {
    this.reader.consume()

    return {
      type: 'tag-separator',
    }
  }

  protected consumeComment(): TokenComment {
    this.reader.consume(4)
    let content = ''

    while (!this.reader.isEof()) {
      if (this.reader.peak(3) === '-->') {
        this.reader.consume(3)
        break
      }

      content += this.reader.consume()
    }

    return {
      content: content.trim(),
      type: 'comment',
    }
  }

  protected consumeTemplate(): TokenTemplate {
    let content = ''

    while (!this.reader.isEof()) {
      const peek = this.reader.peak()

      if (peek === '{' && this.reader.peak(2) === '{{') {
        break
      }

      if (peek === '<' && this.reader.peak(4) === '<!--') {
        break
      }

      content += this.reader.consume()
    }

    return {
      content,
      type: 'template',
    }
  }

  protected progressTag(): Token | undefined {
    const char = this.reader.peak()

    if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
      this.reader.consume()

      return this.progressTag()
    }

    if (char === '}' && this.reader.peak(2) === '}}') {
      return this.consumeTagClose()
    }

    if (char === '/') {
      return this.consumeTagEnd()
    }

    if (!this.tagIdentified) {
      this.tagIdentified = true

      return this.consumeIdentifier('tag-identifier')
    }

    if (char === ':') {
      return this.consumeTagSeparator()
    }

    if (char === '"' || char === "'") {
      return this.consumeString()
    }

    if (
      char === '1' ||
      char === '2' ||
      char === '3' ||
      char === '4' ||
      char === '5' ||
      char === '6' ||
      char === '7' ||
      char === '8' ||
      char === '9' ||
      char === '0'
    ) {
      return this.consumeNumber()
    }

    if (char === 't' && this.reader.peak(4) === 'true') {
      return this.consumeBoolean(true)
    }

    if (char === 'f' && this.reader.peak(5) === 'false') {
      return this.consumeBoolean(false)
    }

    if (char === '=' || char === '!' || char === '<' || char === '>') {
      return this.consumeOperator()
    }

    return this.consumeIdentifier()
  }

  protected consumeTagEnd(): Token {
    this.reader.consume()

    return {
      type: 'tag-end',
    }
  }

  protected consumeString(): TokenString {
    const quote = this.reader.consume()

    let value = ''

    while (!this.reader.isEof()) {
      const char = this.reader.consume()

      if (char === quote) {
        break
      }

      value += char
    }

    return {
      type: 'string',
      value,
    }
  }

  protected consumeNumber(): TokenNumber {
    let value = ''

    while (!this.reader.isEof()) {
      const char = this.reader.peak()

      if (
        char === '1' ||
        char === '2' ||
        char === '3' ||
        char === '4' ||
        char === '5' ||
        char === '6' ||
        char === '7' ||
        char === '8' ||
        char === '9' ||
        char === '0' ||
        char === '.'
      ) {
        value += this.reader.consume()
      } else {
        break
      }
    }

    return {
      type: 'number',
      value: parseFloat(value),
    }
  }

  protected consumeBoolean(value: boolean): TokenBoolean {
    this.reader.consume(value ? 4 : 5)

    return {
      type: 'boolean',
      value,
    }
  }

  protected consumeOperator(): TokenOperator {
    let operator = ''

    while (!this.reader.isEof()) {
      const char = this.reader.peak()

      if (char === '=' || char === '!' || char === '<' || char === '>') {
        operator += this.reader.consume()
      } else {
        break
      }
    }

    return {
      operator,
      type: 'operator',
    }
  }

  protected consumeIdentifier(type: TokenTypeIdentifier = 'identifier'): TokenIdentifier {
    const chars = IDENTIFIER_CHARS[type]
    let name = ''

    while (!this.reader.isEof()) {
      const char = this.reader.peak()

      if (!chars.includes(char)) {
        break
      }

      name += this.reader.consume()
    }

    return {
      name,
      type,
    }
  }
}
