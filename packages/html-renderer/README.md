# @ui-doc/html-renderer

HTML renderer for UI-Doc that converts UI-Doc context objects into interactive HTML documentation pages. It implements the `Renderer` interface from `@ui-doc/core` and includes a built-in template engine with zero dependencies.

## Overview

The HTML renderer provides:

- **Template Engine** - A lightweight, dependency-free template system with custom syntax
- **Built-in Templates** - Ready-to-use layouts, pages, and partials for documentation
- **Asset Management** - Pre-built CSS and JavaScript for documentation styling
- **Extensibility** - Custom templates and styling support

## Installation

```bash
npm install @ui-doc/html-renderer @ui-doc/core
```

## Quick Start

### Basic Usage

```ts
import { HtmlRenderer, NodeParser } from '@ui-doc/html-renderer'

// Create a renderer instance
const renderer = new HtmlRenderer(NodeParser.init())

// Add templates
renderer.addLayout('default', {
  source: 'inline',
  content: `
    <html>
      <head>
        <title>{{var:title}}</title>
      </head>
      <body>
        {{page:default}}
      </body>
    </html>
  `,
})

renderer.addPage('default', {
  source: 'inline',
  content: `
    <h1>{{var:title}}</h1>
    <div>{{var:content}}</div>
  `,
})

// Generate HTML from context
const html = renderer.generate({
  title: 'My Documentation',
  page: {
    title: 'Welcome',
    content: '<p>Documentation content here</p>',
  },
  assets: [],
})
```

### Integration with UI-Doc

```ts
import { UIDoc } from '@ui-doc/core'
import { HtmlRenderer, NodeParser, TemplateLoader } from '@ui-doc/html-renderer'
import { NodeFileSystem } from '@ui-doc/node'

const fileSystem = new NodeFileSystem()
const renderer = new HtmlRenderer(NodeParser.init())

// Load built-in templates
const templatePath = await fileSystem.assetLoader().packagePath(TemplateLoader.TEMPLATES_PACKAGE)
await TemplateLoader.load({ renderer, fileSystem, templatePath })

// Create UI-Doc instance
const uidoc = new UIDoc({ renderer })

// Process source files
uidoc.sourceCreate('path/to/source.css', await fileSystem.fileRead('path/to/source.css'))

// Output documentation
await uidoc.output(async (file, content) => {
  await fileSystem.fileWrite(`./dist/${file}`, content)
})

// Copy required assets
const assetLoader = fileSystem.assetLoader()
await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.css', './dist/ui-doc.css')
await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.js', './dist/ui-doc.js')
```

## Template Syntax

The template engine uses double curly braces `{{...}}` for directives.

### Variables

Output values from the context:

```html
<h1>{{var:title}}</h1>
<p>{{var:description}}</p>

<!-- Access nested properties with dot notation -->
<div>{{var:page.content}}</div>

<!-- Escape HTML output -->
<div>{{var:userInput escape}}</div>
```

### Conditionals

Render content conditionally:

```html
{{if:showContent}}
<p>This is visible when showContent is truthy</p>
{{/if}}
```

Supported comparison operators: `===`, `==`, `!==`, `!=`, `<`, `<=`, `>`, `>=`

```html
{{if:status === "active"}}
<span>Active</span>
{{/if}} {{if:count > 5}}
<span>More than 5 items</span>
{{/if}}
```

### Loops

#### Array Loops

```html
<!-- Context: {"items": ["apple", "banana", "cherry"]} -->
<ul>
  {{for:items}}
  <li>{{var:_loop.value}} (index: {{var:_loop.index}})</li>
  {{/for}}
</ul>

<!-- Output: -->
<ul>
  <li>apple (index: 0)</li>
  <li>banana (index: 1)</li>
  <li>cherry (index: 2)</li>
</ul>
```

#### Object Loops

```html
<!-- Context: {"colors": {"red": "#f00", "green": "#0f0", "blue": "#00f"}} -->
<ul>
  {{for:colors}}
  <li>{{var:_loop.key}}: {{var:_loop.value}}</li>
  {{/for}}
</ul>

<!-- Output: -->
<ul>
  <li>red: #f00</li>
  <li>green: #0f0</li>
  <li>blue: #00f</li>
</ul>
```

#### Looping Over Object Arrays

```html
<!-- Context: {"sections": [{"title": "Intro", "content": "..."}, {"title": "Details", "content": "..."}]} -->
{{for:sections}}
<section>
  <h2>{{var:title}}</h2>
  <div>{{var:content}}</div>
</section>
{{/for}}
```

