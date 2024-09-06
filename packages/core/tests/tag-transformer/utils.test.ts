/* eslint-disable sort-keys */
import { describe, expect, test } from '@jest/globals'

import { isValidHTML } from '../../src/tag-transformers/utils'

describe('tag transformer utilities', () => {
  test.each([
    '<div>test</div>',
    '<div>test</div><div>test</div>',
    '<div>test</div><div>test</div><div>test</div>',
    '<div>test</div><div>test</div><div>test</div><div>test</div>',
    '<div class="foo">test</div>',
    '<div class="foo">test</div><div class="foo">test</div>',
    '<p>test</p>',
    '<p>test</p><p>test</p>',
    '<br/>',
    '<br/><br/>',
    '<div>test</div>\n<div>test</div>',
    '<div>\n<div>test</div>\n</div>',
    '<p>Testing</p> <p>Testing</p>',
    '<div>Test<br>Test<div>foo</div><p>bar</p></div>',
    '<!-- test comment --><div>Test</div>',
    '<div>Test <!-- test comment --> </div>',
    '<input type="submit" class="btn" value="Submit button" />',
  ])('should be valid html:\n%s', html => {
    expect(isValidHTML(html)).toBe(true)
  })

  test.each(['<>', '<><>', '<div>foo<p>bar</p>', '<div>\n', '<div>foo</p>', '<div>foo</p></div>'])(
    'should be invalid html:\n%s',
    html => {
      expect(isValidHTML(html)).toBe(false)
    },
  )
})
