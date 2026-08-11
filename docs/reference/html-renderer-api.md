# HTML Renderer API Reference

Complete API reference for the @ui-doc/html-renderer package, including classes, methods, types, and configuration options.

## Overview

The @ui-doc/html-renderer package provides a lightweight HTML rendering engine for UI-Doc documentation. It implements the `Renderer` interface from @ui-doc/core and includes a dependency-free template system for generating interactive documentation pages.

## Classes

### HtmlRenderer

The main renderer class that implements the `Renderer` interface from @ui-doc/core.

**Constructor:**

```text
new HtmlRenderer(parser: Parser)
```

**Parameters:**

| Parameter | Required | Type     | Description                                              |
| --------- | -------- | -------- | -------------------------------------------------------- |
| parser    | Yes      | `Parser` | Template parser instance (typically `NodeParser.init()`) |

**Example:**

```ts
import { HtmlRenderer, NodeParser } from '@ui-doc/html-renderer'

const renderer = new HtmlRenderer(NodeParser.init())
```

#### Methods

##### addLayout

Register a layout template.

**Syntax:**

```text
renderer.addLayout(name: string, layout: SourceInput): HtmlRenderer
```

**Parameters:**

| Parameter | Required | Type          | Description                               |
| --------- | -------- | ------------- | ----------------------------------------- |
| name      | Yes      | `string`      | Unique identifier for the layout          |
| layout    | Yes      | `SourceInput` | Template source object or Reader instance |

**Returns:** The renderer instance for method chaining.

**Example:**

```ts
renderer.addLayout('default', {
  source: 'inline',
  content: `
    <!doctype html>
    <html lang="en">
      <head>
        <title>{{var:title}}</title>
        {{var:styles}}
      </head>
      <body>
        {{page:default}}
        {{var:scripts}}
      </body>
    </html>
  `,
})
```

##### addPage

Register a page template.

**Syntax:**

```text
renderer.addPage(name: string, page: SourceInput): HtmlRenderer
```

**Parameters:**

| Parameter | Required | Type          | Description                               |
| --------- | -------- | ------------- | ----------------------------------------- |
| name      | Yes      | `string`      | Unique identifier for the page            |
| page      | Yes      | `SourceInput` | Template source object or Reader instance |

**Returns:** The renderer instance for method chaining.

**Example:**

```ts
renderer.addPage('default', {
  source: 'inline',
  content: `
    <header>
      <h1>{{var:title}}</h1>
    </header>
    <main>
      {{for:sections}}
        {{partial:section}}
      {{/for}}
    </main>
  `,
})
```

##### addPartial

Register a partial template.

**Syntax:**

```text
renderer.addPartial(name: string, partial: SourceInput): HtmlRenderer
```

**Parameters:**

| Parameter | Required | Type          | Description                               |
| --------- | -------- | ------------- | ----------------------------------------- |
| name      | Yes      | `string`      | Unique identifier for the partial         |
| partial   | Yes      | `SourceInput` | Template source object or Reader instance |

**Returns:** The renderer instance for method chaining.

**Example:**

```ts
renderer.addPartial('section', {
  source: 'inline',
  content: `
    <section id="{{var:id}}">
      <h2>{{var:title}}</h2>
      <div>{{var:content}}</div>
    </section>
  `,
})
```

##### generate

Generate HTML output from a UI-Doc context object.

**Syntax:**

```text
renderer.generate(context: GenerateContext, layout?: string): string
```

**Parameters:**

| Parameter | Required | Type              | Description                                           |
| --------- | -------- | ----------------- | ----------------------------------------------------- |
| context   | Yes      | `GenerateContext` | UI-Doc context object containing page data and assets |
| layout    | No       | `string`          | Layout template name. Default: `'default'`            |

**Returns:** The generated HTML string.

**Example:**

```ts
const html = renderer.generate({
  title: 'My Documentation',
  page: {
    title: 'Welcome',
    content: '<p>Documentation content here</p>',
  },
  assets: [
    { type: 'style', src: '/ui-doc.css' },
    { type: 'script', src: '/ui-doc.js' },
  ],
})
```

**Throws:** `HTMLRendererError` if the specified layout template is not found.

##### page

Render a specific page template with context.

**Syntax:**

```text
renderer.page(name: string, context: RenderContext): string
```

**Parameters:**

| Parameter | Required | Type            | Description                                                 |
| --------- | -------- | --------------- | ----------------------------------------------------------- |
| name      | Yes      | `string`        | Page template name (falls back to `'default'` if not found) |
| context   | Yes      | `RenderContext` | Context object for rendering                                |

