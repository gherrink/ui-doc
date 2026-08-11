# @ui-doc/rollup

A Rollup plugin that integrates UI-Doc into your Rollup build process. Generate interactive UI documentation from JSDoc-style comment blocks in your source files (CSS, JS, TS) as part of your build.

## Overview

The UI-Doc Rollup plugin:

- Watches source files for documentation blocks during development
- Parses JSDoc-style comments into structured documentation
- Generates HTML documentation pages with live examples
- Manages assets (styles, scripts, highlight.js) automatically
- Integrates seamlessly with your existing Rollup configuration

## Installation

Install the plugin along with the required peer dependencies:

```bash
# npm
npm install --save-dev @ui-doc/rollup @ui-doc/html-renderer @highlightjs/cdn-assets

# yarn
yarn add --dev @ui-doc/rollup @ui-doc/html-renderer @highlightjs/cdn-assets

# pnpm
pnpm install --save-dev @ui-doc/rollup @ui-doc/html-renderer @highlightjs/cdn-assets
```

**Note:** `@highlightjs/cdn-assets` is only required if you want code highlighting in your documentation (which is the default). You can disable it by setting `assets.highlightScript` and `assets.highlightStyle` to `false`.

## Quick Start

```js
// rollup.config.js
import uidoc from '@ui-doc/rollup'

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    uidoc({
      source: ['src/**/*.css', 'src/**/*.js'],
      settings: {
        texts: {
          title: 'My Component Library',
        },
      },
    }),
  ],
}
```

This basic setup will:

1. Search for documentation blocks in all CSS and JS files in `src/`
2. Generate documentation in `dist/` (the same directory as your Rollup output)
3. Include default styles and syntax highlighting

## Configuration

### Basic Example

> The `example.fromInput` option needs your stylesheet to be a Rollup `input`
> entry, which means a plugin that puts CSS into Rollup's module graph. The
> examples below use `rollup-plugin-postcss` because it is the most widely
> known one, but it has not been released since 2023 — any plugin that emits a
> CSS asset works, and UI-Doc itself no longer depends on one.

```js
import uidoc from '@ui-doc/rollup'
import postcss from 'rollup-plugin-postcss'

export default {
  input: {
    app: 'css/index.css',
  },
  output: {
    dir: 'dist',
  },
  plugins: [
    postcss({
      extract: 'app.css',
    }),
    uidoc({
      source: ['css/**/*.css'],
      settings: {
        generate: {
          logo: () => '<img src="logo.svg" alt="Logo">',
        },
        texts: {
          title: 'Design System',
          copyright: '© 2025 Your Company',
        },
      },
      assets: {
        static: 'public',
        example: [
          {
            name: 'app',
            fromInput: true,
          },
        ],
      },
    }),
  ],
}
```

### Advanced Example with Custom Assets

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
      source: ['src/**/*.css', 'src/**/*.js'],
      output: {
        dir: 'docs',
        baseUri: '/docs/',
      },
      settings: {
        texts: {
          title: 'Component Library',
        },
      },
      assets: {
        highlightTheme: 'github',
        example: [
          {
            name: 'theme',
            fromInput: true,
          },
          {
            name: 'custom.js',
            file: 'src/docs/custom.js',
          },
        ],
      },
    }),
  ],
}
```

## Options

### Core Options

| Name | Required | Type | Description |
| --- | --- | --- | --- |
| source | **Yes** | `string[]` | Glob patterns to find source files. Uses [picomatch](https://github.com/micromatch/picomatch) syntax. |
| renderer | No | `Renderer` | Custom renderer instance. Defaults to `HtmlRenderer` from `@ui-doc/html-renderer`. |
| blockParser | No | `BlockParser` | Custom block parser instance. Defaults to `CommentBlockParser`. |
| templatePath | No | `string` | Path to custom templates directory for overriding or extending default renderer templates. |

### Output Options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| output.dir | `string` | `''` | Subdirectory within Rollup's output directory for UI-Doc files. |
| output.baseUri | `string` | Same as `output.dir` | Base URI for all UI-Doc links. Use `'.'` for relative URLs. |

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  output: {
    dir: 'ui-doc', // Creates documentation in dist/ui-doc/
    baseUri: '/styleguide/', // All links use /styleguide/ prefix
  },
})
```

### Settings Options

UI-Doc specific settings that control content generation.

| Name | Type | Description |
| --- | --- | --- |
| settings.generate | `object` | Functions that generate content. See [Core Documentation](../core/README.md#generate-functions). |
| settings.texts | `object` | Text strings for title, copyright, etc. |

**Example:**

```js
uidoc({
  source: ['src/**/*.css'],
  settings: {
    generate: {
      logo: () => '<strong>MyBrand</strong>',
      footerText: () => 'Powered by UI-Doc',
      homeLink: () => '/',
    },
    texts: {
      title: 'Design System Documentation',
      copyright: '© 2025 MyCompany',
    },
  },
})
```

### Assets Options

Control which assets are included in documentation pages and examples.

#### Built-in Assets

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| assets.static | `string` | - | Path to static assets folder. Files are copied to UI-Doc output directory. |
| assets.styleAsset | `false \| string` | `'ui-doc.css'` | Name of UI-Doc stylesheet. Set to `false` to disable. |
| assets.highlightStyle | `false \| string` | `'highlight.css'` | Name of highlight.js stylesheet. Set to `false` to disable. |
| assets.highlightTheme | `string` | `'default'` | Highlight.js theme name. See [available themes](https://github.com/highlightjs/highlight.js/tree/main/src/styles). |
| assets.highlightScript | `false \| string` | `'highlight.js'` | Name of highlight.js script. Set to `false` to disable. |

**Example - Custom Highlighting:**

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    highlightTheme: 'github-dark',
  },
})
```

**Example - Disable Highlighting:**

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    highlightStyle: false,
    highlightScript: false,
  },
})
```

