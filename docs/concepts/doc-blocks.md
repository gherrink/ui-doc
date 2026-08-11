# Understanding doc blocks

Doc blocks are the foundation of UI-Doc. They transform JSDoc-style comments in your source files into structured documentation with live examples.

## What is a doc block?

A doc block is a specially formatted comment that UI-Doc extracts from your source files. It uses JSDoc-style syntax with `/** */` delimiters and contains tags that describe where content should appear and what it should display.

Doc blocks live alongside your actual code, keeping documentation close to the components it describes. When you update a component, its documentation is right there to update too.

## How doc blocks work

UI-Doc processes doc blocks through a three-stage pipeline: parsing, transformation, and context building.

### Parsing

The `CommentBlockParser` scans your source files for JSDoc-style comments. It extracts each comment block and breaks it into structured data: a description (the text before any tags) and a list of tags with their values.

```css
/**
 * Primary action button with brand colors.
 *
 * @location components.button Primary Button
 * @example
 * <button class="btn btn-primary">Save</button>
 */
.btn-primary {
  /* ... */
}
```

The parser identifies this as a doc block with:

- **Description:** "Primary action button with brand colors."
- **Tags:** `@location` with value `components.button Primary Button`, and `@example` with HTML content

### Transformation

Each tag has a dedicated transformer that converts it into structured data on a `Block` object. Transformers handle the tag syntax and validation.

For example, the `@location` transformer parses `components.button Primary Button` and sets:

- `block.location` = `"components.button"`
- `block.title` = `"Primary Button"`

The `@example` transformer sets:

- `block.example.content` = the HTML markup
- `block.example.type` = `"html"`

### Context building

After transformation, UI-Doc builds a context tree from all blocks. The context organizes documentation into pages, sections, and nested entries based on each block's location.

The location `components.button` creates:

1. A page with ID `components`
2. A section within that page with ID `button`

Multiple blocks can target the same location, with later blocks updating the entry.

## The processing pipeline

```text
Source Files (CSS, JS, TS)
         │
         ▼
┌─────────────────────┐
│  CommentBlockParser │  Extract and parse doc blocks
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Tag Transformers   │  Convert tags to Block properties
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│      UIDoc          │  Build context tree
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│     Renderer        │  Generate HTML output
└─────────────────────┘
```

Each stage emits events that you can hook into for customization.

## Doc blocks in practice

Here's a complete example showing how doc blocks organize into documentation:

```css
/**
 * Button components for user interactions.
 *
 * @page buttons Buttons
 */

/**
 * Standard button for general actions.
 *
 * @location buttons.default Default Button
 * @example
 * <button class="btn">Click me</button>
 */
.btn {
  padding: 8px 16px;
  border-radius: 4px;
}

/**
 * Primary button for main calls to action.
 *
 * @location buttons.primary Primary Button
 * @example
 * <button class="btn btn-primary">Submit</button>
 */
.btn-primary {
  background: var(--color-primary);
  color: white;
}
```

This creates:

- A **Buttons** page (from `@page buttons`)
- Two sections on that page: **Default Button** and **Primary Button** (from `@location`)
- Each section shows the description, a live preview of the HTML, and the example code

## Tag categories

Tags serve two distinct purposes in organizing and displaying documentation:

**Placement tags** determine where content appears in the documentation structure. Every doc block needs at least one placement tag to specify its location. The most common are `@page`, `@section`, and `@location` (which combines both).

**Display tags** determine what content appears and how it's shown. These include `@example` for live previews, `@code` for code-only display, and specialized tags like `@color` and `@space` for design tokens.

Understanding this distinction helps you structure doc blocks effectively: first decide where the content belongs (placement), then decide what to show (display).

## Why doc blocks matter

**Co-location keeps docs synchronized:** Documentation lives with the code it describes. When you change a component, the docs are right there to update. This proximity reduces the friction of keeping documentation current.

**Live examples stay accurate:** The `@example` tag creates actual rendered previews, not static images or screenshots. When your styles change, the examples automatically reflect those changes.

**Automatic organization:** The location system transforms scattered doc blocks into a structured, navigable documentation site. You focus on documenting individual components; UI-Doc handles the organization.

**Extensibility through transformers:** Custom tag transformers let you extend the syntax for your project's specific needs. Create tags for design patterns, accessibility notes, or any domain-specific documentation.

## Common misconceptions

### "Doc blocks only work with CSS"

Doc blocks work with any file type that uses JSDoc-style comments: CSS, JavaScript, TypeScript, and more. The parser looks for `/** */` comment blocks regardless of the surrounding code.

### "Each file needs a @page tag"

Multiple files can contribute to the same page. Use `@location` to add sections to existing pages, or use `@page` with just the key (no title) to reference an existing page.

### "Order is determined by file order"

By default, pages and sections sort alphabetically by title. Use the `@order` tag to specify explicit ordering when needed.

## Related concepts

- [Core API Reference](../reference/core-api.md) - Technical details on UIDoc and CommentBlockParser classes

## Further reading

- [Getting Started with Vite](../getting-started/vite.md) - Set up your first UI-Doc project
- [Custom Transformers Tutorial](../tutorials/custom-transformers.md) - Create your own tag transformers
- [@ui-doc/core README](../../packages/core/README.md) - Complete tag reference and API documentation
