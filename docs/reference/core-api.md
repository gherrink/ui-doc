# Core API Reference

Technical reference for the `@ui-doc/core` package, covering the UIDoc class, CommentBlockParser, events, and configuration options.

## Overview

The `@ui-doc/core` package provides the parsing engine and context management for UI-Doc. It extracts doc blocks from source files, transforms them into structured data, and coordinates output through a renderer.

## UIDoc Class

The main class that orchestrates parsing, context building, and output generation.

### Constructor

```ts
import { UIDoc } from '@ui-doc/core'

const uidoc = new UIDoc(options)
```

**Parameters:**

| Parameter | Required | Type      | Description                              |
| --------- | -------- | --------- | ---------------------------------------- |
| `options` | Yes      | `Options` | Configuration object (see Options below) |

### Options

| Property      | Required | Type                         | Description                                                            |
| ------------- | -------- | ---------------------------- | ---------------------------------------------------------------------- |
| `renderer`    | Yes      | `Renderer`                   | The renderer that generates output from context                        |
| `blockParser` | No       | `BlockParser`                | Custom parser for extracting doc blocks. Default: `CommentBlockParser` |
| `generate`    | No       | `Partial<GenerateFunctions>` | Functions that generate content for the renderer                       |
| `texts`       | No       | `Partial<Texts>`             | Text strings used by default generate functions                        |

**Example:**

```js
import { UIDoc } from '@ui-doc/core'
import { HtmlRenderer, NodeParser } from '@ui-doc/html-renderer'

const renderer = new HtmlRenderer(NodeParser.init())

const uidoc = new UIDoc({
  renderer,
  texts: {
    title: 'My Component Library',
    copyright: 'Acme Inc.',
  },
  generate: {
    logo: () => '<img src="logo.svg" alt="Logo">',
  },
})
```

### Texts

Customizable text strings used throughout the documentation.

| Property    | Type     | Default    | Description                      |
| ----------- | -------- | ---------- | -------------------------------- |
| `title`     | `string` | `'UI-Doc'` | Title of your documentation site |
| `copyright` | `string` | `'UI-Doc'` | Copyright text used in footer    |

**Example:**

```js
const uidoc = new UIDoc({
  renderer,
  texts: {
    title: 'Component Library',
    copyright: '© 2025 My Company',
  },
})
```

### Generate Functions

Functions that control how various parts of the documentation are generated.

| Function       | Signature                                                               | Description                                |
| -------------- | ----------------------------------------------------------------------- | ------------------------------------------ |
| `exampleTitle` | `(example: ContextExample) => string`                                   | Generate title for example pages           |
| `footerText`   | `() => string`                                                          | Generate footer text                       |
| `homeLink`     | `() => string`                                                          | Generate link to homepage                  |
| `logo`         | `() => string`                                                          | Generate logo content (text, HTML, or SVG) |
| `menu`         | `(menu: MenuItem[], pages: Record<string, ContextEntry>) => MenuItem[]` | Create or modify navigation menu           |
| `name`         | `() => string`                                                          | Generate site name                         |
| `pageLink`     | `(page: ContextEntry) => string`                                        | Generate link to a page                    |
| `pageTitle`    | `(page: ContextEntry) => string`                                        | Generate page title                        |
| `resolve`      | `(uri: string, type: string) => string`                                 | Transform or manipulate URIs               |

**Example:**

```js
const uidoc = new UIDoc({
  renderer,
  generate: {
    footerText: () => `© ${new Date().getFullYear()} My Company`,
    pageTitle: page => `${page.title} - Documentation`,
    resolve: (uri, type) => {
      if (type === 'asset') {
        return `/assets/${uri}`
      }
      return uri
    },
  },
})
```

### Methods

#### sourceCreate

Add a new source file to be processed.

**Syntax:**

```text
uidoc.sourceCreate(file: string, content: string): void
```

**Parameters:**

| Parameter | Type     | Description           |
| --------- | -------- | --------------------- |
| `file`    | `string` | File path identifier  |
| `content` | `string` | File content to parse |

**Example:**

```js
import fs from 'node:fs/promises'

const content = await fs.readFile('./src/buttons.css', 'utf8')
uidoc.sourceCreate('./src/buttons.css', content)
```

#### sourceUpdate

Update an existing source file. Creates the source if it doesn't exist.

**Syntax:**

```text
uidoc.sourceUpdate(file: string, content: string): void
```

**Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `file`    | `string` | File path identifier |
| `content` | `string` | Updated file content |

**Example:**

```js
uidoc.sourceUpdate('./src/buttons.css', updatedContent)
```

#### sourceDelete

Remove a source file and its associated context entries.

**Syntax:**

```text
uidoc.sourceDelete(file: string): void
```

**Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `file`    | `string` | File path identifier |

**Example:**

