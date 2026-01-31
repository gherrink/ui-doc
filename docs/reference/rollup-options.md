# Rollup plugin options reference

Complete reference for all configuration options available in the `@ui-doc/rollup` plugin.

## Overview

The `@ui-doc/rollup` plugin accepts a configuration object that controls how documentation is generated from your source files. This reference documents every available option, its type, default value, and usage.

## Core options

### source

Glob patterns to find source files containing doc blocks.

**Type:** `string[]`

**Required:** Yes

**Example:**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css', 'src/**/*.js'],
    }),
  ],
}
```

**Notes:**

- Uses [picomatch](https://github.com/micromatch/picomatch) syntax
- Supports multiple patterns
- Files matching these patterns are watched during development
- Only files with valid doc blocks generate documentation

### renderer

Custom renderer instance for generating documentation output.

**Type:** `Renderer`

**Required:** No

**Default:** `HtmlRenderer` from `@ui-doc/html-renderer`

**Example:**

```js
import { HtmlRenderer } from '@ui-doc/html-renderer'
import uidoc from '@ui-doc/rollup'

const customRenderer = new HtmlRenderer()

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      renderer: customRenderer,
    }),
  ],
}
```

**Notes:**

- Custom renderers must implement the `Renderer` interface
- See [@ui-doc/core documentation](../../packages/core/README.md) for renderer interface details

### blockParser

Custom block parser instance for parsing doc blocks.

**Type:** `BlockParser`

**Required:** No

**Default:** `CommentBlockParser` from `@ui-doc/core`

**Example:**

```js
import { CommentBlockParser } from '@ui-doc/core'
import uidoc from '@ui-doc/rollup'

const customParser = new CommentBlockParser()

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      blockParser: customParser,
    }),
  ],
}
```

**Notes:**

- Custom parsers must implement the `BlockParser` interface
- Use custom parsers to support non-standard comment formats
- See [@ui-doc/core documentation](../../packages/core/README.md) for parser interface details

### templatePath

Path to custom templates directory for overriding default renderer templates.

**Type:** `string`

**Required:** No

**Default:** `undefined` (uses default templates)

**Example:**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      templatePath: 'ui-doc/templates',
    }),
  ],
}
```

**Notes:**

- Templates are automatically watched for changes during development
- Directory structure should match default renderer expectations
- See [@ui-doc/html-renderer documentation](../../packages/html-renderer/README.md) for template format

## Output options

Configure where and how documentation files are generated.

### output.dir

Subdirectory within Rollup's output directory for UI-Doc files.

**Type:** `string`

**Required:** No

**Default:** `''` (empty string - generates at root of Rollup output directory)

**Example:**

```js
import uidoc from '@ui-doc/rollup'

export default {
  output: {
    dir: 'dist',
  },
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      output: {
        dir: 'ui-doc', // Documentation goes to dist/ui-doc/
      },
    }),
  ],
}
```

**Notes:**

- Path is relative to Rollup's output directory
- Assets from input are automatically copied to this directory
- Do not include leading or trailing slashes

### output.baseUri

Base URI for all UI-Doc links in generated documentation.

**Type:** `string`

**Required:** No

**Default:** Same as `output.dir`

**Example:**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      output: {
        dir: 'ui-doc',
        baseUri: '/styleguide/', // All links use /styleguide/ prefix
      },
    }),
  ],
}
```

**Example (relative URLs):**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      output: {
        dir: 'docs',
        baseUri: '.', // Use relative URLs for portable documentation
      },
    }),
  ],
}
```

**Notes:**

- Use `'.'` for relative URLs (portable documentation)
- Use absolute paths like `'/docs/'` for fixed deployment locations
- Should match your web server configuration

## Settings options

UI-Doc specific settings that control content generation.

### settings.generate

Functions that generate content for documentation pages.

**Type:** `Partial<GenerateFunctions>`

**Required:** No

**Default:** Default implementations from `@ui-doc/core`

**Interface:**

```ts
interface GenerateFunctions {
  exampleTitle: (example: ContextExample) => string
  footerText: () => string
  homeLink: () => string
  logo: () => string
  menu: (menu: Context['menu'], pages: Context['pages']) => Context['menu']
  name: () => string
  pageLink: (page: ContextEntry) => string
  pageTitle: (page: ContextEntry) => string
  resolve: (uri: string, type: string) => string
}
```

