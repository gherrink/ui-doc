# Vite plugin options

Complete reference for configuring the `@ui-doc/vite` plugin.

## Overview

The `@ui-doc/vite` plugin accepts all options from `@ui-doc/rollup` and adds Vite-specific defaults. This reference documents all available configuration options for generating UI documentation in Vite projects.

## Core options

### source

**Required**

Array of glob patterns to find source files containing doc blocks.

**Type:** `string[]`

**Example:**

```js
uidoc({
  source: ['src/**/*.css', 'src/**/*.js'],
})
```

**Output:**

UI-Doc will search all CSS and JS files in the `src/` directory for documentation blocks.

### renderer

Custom renderer instance for generating documentation output.

**Type:** `Renderer`

**Default:** `HtmlRenderer` from `@ui-doc/html-renderer`

**Example:**

```js
import { HtmlRenderer } from '@ui-doc/html-renderer'

const customRenderer = new HtmlRenderer()

uidoc({
  source: ['src/**/*.css'],
  renderer: customRenderer,
})
```

### blockParser

Custom block parser instance for parsing doc blocks.

**Type:** `BlockParser`

**Default:** `CommentBlockParser` from `@ui-doc/core`

**Example:**

```js
import { CommentBlockParser } from '@ui-doc/core'

const customParser = new CommentBlockParser()

uidoc({
  source: ['src/**/*.css'],
  blockParser: customParser,
})
```

### templatePath

Path to custom templates directory for overriding or extending default renderer templates.

**Type:** `string`

**Default:** `undefined` (uses built-in templates)

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  templatePath: 'ui-doc/templates',
})
```

**Output:**

UI-Doc will load templates from `ui-doc/templates/` directory and use them to override default templates with matching filenames.

## Output options

Configure where and how UI-Doc generates documentation files.

### output.dir

Subdirectory within Vite's output directory for UI-Doc files.

**Type:** `string`

**Default:** `'ui-doc'`

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  output: {
    dir: 'docs',
  },
})
```

**Output:**

Documentation is generated in `dist/docs/` instead of `dist/ui-doc/`.

### output.baseUri

Base URI for all UI-Doc links and assets. Use `'.'` for relative URLs in build output.

**Type:** `string`

**Default:** Same as `output.dir`

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  output: {
    baseUri: '/documentation/',
  },
})
```

**Output:**

All documentation links use `/documentation/` prefix. During development, documentation is served at `http://localhost:5173/documentation/`.

**Example (relative URLs):**

```js
export default defineConfig(({ command }) => ({
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      output: {
        baseUri: command === 'serve' ? undefined : '.',
      },
    }),
  ],
}))
```

**Output:**

Uses absolute paths in dev mode, relative paths in build output.

> **Warning:** Do not set `baseUri` to `'.'` in development mode. This will break the dev server. Use conditional configuration as shown above.

## Settings options

UI-Doc specific settings that control content generation.

### settings.generate

Functions that generate custom content for documentation pages.

**Type:** `Partial<GenerateFunctions>`

**Default:** Built-in functions

**Available functions:**

| Function | Type | Description |
|----------|------|-------------|
| `exampleTitle` | `(example: ContextExample) => string` | Generate title for example pages |
| `footerText` | `() => string` | Generate footer text |
| `homeLink` | `() => string` | Generate home page link |
| `logo` | `() => string` | Generate logo HTML |
| `menu` | `(menu, pages) => menu` | Customize menu structure |
| `name` | `() => string` | Generate name for documentation |
| `pageLink` | `(page: ContextEntry) => string` | Generate page links |
| `pageTitle` | `(page: ContextEntry) => string` | Generate page titles |
| `resolve` | `(uri: string, type: string) => string` | Resolve asset URLs |

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  settings: {
    generate: {
      logo: () => '<img src="logo.svg" alt="Logo">',
      footerText: () => 'Powered by UI-Doc',
      homeLink: () => '/',
    },
  },
})
```

### settings.texts

Text strings for title, copyright, and other static content.

**Type:** `Partial<Texts>`

**Default:** `{ title: '', copyright: '' }`

**Available texts:**

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string` | Documentation title shown in pages |
| `copyright` | `string` | Copyright notice shown in footer |

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  settings: {
    texts: {
      title: 'Component Library',
      copyright: '© 2025 My Company',
    },
  },
})
```

## Assets options

Control which assets are included in documentation pages and examples.

### assets.static

Path to static assets folder. Files are copied to UI-Doc output directory.

**Type:** `string`

**Default:** `undefined`

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    static: './ui-doc/assets',
  },
})
```

**Output:**

All files from `ui-doc/assets/` are copied to `dist/ui-doc/` during build.

### assets.styleAsset

Name of UI-Doc stylesheet. Set to `false` to disable default styles.

**Type:** `false | string`

**Default:** `'ui-doc.css'`

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    styleAsset: false,
  },
})
```

### assets.highlightStyle

Name of highlight.js stylesheet. Set to `false` to disable syntax highlighting styles.

**Type:** `false | string`

**Default:** `'highlight.css'`

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    highlightStyle: false,
  },
})
```

### assets.highlightTheme

Highlight.js theme name for syntax highlighting.

**Type:** `string`