**Returns:** The rendered HTML string.

**Example:**

```ts
const pageHtml = renderer.page('default', {
  title: 'Components',
  sections: [
    { id: 'buttons', title: 'Buttons', content: '...' },
    { id: 'forms', title: 'Forms', content: '...' },
  ],
})
```

**Throws:** `HTMLRendererError` if no page template with the given name exists and no `'default'` page is registered.

##### partial

Render a specific partial template with optional context.

**Syntax:**

```text
renderer.partial(name: string, context?: RenderContext): string
```

**Parameters:**

| Parameter | Required | Type            | Description                                                    |
| --------- | -------- | --------------- | -------------------------------------------------------------- |
| name      | Yes      | `string`        | Partial template name (falls back to `'default'` if not found) |
| context   | No       | `RenderContext` | Context object for rendering. Default: `{}`                    |

**Returns:** The rendered HTML string.

**Example:**

```ts
const navHtml = renderer.partial('navigation', {
  items: [
    { href: '/home', label: 'Home' },
    { href: '/docs', label: 'Documentation' },
  ],
})
```

**Throws:** `HTMLRendererError` if no partial template with the given name exists and no `'default'` partial is registered.

### NodeParser

Template parser that processes the template syntax.

**Static Methods:**

#### init

Create and initialize a parser with all built-in template tags.

**Syntax:**

```text
NodeParser.init(): NodeParser
```

**Returns:** A configured `NodeParser` instance with all built-in tags registered.

**Example:**

```ts
import { NodeParser } from '@ui-doc/html-renderer'

const parser = NodeParser.init()
```

**Instance Methods:**

##### registerTagParser

Register a custom tag parser for extending the template syntax.

**Syntax:**

```text
parser.registerTagParser(tag: TagNodeParse): NodeParser
```

**Parameters:**

| Parameter | Required | Type           | Description                  |
| --------- | -------- | -------------- | ---------------------------- |
| tag       | Yes      | `TagNodeParse` | Tag parser definition object |

**Returns:** The parser instance for method chaining.

**Example:**

```ts
const customTag = {
  identifier: 'uppercase',
  example: '{{uppercase:text}}',
  hasContent: false,
  parse: () => ({
    addToken: token => {
      /* token processing */
    },
    create: () => {
      /* return tag node */
    },
  }),
}

parser.registerTagParser(customTag)
```

##### parse

Parse template input and return an Abstract Syntax Tree (AST).

**Syntax:**

```text
parser.parse(reader: Reader): Node
```

**Parameters:**

| Parameter | Required | Type     | Description         |
| --------- | -------- | -------- | ------------------- |
| reader    | Yes      | `Reader` | Input stream reader |

**Returns:** Root `Node` of the parsed template AST.

**Throws:** `ParserError` if the template syntax is invalid.

### TemplateLoader

Utility class for loading templates from the file system.

**Static Properties:**

#### TEMPLATES_PACKAGE

Package identifier for built-in templates.

**Syntax:**

```text
static readonly TEMPLATES_PACKAGE: string
```

**Value:** `'@ui-doc/html-renderer/templates'`

**Example:**

```ts
import { TemplateLoader } from '@ui-doc/html-renderer'

const templatePath = await fileSystem.assetLoader().packagePath(TemplateLoader.TEMPLATES_PACKAGE)
```

**Static Methods:**

##### load

Load templates from a directory into the renderer.

**Syntax:**

```text
static async load(options: {
  renderer: HtmlRenderer
  fileSystem: FileSystem
  templatePath: string
}): Promise<void>
```

**Parameters:**

| Parameter            | Required | Type           | Description                                       |
| -------------------- | -------- | -------------- | ------------------------------------------------- |
| options.renderer     | Yes      | `HtmlRenderer` | Renderer instance to load templates into          |
| options.fileSystem   | Yes      | `FileSystem`   | File system instance (typically `NodeFileSystem`) |
| options.templatePath | Yes      | `string`       | Path to templates directory                       |

**Example:**

```ts
import { HtmlRenderer, NodeParser, TemplateLoader } from '@ui-doc/html-renderer'
import { NodeFileSystem } from '@ui-doc/node'

const fileSystem = new NodeFileSystem()
const renderer = new HtmlRenderer(NodeParser.init())

await TemplateLoader.load({
  renderer,
  fileSystem,
  templatePath: './my-templates',
})
```