**Example:**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      settings: {
        generate: {
          logo: () => '<img src="logo.svg" alt="Logo">',
          footerText: () => 'Powered by UI-Doc',
          homeLink: () => '/',
        },
      },
    }),
  ],
}
```

**Notes:**

- Only override functions you need to customize
- Functions must return strings (HTML allowed for some functions)
- See [@ui-doc/core documentation](../../packages/core/README.md#generate-functions) for detailed function specifications

### settings.texts

Text strings for title, copyright, and other content.

**Type:** `Partial<Texts>`

**Required:** No

**Default:** Empty strings

**Interface:**

```ts
interface Texts {
  copyright: string
  title: string
}
```

**Example:**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      settings: {
        texts: {
          title: 'Design System Documentation',
          copyright: '© 2025 MyCompany',
        },
      },
    }),
  ],
}
```

**Notes:**

- `title` appears in page titles and header
- `copyright` appears in footer

## Assets options

Control which assets are included in documentation pages and examples.

### assets.static

Path to static assets folder. Files are copied to UI-Doc output directory.

**Type:** `string`

**Required:** No

**Default:** `undefined` (no static assets)

**Example:**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        static: './ui-doc/assets', // Copies entire directory
      },
    }),
  ],
}
```

**Notes:**

- All files in directory are copied recursively
- Useful for images, fonts, and other static resources
- Files are available at the same relative path in documentation

### assets.styleAsset

Name of UI-Doc stylesheet.

**Type:** `false | string`

**Required:** No

**Default:** `'ui-doc.css'`

**Example (custom name):**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        styleAsset: 'custom-ui-doc.css',
      },
    }),
  ],
}
```

**Example (disable):**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        styleAsset: false, // No UI-Doc stylesheet
      },
    }),
  ],
}
```

**Notes:**

- Set to `false` to provide your own stylesheet via `assets.page`
- Default stylesheet provides base documentation page styling

### assets.highlightStyle

Name of highlight.js stylesheet.

**Type:** `false | string`

**Required:** No

**Default:** `'highlight.css'`

**Example (disable):**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        highlightStyle: false, // No syntax highlighting stylesheet
      },
    }),
  ],
}
```

**Notes:**

- Set to `false` if not using code examples or providing custom highlighting
- Requires `@highlightjs/cdn-assets` package unless disabled

### assets.highlightTheme

Highlight.js theme name for code syntax highlighting.

**Type:** `string`

**Required:** No

**Default:** `'default'`

**Example:**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        highlightTheme: 'github-dark',
      },
    }),
  ],
}
```

**Notes:**

- See [available themes](https://github.com/highlightjs/highlight.js/tree/main/src/styles)
- Theme name matches the CSS file name without extension
- Requires `@highlightjs/cdn-assets` package

### assets.highlightScript

Name of highlight.js script.

**Type:** `false | string`

**Required:** No

**Default:** `'highlight.js'`

**Example (disable):**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        highlightScript: false, // No syntax highlighting script
      },
    }),
  ],
}
```

**Notes:**

- Set to `false` if not using code examples or providing custom highlighting
- Must be disabled together with `highlightStyle` to avoid requiring `@highlightjs/cdn-assets`

### assets.page

Custom scripts and styles for documentation pages.

**Type:** `AssetOption[]`

**Required:** No

**Default:** `[]` (empty array)

**Example (from input):**

```js
import uidoc from '@ui-doc/rollup'

export default {
  input: {
    'app': 'src/index.js',
    'ui-doc-custom': 'ui-doc/custom.css',
  },
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        page: [
          {
            name: 'ui-doc-custom',
            fromInput: true, // Load from Rollup input
          },
        ],
      },
    }),
  ],
}
```

**Example (from file):**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        page: [
          {
            name: 'custom-page.js',
            file: 'src/docs/page-script.js',
            attrs: {
              type: 'module',
            },
          },
        ],
      },
    }),
  ],
}
```

**Example (inline source):**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        page: [
          {
            name: 'analytics.js',
            source: 'console.log("Page loaded")',
          },
        ],
      },
    }),
  ],
}
```

**Notes:**