**Default:** `'default'`

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    highlightTheme: 'github-dark',
  },
})
```

**Available themes:**

See [highlight.js themes](https://github.com/highlightjs/highlight.js/tree/main/src/styles) for all available theme names.

### assets.highlightScript

Name of highlight.js script. Set to `false` to disable syntax highlighting.

**Type:** `false | string`

**Default:** `'highlight.js'`

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    highlightScript: false,
  },
})
```

### assets.page

Custom scripts and styles for documentation pages.

**Type:** `AssetOption[]`

**Default:** `[]`

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    page: [
      {
        name: 'ui-doc-custom',
        fromInput: true,
      },
      {
        name: 'analytics.js',
        file: 'src/docs/analytics.js',
        attrs: {
          type: 'module',
        },
      },
    ],
  },
})
```

**Output:**

Custom assets are included in all documentation pages (not example previews).

### assets.example

Custom scripts and styles for example previews.

**Type:** `AssetOption[]`

**Default:** `[]`

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    example: [
      {
        name: 'app',
        fromInput: true,
        attrs: {
          type: 'module',
        },
      },
    ],
  },
})
```

**Output:**

Custom assets are included in example preview iframes.

## AssetOption interface

Assets can be loaded from different sources. Each asset requires a `name` and one source property.

### name

Asset name or file name.

**Type:** `string | (() => string)`

**Required:** Yes

**Example:**

```text
{
  name: 'app.css',
}
```

### fromInput

Load asset from Vite's input configuration. The `name` must match a key in `rollupOptions.input`.

**Type:** `boolean | ((asset: AssetResolved) => boolean)`

**Default:** `false`

**Example:**

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: 'src/main.js',
      },
    },
  },
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        example: [
          {
            name: 'app', // Matches input key
            fromInput: true,
          },
        ],
      },
    }),
  ],
})
```

### file

Load asset from file system path (relative to project root).

**Type:** `string | (() => string)`

**Example:**

```text
{
  name: 'custom.css',
  file: './src/docs/custom.css',
}
```

### dependency

Load asset from node_modules package.

**Type:** `string | (() => string)`

**Example:**

```text
{
  name: 'normalize.css',
  dependency: 'normalize.css',
}
```

### source

Provide asset source directly as string or bytes.

**Type:** `string | Uint8Array | (() => string)`

**Example:**

```text
{
  name: 'inline.css',
  source: 'body { margin: 0; }',
}
```

### attrs

HTML attributes to add to the asset tag (script or link element).

**Type:** `Record<string, string>`

**Default:** `{}`

**Example:**

```text
{
  name: 'app.js',
  fromInput: true,
  attrs: {
    type: 'module',
    defer: 'true',
  },
}
```

**Output:**

```html
<script src="/assets/app-abc123.js" type="module" defer="true"></script>
```

### useAssetFileNames

Allow Rollup to apply the `output.assetFileNames` pattern (e.g., for cache-busting hashes) instead of using an explicit file name.

**Type:** `boolean`

**Default:** `false`

**Example:**

```text
{
  name: 'custom-styles.css',
  file: './src/custom.css',
  useAssetFileNames: true,
}
```

**Output:**

With `assetFileNames: 'assets/[name]-[hash][extname]'` configured, the asset is emitted as `assets/custom-styles-abc123.css` instead of `custom-styles.css`.

**Notes:**

- Only applies to custom assets in `assets.page` and `assets.example`
- Built-in assets (ui-doc.css, highlight.js) always use explicit file names
- HTML documentation pages always use explicit file names
- Useful for cache busting and consistent asset naming patterns

## Complete options example

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'app': 'js/app.js',
        'ui-doc-custom': 'ui-doc/custom.css',
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },

  plugins: [
    uidoc({
      // Source files to parse
      source: ['css/**/*.css', 'js/**/*.js'],

      // Output configuration
      output: {
        dir: 'ui-doc',
        baseUri: command === 'serve' ? undefined : '.',
      },

      // Custom templates
      templatePath: 'ui-doc/templates',

      // UI-Doc settings
      settings: {
        generate: {
          logo: () => '<img src="logo.svg" alt="Logo">',
          footerText: () => '© 2025 My Company',
        },
        texts: {
          title: 'Component Library',
          copyright: '© 2025 My Company',
        },
      },

      // Assets
      assets: {
        static: './ui-doc/assets',
        highlightTheme: 'github-dark',
        page: [
          {
            name: 'ui-doc-custom',
            fromInput: true,
          },
          {
            name: 'theme.css',
            file: './src/theme.css',
            useAssetFileNames: true, // Use hashed filename
          },
        ],
        example: [
          {
            name: 'app',
            fromInput: true,
            attrs: {
              type: 'module',
            },
          },
        ],
      },
    }),
  ],
}))
```

## See also

- [Vite plugin README](/home/maurice/Projects/gherrink-ui-doc/packages/vite/README.md) - Installation and usage guide
- [Rollup plugin options](/home/maurice/Projects/gherrink-ui-doc/packages/rollup/README.md#options) - Detailed option descriptions
- [@ui-doc/core documentation](/home/maurice/Projects/gherrink-ui-doc/packages/core/README.md) - Doc block syntax and tags