**Directory Structure:**

The loader expects templates organized in subdirectories:

```text
templatePath/
  layouts/
    default.html
    custom.html
  pages/
    default.html
    index.html
  partials/
    nav.html
    section.html
```

## Types

### SourceInput

Template source specification.

**Syntax:**

```ts
type SourceInput = { source: string; content: string } | Reader
```

**Properties:**

| Property | Type     | Description                                 |
| -------- | -------- | ------------------------------------------- |
| source   | `string` | Source identifier (file path or `'inline'`) |
| content  | `string` | Template content string                     |

**Example:**

```ts
const inlineSource: SourceInput = {
  source: 'inline',
  content: '<div>{{var:title}}</div>',
}

const fileSource: SourceInput = {
  source: '/path/to/template.html',
  content: '<html>...</html>',
}
```

### RenderContext

Context object passed to templates during rendering.

**Syntax:**

```ts
type RenderContext = Record<string, unknown>
```

**Description:** A flexible object containing any data needed by templates. Variables are accessed in templates using `{{var:propertyName}}`.

**Example:**

```ts
const context: RenderContext = {
  title: 'Documentation',
  sections: [{ id: 'intro', title: 'Introduction', content: '...' }],
  metadata: {
    version: '1.0.0',
    author: 'UI-Doc Team',
  },
}
```

### GenerateContext

Context object required by the `generate` method.

**Syntax:**

```ts
interface GenerateContext {
  title: string
  page: RenderContext
  assets: Asset[]
  [key: string]: unknown
}
```

**Properties:**

| Property | Required | Type            | Description                           |
| -------- | -------- | --------------- | ------------------------------------- |
| title    | Yes      | `string`        | Document title                        |
| page     | Yes      | `RenderContext` | Page-specific context data            |
| assets   | Yes      | `Asset[]`       | Array of stylesheet and script assets |
| [key]    | No       | `unknown`       | Additional custom properties          |

**Asset Type:**

```ts
interface Asset {
  type: 'style' | 'script'
  src: string
  attrs?: Record<string, string>
}
```

**Example:**

```ts
const context: GenerateContext = {
  title: 'Component Library',
  page: {
    title: 'Buttons',
    sections: [/* ... */],
  },
  assets: [
    { type: 'style', src: '/ui-doc.css' },
    { type: 'script', src: '/ui-doc.js', attrs: { defer: '' } },
  ],
}
```

### Parser

Interface for template parsers.

**Syntax:**

```ts
interface Parser {
  parse: (reader: Reader) => Node
  registerTagParser: (tag: TagNodeParse) => this
}
```

**Methods:**

| Method            | Description                       |
| ----------------- | --------------------------------- |
| parse             | Parse input stream and return AST |
| registerTagParser | Register custom tag parser        |

### TagNodeParse

Tag parser definition for custom template tags.

**Syntax:**

```ts
interface TagNodeParse {
  identifier: string
  example: string
  hasContent: boolean
  parse: () => {
    addToken: (token: TokenValue) => void
    create: () => TagNode
  }
}
```

**Properties:**

| Property   | Type          | Description                                                 |
| ---------- | ------------- | ----------------------------------------------------------- |
| identifier | `string`      | Tag name (e.g., `'var'`, `'if'`, `'for'`)                   |
| example    | `string`      | Example usage for error messages                            |
| hasContent | `boolean`     | Whether tag has content between open and close tags         |
| parse      | `() => {...}` | Factory function returning token processor and node creator |

### Reader

Input stream reader interface.

**Syntax:**

```ts
interface Reader {
  peek: (k?: PositiveInteger) => string
  consume: (k?: PositiveInteger) => string
  isEof: () => boolean
  debug: () => {
    source: string
    line: PositiveInteger
    pos: PositiveInteger
    content: string
  }
}
```

**Methods:**

| Method  | Description                                       |
| ------- | ------------------------------------------------- |
| peek    | Look ahead at next character(s) without consuming |
| consume | Read and remove next character(s) from input      |
| isEof   | Check if end of input reached                     |
| debug   | Get current position and content for debugging    |

## Errors

### HTMLRendererError

Thrown when a required template (layout, page, or partial) is not found.

**Syntax:**

```ts
class HTMLRendererError extends Error {
  constructor(message: string)
}
```

**Properties:**

| Property | Type     | Description                  |
| -------- | -------- | ---------------------------- |
| name     | `string` | Always `'HTMLRendererError'` |
| message  | `string` | Error description            |