#### Custom Assets

| Name | Type | Description |
| --- | --- | --- |
| assets.page | `AssetOption[]` | Custom scripts and styles for documentation pages. |
| assets.example | `AssetOption[]` | Custom scripts and styles for example previews. |

**AssetOption Interface:**

```text
interface AssetOption {
  // Asset name or file name
  name: string | (() => string)

  // Load from Rollup input (requires name to match input key)
  fromInput?: boolean | ((asset: AssetResolved) => boolean)

  // Load from file system
  file?: string | (() => string)

  // Load from node_modules package
  dependency?: string | (() => string)

  // Provide source directly
  source?: string | Uint8Array | (() => string)

  // HTML attributes to add to the asset tag
  attrs?: Record<string, string>
}
```

**Example - Load from Rollup Input:**

```js
// rollup.config.js
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
            name: 'app', // Matches input key
            fromInput: true,
          },
          {
            name: 'theme', // Matches input key
            fromInput: true,
          },
        ],
      },
    }),
  ],
}
```

**Example - Load from File:**

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    example: [
      {
        name: 'custom-example.css',
        file: 'src/docs/example-styles.css',
      },
    ],
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
})
```

**Example - Load from Package:**

```js
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
})
```

**Example - Inline Source:**

```js
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
})
```

## Plugin API

The plugin exposes an API that can be accessed from other Rollup plugins:

```js
// In another Rollup plugin
const myPlugin = {
  name: 'my-plugin',
  buildStart() {
    const uidocPlugin = this.meta.plugins.find(p => p.name === 'ui-doc')
    if (uidocPlugin?.api) {
      // Register a custom asset
      uidocPlugin.api.uidocAsset('my-asset.css', 'example', {
        type: 'style',
        attrs: { media: 'screen' },
      })
    }
  },
}
```

**API Methods:**

| Property | Type | Description |
| --- | --- | --- |
| version | `string` | Plugin version |
| fileFinder | `FileFinder` | File finder instance for searching source files |
| fileSystem | `FileSystem` | File system abstraction |
| options | `ResolvedOptions` | Resolved plugin options |
| uidoc | `UIDoc` | UI-Doc instance |
| uidocAsset | `Function` | Register an asset for documentation pages or examples |
| isAssetFromInput | `Function` | Check if an asset was marked as coming from input |
| addAssetFromInput | `Function` | Mark an asset as coming from input |

## Watch Mode

The plugin fully supports Rollup's watch mode. Source files are automatically watched, and documentation is regenerated when:

- A source file is created, updated, or deleted
- The file matches the `source` glob patterns
- The file contains documentation blocks

## Integration with Other Plugins

The UI-Doc plugin works seamlessly with other Rollup plugins. It's recommended to place it after plugins that transform your source files:

```js
import babel from '@rollup/plugin-babel'
import uidoc from '@ui-doc/rollup'
import postcss from 'rollup-plugin-postcss'

export default {
  plugins: [
    // Transform plugins first
    postcss({ extract: true }),
    babel({ babelHelpers: 'bundled' }),

    // Then generate documentation
    uidoc({
      source: ['src/**/*.css', 'src/**/*.js'],
    }),
  ],
}
```

## Documentation Syntax

UI-Doc uses JSDoc-style comment blocks with special tags. Here's a quick example:

```js
/**
 * Creates a page for button documentation.
 *
 * @page buttons Buttons
 */

/**
 * Primary button with blue background.
 *
 * @location buttons.primary Primary Button
 * @example
 * <button class="btn btn-primary">Click me</button>
 */
```

For complete documentation syntax and available tags, see the [@ui-doc/core documentation](../core/README.md).

## TypeScript Support

The plugin is written in TypeScript and includes full type definitions:

```ts
import type { Options } from '@ui-doc/rollup'
import uidoc from '@ui-doc/rollup'

const config: Options = {
  source: ['src/**/*.ts'],
  settings: {
    texts: {
      title: 'TypeScript Components',
    },
  },
}

export default {
  plugins: [uidoc(config)],
}
```

## Troubleshooting

### Documentation Not Generated

- Verify `source` patterns match your files
- Check that files contain valid JSDoc-style comment blocks
- Enable Rollup's verbose logging to see UI-Doc output messages

### Assets Not Loading

- If using `fromInput: true`, ensure the asset name matches a key in Rollup's `input` object
- Check browser console for 404 errors and verify `output.baseUri` is correct
- When using `output.dir`, assets from input are automatically copied to the UI-Doc directory

### Custom Templates Not Applied

- Verify `templatePath` points to an existing directory
- Check that template files have the correct names (see [@ui-doc/html-renderer](../html-renderer/README.md))
- Templates should use the HTML renderer's template syntax

## Known Issues

- When creating assets exclusively for UI-Doc through Rollup input, the asset will be generated first in Rollup's output directory and then copied to the UI-Doc output directory.

## Examples

See the [demos directory](../../demos) in the repository for complete working examples:

- Basic Rollup setup: `demos/rollup.config.mjs`
- Advanced configurations with custom assets and templates

## Related Packages

- [@ui-doc/core](../core/README.md) - Core parsing and rendering engine
- [@ui-doc/node](../node/README.md) - Node.js file system operations
- [@ui-doc/html-renderer](../html-renderer/README.md) - Default HTML renderer
- [@ui-doc/vite](../vite/README.md) - Vite plugin (wraps this Rollup plugin)

## License

See [LICENSE.md](../../LICENSE.md) for license information.