```js
uidoc.sourceDelete('./src/buttons.css')
```

#### sourceExists

Check if a source file has been added.

**Syntax:**

```text
uidoc.sourceExists(file: string): boolean
```

**Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `file`    | `string` | File path identifier |

**Returns:** `true` if the source exists, `false` otherwise.

**Example:**

```js
if (uidoc.sourceExists('./src/buttons.css')) {
  console.log('Source file exists')
}
```

#### output

Generate all documentation files.

**Syntax:**

```text
await uidoc.output(callback: OutputCallback): Promise<void>
```

**Parameters:**

| Parameter  | Type                                                       | Description                 |
| ---------- | ---------------------------------------------------------- | --------------------------- |
| `callback` | `(file: string, content: string) => Promise<void> \| void` | Called for each output file |

**Example:**

```js
import fs from 'node:fs/promises'

await uidoc.output(async (fileName, content) => {
  await fs.writeFile(`./dist/docs/${fileName}`, content, 'utf8')
})
```

#### page

Get the rendered content for a specific page.

**Syntax:**

```text
uidoc.page(pageId: string): string | null
```

**Parameters:**

| Parameter | Type     | Description     |
| --------- | -------- | --------------- |
| `pageId`  | `string` | Page identifier |

**Returns:** Rendered page content as a string, or `null` if the page doesn't exist.

**Example:**

```js
const content = uidoc.page('buttons')
if (content) {
  console.log('Page found')
}
```

#### example

Get the rendered content for a specific example.

**Syntax:**

```text
uidoc.example(exampleId: string): string | null
```

**Parameters:**

| Parameter   | Type     | Description        |
| ----------- | -------- | ------------------ |
| `exampleId` | `string` | Example identifier |

**Returns:** Rendered example content as a string, or `null` if the example doesn't exist.

**Example:**

```js
const exampleContent = uidoc.example('button-primary')
```

#### pages

Get all pages in the context.

**Syntax:**

```text
uidoc.pages(): Record<string, ContextEntry>
```

**Returns:** Object mapping page IDs to `ContextEntry` objects.

**Example:**

```js
const allPages = uidoc.pages()
Object.keys(allPages).forEach(pageId => {
  console.log(`Page: ${pageId}`)
})
```

#### entries

Get all context entries (pages and sections).

**Syntax:**

```text
uidoc.entries(): Record<string, ContextEntry>
```

**Returns:** Object mapping entry keys to `ContextEntry` objects.

**Example:**

```js
const allEntries = uidoc.entries()
```

#### addAsset

Add an asset (CSS or JS) to be included on documentation pages.

**Syntax:**

```text
uidoc.addAsset(asset: Asset): void
```

**Parameters:**

| Property      | Type                     | Description              |
| ------------- | ------------------------ | ------------------------ |
| `asset.type`  | `'style' \| 'script'`    | Asset type               |
| `asset.src`   | `string`                 | Asset URL or path        |
| `asset.attrs` | `Record<string, string>` | Optional HTML attributes |

**Example:**

```js
uidoc.addAsset({
  type: 'style',
  src: 'custom.css',
})

uidoc.addAsset({
  type: 'script',
  src: 'theme.js',
  attrs: { defer: '' },
})
```

#### addExampleAsset

Add an asset to be included on example pages (iframes).

**Syntax:**

```text
uidoc.addExampleAsset(asset: Asset): void
```

**Parameters:** Same as `addAsset`.

**Example:**

```js
uidoc.addExampleAsset({
  type: 'style',
  src: 'example-styles.css',
})
```

#### replaceGenerate

Replace a generate function after instantiation.

**Syntax:**

```text
uidoc.replaceGenerate<K extends keyof GenerateFunctions>(
  name: K,
  callback: GenerateFunctions[K]
): void
```

**Parameters:**

| Parameter  | Type                      | Description                              |
| ---------- | ------------------------- | ---------------------------------------- |
| `name`     | `keyof GenerateFunctions` | Name of the generate function to replace |
| `callback` | `GenerateFunctions[K]`    | New function implementation              |

**Example:**

```js
uidoc.replaceGenerate('logo', () => '<span>New Logo</span>')
uidoc.replaceGenerate('pageTitle', page => `${page.title} | Docs`)
```

#### on

Register an event listener.

**Syntax:**

```text
uidoc.on(event: string, listener: Function): void
```

**Parameters:**

| Parameter  | Type       | Description            |
| ---------- | ---------- | ---------------------- |
| `event`    | `string`   | Event name             |
| `listener` | `Function` | Event handler function |