**Example:**

```ts
import { HTMLRendererError } from '@ui-doc/html-renderer'

try {
  renderer.generate(context, 'nonexistent-layout')
} catch (error) {
  if (error instanceof HTMLRendererError) {
    console.error(`Template not found: ${error.message}`)
  }
}
```

### HTMLRendererSyntaxError

Thrown when template syntax is invalid during parsing.

**Syntax:**

```ts
class HTMLRendererSyntaxError extends SyntaxError {
  code: string
  line: number
  column: number
  source: string

  constructor(options: {
    message: string
    code: string
    column: number
    line: number
    source: string
  })
}
```

**Properties:**

| Property | Type     | Description                        |
| -------- | -------- | ---------------------------------- |
| name     | `string` | Always `'HTMLRendererSyntaxError'` |
| message  | `string` | Error description                  |
| code     | `string` | Code snippet where error occurred  |
| line     | `number` | Line number of error               |
| column   | `number` | Column number of error             |
| source   | `string` | Source file or identifier          |

**Example:**

```ts
import { HTMLRendererSyntaxError } from '@ui-doc/html-renderer'

try {
  renderer.addLayout('bad', {
    source: 'inline',
    content: '{{invalid:syntax',
  })
} catch (error) {
  if (error instanceof HTMLRendererSyntaxError) {
    console.error(`Syntax error in ${error.source}:${error.line}:${error.column}`)
    console.error(error.code)
  }
}
```

## Built-in Assets

### CSS Exports

The package provides pre-built CSS files for documentation styling.

| Export Path                            | Description               |
| -------------------------------------- | ------------------------- |
| `@ui-doc/html-renderer/ui-doc.css`     | Full CSS with source maps |
| `@ui-doc/html-renderer/ui-doc.min.css` | Minified production CSS   |

**Example:**

```ts
await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.css', './dist/ui-doc.css')
```

### JavaScript Exports

Pre-built JavaScript for interactive documentation features.

| Export Path                           | Description                       |
| ------------------------------------- | --------------------------------- |
| `@ui-doc/html-renderer/ui-doc.js`     | Full JavaScript bundle with types |
| `@ui-doc/html-renderer/ui-doc.min.js` | Minified production JavaScript    |

**Example:**

```ts
await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.js', './dist/ui-doc.js')
```

## Integration Example

Complete example showing typical usage with @ui-doc/core and @ui-doc/node.

```ts
import { UIDoc } from '@ui-doc/core'
import {
  HtmlRenderer,
  HTMLRendererSyntaxError,
  NodeParser,
  TemplateLoader,
} from '@ui-doc/html-renderer'
import { createNodeFileSystem } from '@ui-doc/node'

async function generateDocs() {
  const outputDir = './dist/docs'
  const fileSystem = createNodeFileSystem()
  const assetLoader = fileSystem.assetLoader()
  const renderer = new HtmlRenderer(NodeParser.init())

  // Load built-in templates
  const templatePath = await assetLoader.packagePath(TemplateLoader.TEMPLATES_PACKAGE)

  try {
    await TemplateLoader.load({
      renderer,
      fileSystem,
      templatePath: templatePath!,
    })
  } catch (error) {
    if (error instanceof HTMLRendererSyntaxError) {
      console.error(`Template syntax error: ${error.message}`)
      console.error(error.stack)
      return
    }
    throw error
  }

  // Create UI-Doc instance
  const uidoc = new UIDoc({ renderer })

  // Process source files
  const finder = fileSystem.createFileFinder(['src/**/*.css'])
  await finder.search(async file => {
    const content = await fileSystem.fileRead(file)
    uidoc.sourceCreate(file, content)
  })

  // Generate documentation
  await fileSystem.ensureDirectoryExists(outputDir)
  await uidoc.output(async (file, content) => {
    await fileSystem.fileWrite(`${outputDir}/${file}`, content)
  })

  // Copy required assets
  await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.css', `${outputDir}/ui-doc.css`)
  await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.js', `${outputDir}/ui-doc.js`)
}

generateDocs()
```

## See also

- [Template Syntax Guide](../how-to/template-syntax.md) - Template directive reference
- [Custom Templates Tutorial](../tutorials/custom-templates.md) - Create custom templates
- [@ui-doc/core README](../../packages/core/README.md) - Core package documentation
- [@ui-doc/node README](../../packages/node/README.md) - Node.js file system utilities
