import type { PositiveInteger } from './base'

export type TokenTypeIdentifier = 'tag-identifier' | 'identifier'

export type TokenTagType = 'tag-open' | 'tag-close' | 'tag-end' | 'tag-separator'

export type TokenType =
  | 'comment'
  | 'template'
  | 'operator'
  | 'number'
  | 'string'
  | 'boolean'
  | TokenTypeIdentifier
  | TokenTagType

export interface Token {
  type: TokenType
}

export interface TokenComment extends Token {
  type: 'comment'
  content: string
}

export interface TokenTemplate extends Token {
  type: 'template'
  content: string
}

export interface TokenString extends Token {
  type: 'string'
  value: string
}

export interface TokenNumber extends Token {
  type: 'number'
  value: number
}

export interface TokenBoolean extends Token {
  type: 'boolean'
  value: boolean
}

export interface TokenIdentifier extends Token {
  type: TokenTypeIdentifier
  name: string
}

export interface TokenOperator extends Token {
  type: 'operator'
  operator: string
}

export interface TokenTag extends Token {
  type: TokenTagType
}

export type TokenValue<T extends TokenType = TokenType> = T extends 'comment'
  ? TokenComment
  : T extends 'template'
    ? TokenTemplate
    : T extends 'string'
      ? TokenString
      : T extends 'number'
        ? TokenNumber
        : T extends 'boolean'
          ? TokenBoolean
          : T extends TokenTypeIdentifier
            ? TokenIdentifier
            : T extends 'operator'
              ? TokenOperator
              : T extends TokenTagType
                ? TokenTag
                : never

export type TokenReturn<T = PositiveInteger> = T extends 1
  ? TokenValue | undefined
  : (TokenValue | undefined)[]
