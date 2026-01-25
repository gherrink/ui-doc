import type { Renderer } from '../src/Renderer.types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CommentNode } from '../src/nodes/CommentNode'
import { Node } from '../src/nodes/Node'
import { TemplateNode } from '../src/nodes/TemplateNode'

describe('node', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('node', () => {
    describe('constructor', () => {
      it('should set type property correctly', () => {
        const node = new Node('element')
        expect(node.type).toBe('element')
      })
    })

    describe('append', () => {
      it('should add nodes to childNodes', () => {
        const parent = new Node('parent')
        const child1 = new Node('child1')
        const child2 = new Node('child2')

        parent.append(child1)
        parent.append(child2)

        expect(parent.children).toEqual([child1, child2])
      })
    })

    describe('children', () => {
      it('should return childNodes array', () => {
        const parent = new Node('parent')
        const child = new Node('child')

        parent.append(child)

        expect(parent.children).toEqual([child])
      })
    })

    describe('render', () => {
      it('should concatenate all child node renders', () => {
        const parent = new Node('parent')
        const child1 = new TemplateNode('content1')
        const child2 = new TemplateNode('content2')

        parent.append(child1)
        parent.append(child2)

        const context = {}
        const renderer = {} as Renderer

        const result = parent.render(context, renderer)

        expect(result).toBe('content1content2')
      })

      it('should return empty string with no children', () => {
        const node = new Node('empty')
        const context = {}
        const renderer = {} as Renderer

        const result = node.render(context, renderer)

        expect(result).toBe('')
      })

      it('should pass context and renderer to child nodes', () => {
        const parent = new Node('parent')
        const child = new Node('child')
        const renderSpy = vi.spyOn(child, 'render')

        parent.append(child)

        const context = { key: 'value' }
        const renderer = {} as Renderer

        parent.render(context, renderer)

        expect(renderSpy).toHaveBeenCalledWith(context, renderer)
      })
    })
  })

  describe('templateNode', () => {
    describe('constructor', () => {
      it('should set type to template and store content', () => {
        const content = 'template content'
        const node = new TemplateNode(content)

        expect(node.type).toBe('template')
        expect(node.content).toBe(content)
      })
    })

    describe('render', () => {
      it('should return content directly (ignores children)', () => {
        const content = 'template content'
        const node = new TemplateNode(content)
        const child = new TemplateNode('child content')

        node.append(child)

        const context = {}
        const renderer = {} as Renderer

        const result = node.render(context, renderer)

        expect(result).toBe(content)
      })

      it('should handle empty content', () => {
        const node = new TemplateNode('')
        const context = {}
        const renderer = {} as Renderer

        const result = node.render(context, renderer)

        expect(result).toBe('')
      })

      it('should handle multiline content', () => {
        const content = 'line1\nline2\nline3'
        const node = new TemplateNode(content)
        const context = {}
        const renderer = {} as Renderer

        const result = node.render(context, renderer)

        expect(result).toBe(content)
      })

      it('should handle special characters (no escaping)', () => {
        const content = '<div>&amp;"quotes"</div>'
        const node = new TemplateNode(content)
        const context = {}
        const renderer = {} as Renderer

        const result = node.render(context, renderer)

        expect(result).toBe(content)
      })
    })
  })

  describe('commentNode', () => {
    describe('constructor', () => {
      it('should set type to comment and store content', () => {
        const content = 'comment content'
        const node = new CommentNode(content)

        expect(node.type).toBe('comment')
        expect(node.content).toBe(content)
      })
    })

    describe('render', () => {
      it('should wrap content in HTML comment syntax', () => {
        const content = 'comment content'
        const node = new CommentNode(content)
        const context = {}
        const renderer = {} as Renderer

        const result = node.render(context, renderer)

        expect(result).toBe('<!-- comment content -->')
      })

      it('should handle empty content', () => {
        const node = new CommentNode('')
        const context = {}
        const renderer = {} as Renderer

        const result = node.render(context, renderer)

        expect(result).toBe('<!--  -->')
      })

      it('should handle multiline content', () => {
        const content = 'line1\nline2\nline3'
        const node = new CommentNode(content)
        const context = {}
        const renderer = {} as Renderer

        const result = node.render(context, renderer)

        expect(result).toBe('<!-- line1\nline2\nline3 -->')
      })

      it('should handle special characters (no escaping)', () => {
        const content = '<div>&amp;"quotes"</div>'
        const node = new CommentNode(content)
        const context = {}
        const renderer = {} as Renderer

        const result = node.render(context, renderer)

        expect(result).toBe('<!-- <div>&amp;"quotes"</div> -->')
      })
    })
  })
})
