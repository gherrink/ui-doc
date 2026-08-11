# UI-Doc API Summary

Quick reference for all UI-Doc APIs, tags, and configuration options.

## Available Tags

Tags are separated into two roles: **Placement** (where content appears) and **Display** (what content shows).

### Placement Tags

| Tag         | Syntax                         | Description                                |
| ----------- | ------------------------------ | ------------------------------------------ |
| `@page`     | `@page key Title`              | Create or reference a documentation page   |
| `@section`  | `@section key Title`           | Create a section within a page             |
| `@location` | `@location page.section Title` | Shorthand combining `@page` and `@section` |
| `@order`    | `@order number`                | Define sorting order (lower = first)       |

### Display Tags

| Tag         | Syntax                            | Description                    |
| ----------- | --------------------------------- | ------------------------------ |
| `@example`  | `@example\n<html>`                | Live preview with code display |
| `@code`     | `@code\n<html>`                   | Code block only (no preview)   |
| `@hideCode` | `@hideCode`                       | Show preview without code      |
| `@color`    | `@color {value} name description` | Define a color variable        |
| `@space`    | `@space {value} name description` | Define a spacing variable      |
| `@icon`     | `@icon {code} name description`   | Define an icon from icon font  |

## Tag Syntax Details

### @page

```css
/* Create a page */
@page buttons Buttons

/* Reference existing page */
@page buttons;
```

### @section

```css
/* Create a section on current page */
@section primary Primary Button

/* Nested sections use dot notation */
@section primary.small Small Primary Button;
```

### @location

Combines `@page` and `@section`:

```css
/* Equivalent to @page buttons + @section primary */
@location buttons.primary Primary Button

/* Nested sections */
@location buttons.primary.small Small Variant;
```

### @example and @code

```css
/* Show preview and code */
@example <button class="btn">Click me</button>

/* Override displayed code while keeping different preview */
@example
<button class="btn" style="margin: 10px">Click me</button>

@code
<button class="btn">Click me</button>;
```

### @color

```css
/* RGB values */
@color {255 0 0} --color-red | Red

/* RGB with text color for contrast */
@color {0 0 0|255 255 255} --color-black | Black

/* Hex value */
@color {#ff0000} --color-red | Red

/* CSS variable reference */
@color {--existing-var} --color-alias | Alias Color
```

### @space

```css
/* Spacing multiplier */
@space {0.5} --space-xs | Extra Small
@space {1} --space-md | Medium
@space {2} --space-xl | Extra Large
```

### @icon

```css
/* Unicode code point */
@icon {e900} --icon-arrow | Arrow

/* CSS variable reference */
@icon {--icon-check} --icon-check | Check Mark
```

## Plugin Configuration

### Vite Plugin

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    uidoc({
      source: ['src/**/*.css'], // Required: glob patterns
      output: {
        dir: 'ui-doc', // Output subdirectory
        baseUri: '/ui-doc/', // URL base path
      },
      settings: {
        texts: {
          title: 'Documentation', // Page title
          copyright: '© 2025', // Footer text
        },
        generate: {
          logo: () => 'MyLogo', // Logo content
          footerText: () => 'Footer', // Footer override
        },
      },
      assets: {
        static: './assets', // Static files to copy
        page: [/* assets for pages */],
        example: [/* assets for examples */],
      },
      templatePath: './templates', // Custom templates
    }),
  ],
})
```

### Rollup Plugin

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      // Same options as Vite plugin
    }),
  ],
}
```

## Asset Configuration

### Asset from Vite/Rollup Input

```js
uidoc({
  assets: {
    example: [
      {
        name: 'app', // Must match input key
        fromInput: true,
        attrs: { type: 'module' },
      },
    ],
  },
})
```

### Asset from File

```js
uidoc({
  assets: {
    page: [
      {
        name: 'custom.css',
        file: './src/docs/custom.css',
      },
    ],
  },
})
```

### Asset from npm Package

```js
uidoc({
  assets: {
    example: [
      {
        name: 'normalize.css',
        dependency: 'normalize.css',
      },
    ],
  },
})
```

### Inline Asset

```js
uidoc({
  assets: {
    page: [
      {
        name: 'inline.js',
        source: 'console.log("loaded")',
      },
    ],
  },
})
```

## UIDoc Core API

### Creating a UIDoc Instance

```js
import { UIDoc } from '@ui-doc/core'
import { HtmlRenderer, NodeParser } from '@ui-doc/html-renderer'

const renderer = new HtmlRenderer(NodeParser.init())
const uidoc = new UIDoc({ renderer })
```

### Processing Sources

```js
// Add a source file
uidoc.sourceCreate(filePath, content)

// Update a source file
uidoc.sourceUpdate(filePath, content)

// Remove a source file
uidoc.sourceDelete(filePath)
```

### Outputting Documentation

```js
await uidoc.output(async (fileName, content) => {
  await fs.writeFile(`./dist/${fileName}`, content)
})
```

### Events

```js
// Listen to context entry creation
uidoc.on('context-entry', ({ entry }) => {
  entry.order = 100
})

// Listen to page output
uidoc.on('page', ({ page }) => {
  console.log(`Rendering page: ${page.title}`)
})

// Available events: context-entry, example, output, page, source
```

### Custom Generate Functions

```js
const uidoc = new UIDoc({
  renderer,
  generate: {
    logo: () => '<img src="logo.svg" alt="Logo">',
    footerText: () => '© 2025 MyCompany',
    name: () => 'My Documentation',
    homeLink: () => '/',
    pageLink: page => `/${page.key}.html`,
    pageTitle: page => `${page.title} | Docs`,
    exampleTitle: example => example.title,
    menu: (menu, pages) => menu,
    resolve: uri => uri,
  },
})
```

## HTML Renderer API

### Template Syntax

```html
<!-- Variables -->
{{var:title}} {{var:page.content}}

<!-- Conditionals -->
{{if:showNav}}
<nav>...</nav>
{{/if}}

<!-- Loops -->
{{for:items}}
<li>{{var:_loop.value}}</li>
{{/for}}

<!-- Include page template -->
{{page:default}}

<!-- Include partial -->
{{partial:nav}}
```

### Adding Templates

```js
renderer.addLayout('default', {
  source: 'layout.html',
  content: '<!doctype html>...',
})

renderer.addPage('default', {
  source: 'page.html',
  content: '<article>...</article>',
})

renderer.addPartial('nav', {
  source: 'nav.html',
  content: '<nav>...</nav>',
})
```

## Common Patterns

### Conditional Base URI

```js
export default defineConfig(({ command }) => ({
  plugins: [
    uidoc({
      output: {
        baseUri: command === 'serve' ? undefined : '.',
      },
    }),
  ],
}))
```

### Multiple Source Types

```js
uidoc({
  source: ['src/**/*.css', 'src/**/*.js', 'src/**/*.ts'],
})
```

### Custom Highlight Theme

```js
uidoc({
  assets: {
    highlightTheme: 'github-dark',
  },
})
```