- Assets are included in documentation pages (not in example iframes)
- Use for custom page styling, analytics, or interactive features
- See [AssetOption interface](#assetoption-interface) for all properties

### assets.example

Custom scripts and styles for example previews.

**Type:** `AssetOption[]`

**Required:** No

**Default:** `[]` (empty array)

**Example (from input):**

```js
import uidoc from '@ui-doc/rollup'

export default {
  input: {
    app: 'src/index.js',
    theme: 'src/theme.css',
  },
  plugins: [
    uidoc({
      source: ['src/**/*.js'],
      assets: {
        example: [
          {
            name: 'app',
            fromInput: true,
          },
          {
            name: 'theme',
            fromInput: true,
          },
        ],
      },
    }),
  ],
}
```

**Example (from package):**

```js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        example: [
          {
            name: 'normalize.css',
            dependency: 'normalize.css',
          },
        ],
      },
    }),
  ],
}
```

**Notes:**

- Assets are included in example preview iframes
- Use for application styles, scripts, or libraries needed by examples
- See [AssetOption interface](#assetoption-interface) for all properties

## AssetOption interface

Configuration object for custom assets loaded in documentation pages or examples.

**Type definition:**

```ts
interface AssetOption {
  name: string | (() => string)
  fromInput?: boolean | ((asset: AssetResolved) => boolean)
  file?: string | (() => string)
  dependency?: string | (() => string)
  source?: string | Uint8Array | (() => string)
  attrs?: Record<string, string>
}
```

### name

Asset name or file name.

**Type:** `string | (() => string)`

**Required:** Yes

**Example:**

```text
{
  name: 'custom.css',
}
```

**Example (function):**

```text
{
  name: () => 'custom.css',
}
```

**Notes:**

- When `fromInput: true`, must match a key in Rollup's `input` object
- Extension determines asset type (.css for styles, .js for scripts)

### fromInput

Load asset from Rollup input.

**Type:** `boolean | ((asset: AssetResolved) => boolean)`

**Required:** No

**Default:** `false`

**Example:**

```text
{
  name: 'app',
  fromInput: true, // Matches input.app
}
```

**Example (function):**

```text
{
  name: 'app',
  fromInput: (asset) => asset.name === 'app',
}
```

**Notes:**

- Asset name must match a key in Rollup's `input` object
- Asset is automatically copied to UI-Doc output directory if `output.dir` is set
- Source maps are also copied if they exist

### file

Load asset from file system.

**Type:** `string | (() => string)`

**Required:** No (mutually exclusive with `fromInput`, `dependency`, and `source`)

**Example:**

```text
{
  name: 'custom.css',
  file: 'src/docs/custom.css',
}
```

**Example (function):**

```text
{
  name: 'custom.css',
  file: () => 'src/docs/custom.css',
}
```

**Notes:**

- Path is relative to project root
- File is read and emitted during build

### dependency

Load asset from node_modules package.

**Type:** `string | (() => string)`

**Required:** No (mutually exclusive with `fromInput`, `file`, and `source`)

**Example:**

```text
{
  name: 'normalize.css',
  dependency: 'normalize.css',
}
```

**Example (function):**

```text
{
  name: 'normalize.css',
  dependency: () => 'normalize.css',
}
```

**Notes:**

- Package must be installed in node_modules
- Uses Node.js module resolution

### source

Provide asset source directly.

**Type:** `string | Uint8Array | (() => string)`

**Required:** No (mutually exclusive with `fromInput`, `file`, and `dependency`)

**Example:**

```text
{
  name: 'inline.js',
  source: 'console.log("Inline script")',
}
```

**Example (function):**

```text
{
  name: 'inline.js',
  source: () => 'console.log("Inline script")',
}
```

**Notes:**

- Useful for small inline scripts or styles
- Content is written directly to output

### attrs

HTML attributes to add to the asset tag.

**Type:** `Record<string, string>`

**Required:** No

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

**Notes:**

- Attributes are added to `<script>` or `<link>` tags
- Use for `type="module"`, `media` queries, etc.

## Complete options example

Complete configuration demonstrating all major options:

```js
import uidoc from '@ui-doc/rollup'

export default {
  input: {
    app: 'src/index.js',
    theme: 'src/theme.css',
  },
  output: {
    dir: 'dist',
  },
  plugins: [
    uidoc({
      // Core options
      source: ['src/**/*.css', 'src/**/*.js'],
      templatePath: 'ui-doc/templates',

      // Output options
      output: {
        dir: 'docs',
        baseUri: '/documentation/',
      },

      // Settings options
      settings: {
        generate: {
          logo: () => '<img src="logo.svg" alt="Logo">',
          footerText: () => 'Powered by UI-Doc',
          homeLink: () => '/',
        },
        texts: {
          title: 'Component Library',
          copyright: '© 2025 MyCompany',
        },
      },

      // Assets options
      assets: {
        static: 'ui-doc/assets',
        highlightTheme: 'github-dark',
        page: [
          {
            name: 'custom-page.css',
            file: 'ui-doc/page-styles.css',
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
          {
            name: 'theme',
            fromInput: true,
          },
          {
            name: 'normalize.css',
            dependency: 'normalize.css',
          },
        ],
      },
    }),
  ],
}
```

## See also

- [Vite plugin options reference](./vite-options.md) - Configuration for Vite plugin
- [@ui-doc/rollup README](../../packages/rollup/README.md) - Package documentation
- [@ui-doc/core README](../../packages/core/README.md) - Core API reference
- [Tag reference](./tags.md) - Documentation tag syntax
