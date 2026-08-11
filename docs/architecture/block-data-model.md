# Understanding the Block Data Model

UI-Doc's block data model is designed around three key architectural decisions: using plain objects instead of classes, deep cloning to prevent mutation, and the RenderValue pattern for template compatibility. These choices optimize the parse-transform-render pipeline while maintaining type safety and data integrity.

## What is the block data model?

The block data model defines how UI-Doc represents parsed documentation blocks as they flow through the system. A "block" is a plain TypeScript object (not a class instance) that contains all the metadata extracted from a doc block comment.

Blocks start as `Partial<Block>` during parsing, are progressively enriched by tag transformers, validated to become `Block` instances, and finally converted to `ContextEntry` objects for rendering. This linear transformation pipeline is central to UI-Doc's architecture.

## How the block data model works

### Plain objects as Data Transfer Objects (DTOs)

UI-Doc uses TypeScript interfaces to define blocks rather than classes:

```typescript
// packages/core/src/Block.types.ts
export interface Block {
  [key: string]: unknown
  key: string
  order: number
  location?: string
  page?: string
  section?: string
  title?: string
  description?: string
  code?: BlockCode
  colors?: BlockColor[]
  example?: BlockExample
  // ... additional properties
}
```

This design treats blocks as pure data containers that pass through a transformation pipeline:

```text
Source file → CommentBlock → Partial<Block> → Block → ContextEntry → Rendered HTML
```

**Why plain objects?**

1. **Tag transformer compatibility** - Transformers receive `Partial<Block>` and return the mutated object. This pattern works naturally with plain objects:

   ```typescript
   export type TagTransformFunction = (block: Partial<Block>, spec: CommentSpec) => Partial<Block>

   // Example transformer
   export const tag: TagTransformer = {
     name: 'color',
     transform: (block, spec) => {
       if (!Array.isArray(block.colors)) {
         block.colors = []
       }
       block.colors.push({
         name: spec.name,
         value: cssColorValue(spec.type),
         text: trimDescription(spec.description),
       })
       return block
     },
   }
   ```

2. **Zero runtime overhead** - TypeScript interfaces compile away completely. There's no class instantiation cost, no prototype chain lookups, and no constructor logic.

3. **Simple testing** - Tests can create blocks using object literals without instantiating classes:

   ```typescript
   const block: Block = {
     key: 'components.button',
     order: 1,
     title: 'Button',
     colors: [{ name: 'primary', value: new CSSColor({ r: 0, g: 100, b: 200 }) }],
   }
   ```

4. **Natural serialization** - Plain objects work seamlessly with `JSON.stringify()` and `JSON.parse()`, which is critical for deep cloning (see next section).

### Deep cloning to prevent mutation

UI-Doc performs deep cloning at specific points in `UIDoc.ts` using `JSON.parse(JSON.stringify(...))`:

```typescript
// packages/core/src/UIDoc.ts line 598
class UIDoc {
  public pageContent(page: ContextEntry, layout?: string): string {
    const context = {
      // ... other properties
      page: JSON.parse(JSON.stringify(page)) as ContextEntry,
    }
    return this.renderer.generate(context, layout)
  }

  // packages/core/src/UIDoc.ts line 628
  public exampleContent(example: ContextExample, layout = 'example'): string {
    const context: GenerateExampleContext = {
      ...(JSON.parse(JSON.stringify(example)) as ContextExample),
      title: this.generate.exampleTitle(example),
      assets: this.context.exampleAssets,
    }
    return this.renderer.generate(context, layout)
  }
}
```

**Why deep cloning is necessary:**

The `HtmlRenderer.generateContext()` method mutates the context object by adding `styles` and `scripts` properties:

```typescript
// packages/html-renderer/src/HtmlRenderer.ts
class HtmlRenderer {
  protected generateContext(context: GenerateContext | GenerateExampleContext): RenderContext {
    const renderContext = context as RenderContext

    // MUTATION: adds new properties to the context
    renderContext.styles = context.assets
      .filter((asset: Asset) => asset.type === 'style')
      .map((asset: Asset) => `<link href="${asset.src}" rel="stylesheet">`)
      .join('\n')

    renderContext.scripts = context.assets
      .filter((asset: Asset) => asset.type === 'script')
      .map((asset: Asset) => `<script src="${asset.src}"></script>`)
      .join('\n')

    return renderContext
  }
}
```

Without cloning, these mutations would pollute `this.context.entries` and `this.context.examples`. If a page or example is rendered multiple times (common in development mode with hot reload), the `styles` and `scripts` properties would accumulate duplicate asset references.

**Trade-offs:**

- **Performance cost** - `JSON.parse(JSON.stringify(...))` is slower than `structuredClone()` or shallow cloning, but the operation only happens once per page/example render.
- **Simplicity gain** - This approach is straightforward and works with all JavaScript environments (no need for `structuredClone` polyfills).
- **Class compatibility** - Classes with methods are lost during JSON serialization, which is why blocks must be plain objects.

### The RenderValue pattern

Classes like `CSSColor`, `CSSVariable`, and `CSSValue` implement the `RenderValue` interface to bridge the gap between object-oriented data structures and template rendering:

```typescript
// packages/core/src/tag-transformers/nodes/RenderValue.ts
export interface RenderValue {
  readonly output: string
  toString: () => string
}
```

These classes pre-compute their rendered representation at construction time:

```typescript
// packages/core/src/tag-transformers/nodes/CSSColor.ts
export class CSSColor implements RenderValue {
  public readonly output: string
  public readonly hex: string
  public readonly rgb: string

  constructor(public readonly value: CSSColorValue) {
    this.hex = valueToHex(value)
    this.rgb = valueToRgb(value)
    this.output = this.toString() // Pre-computed at construction
  }

  public toString(): string {
    return `${this.rgb}`
  }
}
```

**Why this pattern exists:**

UI-Doc's template engine (HTML Renderer) can only access properties, not call methods. Templates use property access syntax:

```html
<!-- Templates can do this -->
<div style="--color: {{color:value.output}};"></div>

<!-- Templates CANNOT do this -->
<div style="--color: {{color:value.toString()}};"></div>
```

The `output` property must survive serialization. Consider what happens during deep cloning:

```typescript
const color = new CSSColor({ r: 255, g: 0, b: 0 })
console.log(color.output) // "255 0 0"
console.log(color.toString()) // "255 0 0"

// After JSON serialization
const cloned = JSON.parse(JSON.stringify(color))
console.log(cloned.output) // "255 0 0" ✓ Still available
console.log(cloned.toString) // undefined ✗ Method lost
```

The `output` property is a plain string value that survives JSON serialization, while the `toString()` method is lost because JSON doesn't serialize functions.

**Alternative considered:** If UI-Doc didn't use JSON-based deep cloning, it could use `structuredClone()` which preserves class instances:

```typescript
const color = new CSSColor({ r: 255, g: 0, b: 0 })
const cloned = structuredClone(color)
console.log(cloned.toString()) // Still works with structuredClone
```

However, this would require changing the deep cloning strategy across the entire codebase, and templates would still need property access (not method calls).

## Block data model in practice

Here's how a complete block flows through the system:

```typescript
// 1. Parser creates a Partial<Block>
let block: Partial<Block> = {
  key: '',
  order: 0,
}

// 2. Tag transformers progressively enrich it
// @location components.button Primary Button
block = locationTransformer(block, { name: 'components.button', description: 'Primary Button' })
// → { key: 'components.button', order: 0, title: 'Primary Button' }

// @color primary #ff0000 Primary action color
block = colorTransformer(block, {
  name: 'primary',
  type: '#ff0000',
  description: 'Primary action color',
})
// → { key: 'components.button', order: 0, title: 'Primary Button',
//     colors: [{ name: 'primary', value: CSSColor(...), text: 'Primary action color' }] }

// 3. Block is validated and becomes a full Block
const validatedBlock: Block = validateBlock(block)

// 4. Block is converted to ContextEntry
const entry: ContextEntry = {
  id: 'button',
  title: validatedBlock.title,
  order: validatedBlock.order,
  sections: [],
  titleLevel: 1,
  colors: validatedBlock.colors,
}

// 5. Entry is cloned before rendering
const context = {
  page: JSON.parse(JSON.stringify(entry)) as ContextEntry,
}

// 6. HtmlRenderer adds mutation properties
context.styles = '<link href="style.css" rel="stylesheet">'
context.scripts = '<script src="app.js"></script>'

// 7. Template accesses pre-computed values
// In template: <div style="--primary: {{color:value.output}};"></div>
// Renders to: <div style="--primary: 255 0 0;"></div>
```

## Why the block data model matters

These architectural decisions enable several important capabilities:

- **Extensibility** - New tag transformers can be added without modifying the core `Block` interface. Transformers receive `Partial<Block>` and can add any properties they need.

- **Type safety** - TypeScript ensures that transformers produce valid block structures, even though blocks are plain objects. The compiler catches type mismatches at build time.

- **Performance** - Plain objects minimize runtime overhead. There's no constructor logic, no prototype chain traversal, and no class instantiation cost for potentially thousands of blocks.

- **Data integrity** - Deep cloning ensures that renderer mutations never affect the source data. The same block can be rendered multiple times (in dev mode, in different layouts) without corruption.

- **Template compatibility** - The RenderValue pattern bridges the gap between object-oriented parsing (using classes like `CSSColor`) and declarative template rendering (which can only access properties).

## Common misconceptions

### "Plain objects are less safe than classes"

TypeScript interfaces provide compile-time safety equivalent to classes. The difference is runtime behavior—interfaces compile away completely, while classes create runtime constructor functions and prototype chains.

```typescript
// Both approaches provide the same compile-time safety
interface BlockInterface {
  key: string
  title?: string
}

class BlockClass {
  constructor(
    public key: string,
    public title?: string,
  ) {}
}

// TypeScript prevents this in both cases
const block1: BlockInterface = { key: 'test', invalid: true } // Error
const block2 = new BlockClass('test', undefined)
block2.invalid = true // Error (with strict mode)
```

UI-Doc chose interfaces because blocks are DTOs that flow through transformers. There's no behavior to encapsulate, only data to validate and transform.

### "JSON cloning is always a bad practice"

`JSON.parse(JSON.stringify(...))` has legitimate uses when you need:

1. Deep cloning of plain objects and arrays
2. Compatibility with all JavaScript environments
3. Intentional removal of functions and class methods

The alternative (`structuredClone`) preserves more data types but requires modern JavaScript environments and doesn't solve the template method-call problem.

UI-Doc uses JSON cloning specifically because it needs to pass plain data to templates. Methods like `toString()` would be inaccessible in templates anyway.

### "The RenderValue pattern duplicates data"

The `output` property is pre-computed once at construction time, not stored in addition to other representations. For example:

```typescript
class CSSColor {
  constructor(value: { r: number; g: number; b: number }) {
    this.hex = valueToHex(value) // Computed once
    this.rgb = valueToRgb(value) // Computed once
    this.output = this.toString() // Computed once
  }
}
```

This is more efficient than computing the output on every template access. The alternative would be making templates call methods, which UI-Doc's template engine doesn't support.

## Related concepts

- [Tag Transformers](./tag-transformers.md) - How transformers populate blocks
- [Context Generation](./context-generation.md) - How blocks become context entries
- [Template Rendering](./template-rendering.md) - How the HTML renderer consumes blocks

## Further reading

- [CommentBlockParser API](../reference/comment-block-parser.md) - For details on block parsing
- [Tag Transformer API](../reference/tag-transformers.md) - For creating custom transformers
- [Extending UI-Doc Tutorial](../tutorials/custom-tag-transformer.md) - Building a custom transformer
