# Understanding tag transformers

Tag transformers are the core mechanism that converts JSDoc-style tags in your doc blocks into structured data that UI-Doc can render. They act as the bridge between your annotated source code and the final documentation output.

## What is a tag transformer?

A tag transformer is a function that processes a specific tag type (like `@location`, `@example`, or `@color`) and transforms it into properties on a block object. Each transformer handles one tag type and knows how to parse its syntax and extract meaningful data.

Tag transformers work at the parsing stage of UI-Doc's pipeline. When `CommentBlockParser` encounters a doc block in your source code, it extracts each tag and routes it to the appropriate transformer. The transformer then modifies the block object being built, adding properties that will later be used for rendering.

## How tag transformers work

The transformation process follows a consistent pattern across all tag types:

1. **Tag extraction** - `CommentBlockParser` uses the `comment-parser` library to extract JSDoc-style tags from your source code
2. **Tag routing** - Each tag is matched to a registered transformer by its name (the word after `@`)
3. **Transformation** - The transformer's `transform` function processes the tag and modifies the block object
4. **Validation** - After all tags are processed, the parser validates that the block has required properties
5. **Block finalization** - The completed block object is ready for rendering

### The transform function

Every tag transformer implements a simple interface:

```ts
interface TagTransformer {
  name: string
  transform: (block: Partial<Block>, spec: CommentSpec) => Partial<Block>
}
```

The `transform` function receives two parameters:

- **block** - The block object being built (contains properties from previously processed tags)
- **spec** - Parsed tag information containing `type` (in braces), `name`, and `description`

The function modifies the block object and returns it for the next transformer.

### Tag anatomy

Tags follow JSDoc syntax with UI-Doc-specific semantics:

```text
@tag-name {type} name description
```

Different tag transformers interpret these components differently:

| Tag | Type | Name | Description |
|-----|------|------|-------------|
| `@location` | Ignored | Page and section key | Human-readable title |
| `@color` | RGB/hex value | Variable name | Color description |
| `@example` | Content type | Optional title | HTML/code content |
| `@order` | Ignored | Sort order number | Ignored |

### Processing order

Tag transformers process tags in the order they appear in the doc block. This allows later tags to modify properties set by earlier tags. For example:

```css
/**
 * @location components.button Button
 * @example
 * <button class="btn">Click me</button>
 */
```

The `@location` transformer runs first and sets `block.title = "Button"`. When `@example` runs, it can access and use this title for the example.

## Tag transformers in practice

Here's how the `@location` transformer works internally:

```ts
const locationTransformer: TagTransformer = {
  name: 'location',
  transform: (block, spec) => {
    const { key, name } = identifier(spec)

    block.title = name
    block.location = key

    return block
  },
}
```

When processing this doc block:

```css
/**
 * @location components.button.primary Primary Button
 */
```

The transformer receives:

- `spec.name = "components.button.primary"`
- `spec.description = "Primary Button"`

It produces:

- `block.location = "components.button.primary"`
- `block.title = "Primary Button"`

### Complex transformers

Some transformers handle more complex data structures. The `@color` transformer builds an array of color definitions:

```css
/**
 * @location variables.colors Colors
 * @color {0 0 0|255 255 255} --color-black | black
 * @color {20 33 61|255 255 255} --color-blue | blue
 */
```

Each `@color` tag:

1. Parses the type field for RGB values (background and optional font color)
2. Extracts the variable name
3. Parses the description
4. Adds a color object to `block.colors` array

The transformer runs multiple times (once per `@color` tag), appending to the same array.

## Why tag transformers matter

Tag transformers provide several key benefits for UI-Doc's architecture:

- **Extensibility:** You can add custom tags without modifying UI-Doc's core code. Register a transformer and start using your tag immediately.
- **Separation of concerns:** Parsing logic is isolated from rendering logic. Transformers only handle data extraction and structure.
- **Composability:** Multiple transformers work together to build a complete block. Tags can reference and build on each other's output.
- **Type safety:** The `Block` interface defines a contract between transformers and renderers, ensuring data consistency.

## Common misconceptions

### "Tag transformers validate the entire doc block"

Tag transformers only validate their own tag's data. The `CommentBlockParser` handles block-level validation after all transformers have run. For example, it verifies that every block has a `@location` or `@page` tag.

### "Transformers can access the full source code"

Transformers only see the parsed tag data (`type`, `name`, `description`). They don't have access to the surrounding source code or other doc blocks. This isolation keeps transformers simple and predictable.

### "Tag order doesn't matter"

Tag order can matter when tags reference each other's output. The `@example` tag uses `block.title` if available, so placing `@location` before `@example` allows the title to flow through. However, most tags are independent and can appear in any order.

## Related concepts

- [Doc blocks](./doc-blocks.md) - How tag transformers fit into the overall documentation structure
- [Custom tags guide](../how-to/custom-tags.md) - How to create your own tag transformers
- [Processing pipeline](./processing-pipeline.md) - Where tag transformation happens in UI-Doc's workflow

## Further reading

- [Tag Reference](../../packages/core/README.md#available-tags) - Complete list of built-in tags
- [CommentBlockParser API](../../packages/core/README.md#commentblockparser) - Parser configuration and events
- [Custom Tags Example](../../packages/core/README.md#custom-tags) - Sample implementation of an `@author` tag