Loop variables available in `_loop`:

- `_loop.value` - Current item value
- `_loop.index` - Current iteration index (0-based)
- `_loop.key` - Current key (for object loops)

### Pages

Render registered page templates with optional context switching:

```html
<!-- Use the default page template -->
{{page}}

<!-- Use a specific page template -->
{{page:default}}

<!-- Use a page template with different context -->
{{page:default page}}
```

### Partials

Include reusable template fragments:

```html
<!-- Include a partial -->
{{partial:nav-main}}

<!-- Include a partial with different context -->
{{partial:section currentSection}}
```

### Debug

Output context as JSON for debugging:

```html
<!-- Output entire context -->
{{debug}}

<!-- Output specific context property -->
{{debug:page}}
```

## Template Types

### Layouts

Define the overall HTML structure. A layout typically includes the `<html>`, `<head>`, and `<body>` tags.

```ts
renderer.addLayout('default', {
  source: 'my-layout.html',
  content: `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
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

### Pages

Define page-specific content structures:

```ts
renderer.addPage('default', {
  source: 'my-page.html',
  content: `
    <header>
      <h1>{{var:title}}</h1>
      {{if:description}}
        <p>{{var:description}}</p>
      {{/if}}
    </header>
    <main>
      {{for:sections}}
        {{partial:section}}
      {{/for}}
    </main>
  `,
})
```

### Partials

Create reusable template components:

```ts
renderer.addPartial('section', {
  source: 'section.html',
  content: `
    <section id="{{var:id}}">
      <h2>{{var:title}}</h2>
      <div>{{var:content}}</div>
    </section>
  `,
})
```

## Loading Templates

### From Files

Use `TemplateLoader` to load templates from the file system:

```ts
import { TemplateLoader } from '@ui-doc/html-renderer'
import { NodeFileSystem } from '@ui-doc/node'

const fileSystem = new NodeFileSystem()

// Load templates from a directory
await TemplateLoader.load({
  renderer,
  fileSystem,
  templatePath: './my-templates',
})
```

The loader expects this directory structure:

```text
my-templates/
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

### Using Built-in Templates

The package includes ready-to-use templates:

```ts
const templatePath = await fileSystem.assetLoader().packagePath(TemplateLoader.TEMPLATES_PACKAGE)
await TemplateLoader.load({ renderer, fileSystem, templatePath })
```

## Built-in Assets

The package provides pre-built CSS and JavaScript for documentation styling.

### CSS

```bash
# Full CSS
@ui-doc/html-renderer/ui-doc.css

# Minified CSS
@ui-doc/html-renderer/ui-doc.min.css
```

### JavaScript

```bash
# Full JavaScript
@ui-doc/html-renderer/ui-doc.js

# Minified JavaScript (for use in browsers)
@ui-doc/html-renderer/ui-doc.min.js
```

### Copying Assets

```ts
const assetLoader = fileSystem.assetLoader()