See [Events](#uidoc-events) for available events.

#### off

Remove an event listener.

**Syntax:**

```text
uidoc.off(event: string, listener: Function): void
```

**Parameters:**

| Parameter  | Type       | Description                      |
| ---------- | ---------- | -------------------------------- |
| `event`    | `string`   | Event name                       |
| `listener` | `Function` | Event handler function to remove |

**Example:**

```js
function onContextEntry({ entry }) {
  console.log(`Entry created: ${entry.title}`)
}

uidoc.on('context-entry', onContextEntry)
// Later...
uidoc.off('context-entry', onContextEntry)
```

## CommentBlockParser Class

Extracts and parses JSDoc-style doc blocks from source code.

### Constructor

```ts
import { CommentBlockParser, createMarkdownDescriptionParser } from '@ui-doc/core'

const parser = new CommentBlockParser(descriptionParser)
```

**Parameters:**

| Parameter           | Type                | Description                   |
| ------------------- | ------------------- | ----------------------------- |
| `descriptionParser` | `DescriptionParser` | Parser for block descriptions |

**Example:**

```js
import { CommentBlockParser, createMarkdownDescriptionParser } from '@ui-doc/core'

const parser = new CommentBlockParser(createMarkdownDescriptionParser())
```

### Factory Function

A convenience function for creating a parser with default settings.

**Syntax:**

```ts
import { createCommentBlockParser, createMarkdownDescriptionParser } from '@ui-doc/core'

const parser = createCommentBlockParser(createMarkdownDescriptionParser())
```

### Methods

#### parse

Parse source content and extract doc blocks.

**Syntax:**

```text
parser.parse(context: BlockParserContext): Block[]
```

**Parameters:**

| Property             | Type     | Description                              |
| -------------------- | -------- | ---------------------------------------- |
| `context.content`    | `string` | Source file content                      |
| `context.identifier` | `string` | File identifier (used in error messages) |

**Returns:** Array of parsed `Block` objects.

**Example:**

```js
const blocks = parser.parse({
  content: cssFileContent,
  identifier: 'src/buttons.css',
})
```

#### registerTagTransformer

Register a custom tag transformer.

**Syntax:**

```text
parser.registerTagTransformer(transformer: TagTransformer): CommentBlockParser
```

**Parameters:**

| Property                | Type                   | Description            |
| ----------------------- | ---------------------- | ---------------------- |
| `transformer.name`      | `string`               | Tag name (without `@`) |
| `transformer.transform` | `TagTransformFunction` | Transform function     |

**Example:**

```js
parser.registerTagTransformer({
  name: 'author',
  transform(block, spec) {
    block.author = {
      key: spec.name,
      name: spec.description,
    }
    return block
  },
})
```

The transform function receives:

- `block` - The block object being built
- `spec` - Parsed tag data with properties:
  - `spec.name` - The name portion of the tag
  - `spec.description` - The description portion
  - `spec.type` - The type portion (content in braces)

#### on

Register an event listener.

**Syntax:**

```text
parser.on(event: string, listener: Function): void
```

See [CommentBlockParser Events](#commentblockparser-events) for available events.

#### off

Remove an event listener.

**Syntax:**

```text
parser.off(event: string, listener: Function): void
```

## Events

### UIDoc Events

| Event           | Payload             | Description                                            |
| --------------- | ------------------- | ------------------------------------------------------ |
| `context-entry` | `ContextEntryEvent` | Before a context entry is created, updated, or deleted |
| `source`        | `SourceEvent`       | Before a source is created, updated, or deleted        |
| `output`        | `OutputEvent`       | Before complete documentation is output                |
| `page`          | `PageEvent`         | Before a page is rendered                              |
| `example`       | `ExampleEvent`      | Before an example is rendered                          |

#### context-entry

Fired when a context entry changes.

**Event Payload:**

```ts
interface ContextEntryEvent {
  entry: ContextEntry
  key: string
  type: 'create' | 'update' | 'delete'
  changes?: {
    deleted: string[]
    updated: Record<string, { from: unknown; to: unknown }>
  }
}
```

**Example:**

```js
uidoc.on('context-entry', ({ entry, type }) => {
  if (type === 'create') {
    console.log(`New entry: ${entry.title}`)
  }
})
```

#### source

Fired when a source file changes.

**Event Payload:**

```ts
interface SourceEvent {
  file: string
  source: Source
  type: 'create' | 'update' | 'delete'
}
```

**Example:**

```js
uidoc.on('source', ({ file, type }) => {
  console.log(`Source ${type}: ${file}`)
})
```

#### output

Fired before output generation. Use to add custom output files.

**Event Payload:**

```ts
interface OutputEvent {
  promises: Promise<void>[]
  write: (file: string, content: string) => Promise<void>
}
```

**Example:**

```js
uidoc.on('output', ({ promises, write }) => {
  promises.push(write('custom.json', JSON.stringify(uidoc.entries())))
})
```

#### page

Fired before a page is rendered.

**Event Payload:**

```ts
interface PageEvent {
  layout?: string
  page: ContextEntry
}
```

**Example:**

```js
uidoc.on('page', ({ page }) => {
  console.log(`Rendering page: ${page.title}`)
})
```

#### example

Fired before an example is rendered.

**Event Payload:**

```ts
interface ExampleEvent {
  example: ContextExample
  layout: string
}
```

**Example:**

```js
uidoc.on('example', ({ example }) => {
  console.log(`Rendering example: ${example.id}`)
})
```

### CommentBlockParser Events

| Event    | Payload | Description             |
| -------- | ------- | ----------------------- |
| `parsed` | `Block` | After a block is parsed |

**Example:**

```js
parser.on('parsed', block => {
  console.log(`Parsed block: ${block.key}`)
})
```

## Types

### Block

Represents a parsed doc block.

```ts
interface Block {
  key: string
  order: number
  location?: string
  page?: string
  section?: string
  title?: string
  description?: string
  code?: BlockCode
  example?: BlockExample
  colors?: BlockColor[]
  spaces?: BlockSpace[]
  icons?: BlockIcon[]
  hideCode?: boolean
}
```

### BlockCode

Represents a code block.

```ts
interface BlockCode {
  content: string
  title: string
  type: string
}
```

### BlockExample

Represents an example with preview and code.

```ts
interface BlockExample extends BlockCode {
  modifier?: string
  code?: string
  id?: string
  file?: string
  src?: string
}
```

### BlockColor

Represents a color definition.

```ts
interface BlockColor {
  font?: CSSColor | CSSVariable
  name: string
  text: string
  value: CSSColor | CSSVariable
}
```

### BlockSpace

Represents a spacing definition.

```ts
interface BlockSpace {
  name: string
  text: string
  value: CSSValue | CSSVariable
}
```

### BlockIcon

Represents an icon definition.

```ts
interface BlockIcon {
  name: string
  text: string
  value: CSSValue | CSSVariable
}
```

### ContextEntry

Represents a page or section in the documentation.

```ts
interface ContextEntry {
  id: string
  title: string
  order: number
  sections: ContextEntry[]
  titleLevel?: number
  description?: string
  layout?: string
  code?: BlockCode
  example?: BlockExample
  colors?: BlockColor[]
  spaces?: BlockSpace[]
  icons?: BlockIcon[]
  hideCode?: boolean
}
```

### ContextExample

Represents an example in the context.

```ts
interface ContextExample extends BlockExample {
  id: string
  type: 'html'
  src: string
  file: string
}
```

### Asset

Represents a CSS or JavaScript asset.

```ts
interface Asset {
  type: 'style' | 'script'
  src: string
  attrs?: Record<string, string>
}
```

### MenuItem

Represents a navigation menu item.

```ts
interface MenuItem {
  active: boolean
  href: string
  order: number
  text: string
}
```

### Renderer

Interface that renderers must implement.

```ts
interface Renderer {
  generate: (context: GenerateContext | GenerateExampleContext, layout?: string) => string
}
```

### TagTransformer

Interface for custom tag transformers.

```ts
interface TagTransformer {
  name: string
  transform: (block: Partial<Block>, spec: CommentSpec) => Partial<Block>
}
```

The `spec` parameter contains parsed tag data from `comment-parser`:

- `spec.name` - The name portion of the tag
- `spec.description` - The description portion
- `spec.type` - The type portion (content in braces)

## Complete Reference Table

### UIDoc Methods

| Method                        | Description                  |
| ----------------------------- | ---------------------------- |
| `sourceCreate(file, content)` | Add a source file            |
| `sourceUpdate(file, content)` | Update a source file         |
| `sourceDelete(file)`          | Remove a source file         |
| `sourceExists(file)`          | Check if source exists       |
| `output(callback)`            | Generate all output files    |
| `page(pageId)`                | Get rendered page content    |
| `example(exampleId)`          | Get rendered example content |
| `pages()`                     | Get all pages                |
| `entries()`                   | Get all entries              |
| `addAsset(asset)`             | Add page asset               |
| `addExampleAsset(asset)`      | Add example asset            |
| `replaceGenerate(name, fn)`   | Replace generate function    |
| `on(event, listener)`         | Add event listener           |
| `off(event, listener)`        | Remove event listener        |

### CommentBlockParser Methods

| Method                                | Description           |
| ------------------------------------- | --------------------- |
| `parse(context)`                      | Parse source content  |
| `registerTagTransformer(transformer)` | Register custom tag   |
| `on(event, listener)`                 | Add event listener    |
| `off(event, listener)`                | Remove event listener |

## See Also

- [Understanding Doc Blocks](../concepts/doc-blocks.md) - How doc blocks work
- [Tag Reference](./tags.md) - All available tags
- [Custom Tags Tutorial](../tutorials/custom-tags.md) - Creating custom tag transformers
