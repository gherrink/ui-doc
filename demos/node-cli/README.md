# Node.js CLI Demo

Demonstrates UI-Doc's programmatic API using Node.js directly.

## Usage

```bash
pnpm node-cli
pnpm serve:node-cli
```

## Overview

This demo shows how to use UI-Doc's core packages directly without a build tool plugin:

- `@ui-doc/core` - Parsing and context generation
- `@ui-doc/node` - File system operations
- `@ui-doc/html-renderer` - HTML output rendering

## When to Use

Use the programmatic API when:

- Integrating with a custom build system
- Running documentation generation as a standalone script
- Need fine-grained control over the parsing/rendering pipeline
- Building custom tooling on top of UI-Doc

## Limitations

This demo focuses on the parsing/rendering API only. It does not include:

- CSS bundling/processing (examples won't have styles)
- Asset pipeline integration

For a complete build with styled examples, use the Vite or Rollup demos which include full asset processing.

## Key Concepts

```typescript
// 1. Create file system instance
const fileSystem = createNodeFileSystem()

// 2. Set up renderer with templates
const renderer = new HtmlRenderer(NodeParser.init())
await TemplateLoader.load({ fileSystem, renderer, templatePath })

// 3. Create UIDoc instance
const uidoc = new UIDoc({ renderer })

// 4. Parse source files
await finder.search(async file => {
  uidoc.sourceCreate(file, await fileSystem.fileRead(file))
})

// 5. Output documentation
await uidoc.output(async (file, content) => {
  await fileSystem.fileWrite(`${outputDir}/${file}`, content)
})
```