await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.css', './dist/ui-doc.css')
await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.js', './dist/ui-doc.js')
```

### Syntax Highlighting

The built-in templates use highlight.js for code syntax highlighting. Include it in your output:

```ts
await assetLoader.copy('@highlightjs/cdn-assets/styles/default.min.css', './dist/highlight.css')
await assetLoader.copy('@highlightjs/cdn-assets/highlight.min.js', './dist/highlight.js')
```

## API Reference

### HtmlRenderer

The main renderer class implementing the `Renderer` interface.

#### Constructor

```text
new HtmlRenderer(parser: Parser)
```

- `parser` - A `Parser` instance (typically `NodeParser.init()`)

#### Methods

##### addLayout(name, layout)

Register a layout template.

```text
renderer.addLayout(name: string, layout: SourceInput): HtmlRenderer
```

- `name` - Unique identifier for the layout
- `layout` - Template source (object with `source` and `content` properties, or a `Reader` instance)
- Returns the renderer instance for chaining

##### addPage(name, page)

Register a page template.

```text
renderer.addPage(name: string, page: SourceInput): HtmlRenderer
```

- `name` - Unique identifier for the page
- `page` - Template source
- Returns the renderer instance for chaining

##### addPartial(name, partial)

Register a partial template.

```text
renderer.addPartial(name: string, partial: SourceInput): HtmlRenderer
```

- `name` - Unique identifier for the partial
- `partial` - Template source
- Returns the renderer instance for chaining

##### generate(context, layout?)

Generate HTML from a context object.

```text
renderer.generate(context: GenerateContext, layout?: string): string
```

- `context` - The UI-Doc context object to render
- `layout` - Optional layout name (defaults to `'default'`)
- Returns the generated HTML string

The `GenerateContext` includes:

- `title` - Document title
- `page` - Page context object
- `assets` - Array of asset objects with `type`, `src`, and optional `attrs`
- Additional properties from your UI-Doc configuration

##### page(name, context)

Render a specific page template with context.

```text
renderer.page(name: string, context: RenderContext): string
```

- `name` - Page template name (falls back to `'default'` if not found)
- `context` - Context object for rendering
- Returns the rendered HTML string

##### partial(name, context?)

Render a specific partial template with optional context.

```text
renderer.partial(name: string, context?: RenderContext): string
```

- `name` - Partial template name (falls back to `'default'` if not found)
- `context` - Optional context object (defaults to empty object)
- Returns the rendered HTML string

### NodeParser

Parser for the template syntax.

#### Static Methods

##### init()

Create and initialize a parser with all built-in tags.

```text
NodeParser.init(): NodeParser
```

Returns a configured `NodeParser` instance.

#### Methods

##### registerTagParser(tag)

Register a custom tag parser.

```text
parser.registerTagParser(tag: TagNodeParse): NodeParser
```

- `tag` - Tag parser definition
- Returns the parser instance for chaining

### TemplateLoader

Utility for loading templates from the file system.

#### Static Properties

##### TEMPLATES_PACKAGE

```text
static readonly TEMPLATES_PACKAGE: string
```

Package identifier for built-in templates: `'@ui-doc/html-renderer/templates'`

#### Static Methods

##### load(options)

Load templates from a directory.

```text
static async load(options: {
  renderer: HtmlRenderer
  fileSystem: FileSystem
  templatePath: string
}): Promise<void>
```

- `options.renderer` - The renderer to load templates into
- `options.fileSystem` - File system instance (typically `NodeFileSystem`)
- `options.templatePath` - Path to the templates directory

## Error Handling

The renderer throws specific errors for better debugging:

### HTMLRendererError

Thrown when a required template is not found.

```ts
try {
  renderer.generate(context, 'nonexistent-layout')
} catch (error) {
  if (error instanceof HTMLRendererError) {
    console.error(`Template error: ${error.message}`)
  }
}
```

### HTMLRendererSyntaxError

Thrown when template syntax is invalid.

```ts
import { HTMLRendererSyntaxError } from '@ui-doc/html-renderer'

try {
  renderer.addLayout('bad', {
    source: 'inline',
    content: '{{invalid:syntax',
  })
} catch (error) {
  if (error instanceof HTMLRendererSyntaxError) {
    console.error(`Syntax error at line ${error.line}, column ${error.column}`)
    console.error(error.message)
  }
}
```

Properties:

- `message` - Error description
- `source` - Source identifier
- `line` - Line number where error occurred
- `column` - Column number where error occurred
- `code` - The problematic code snippet

## Custom Templates

You can create custom templates to match your design requirements.

### Example Custom Layout

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{var:title}}</title>
    {{var:styles}}
    <link rel="stylesheet" href="custom-styles.css" />
  </head>
  <body class="custom-theme">
    <header class="site-header">
      <nav>{{partial:main-nav}}</nav>
    </header>

    <main class="site-content">{{page:page.id page}}</main>

    <footer class="site-footer">
      <p>&copy; 2024 {{var:name}}</p>
    </footer>

    {{var:scripts}}
    <script src="custom-scripts.js"></script>
  </body>
</html>
```

### Example Custom Page

```html
<article class="documentation-page">
  <header class="page-header">
    <h1>{{var:title}}</h1>
    {{if:description}}
    <div class="page-description">{{var:description}}</div>
    {{/if}}
  </header>

  {{if:sections}}
  <div class="page-sections">{{for:sections}} {{partial:custom-section}} {{/for}}</div>
  {{/if}}
</article>
```

## Integration with Build Tools

While you can use the HTML renderer directly, it's typically used through build tool plugins:

- **Rollup** - Use [`@ui-doc/rollup`](../rollup/README.md)
- **Vite** - Use [`@ui-doc/vite`](../vite/README.md)

These plugins handle template loading, asset copying, and file watching automatically.

## TypeScript Support

The package includes full TypeScript definitions. All exported types are available for import:

```ts
import type {
  Parser,
  RenderContext,
  Renderer,
  SourceInput,
  TagNodeParse,
} from '@ui-doc/html-renderer'
```

## Requirements

- Node.js 20.19, 22.12, or 24 and later
- `@ui-doc/core` (peer dependency)

## License

See [LICENSE.md](../../LICENSE.md) for license information.
