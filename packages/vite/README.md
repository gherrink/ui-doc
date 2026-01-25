# @ui-doc/vite

A Vite plugin for generating interactive UI documentation from JSDoc-style comment blocks in your source files. This plugin integrates UI-Doc into your Vite build process and adds a live development server with hot-reload support.

## Overview

The Vite plugin wraps the [@ui-doc/rollup](../rollup/README.md) plugin and adds Vite-specific functionality:

- Serve UI-Doc documentation via the Vite dev server
- Live reload when documentation changes
- Automatic asset handling and injection
- Support for Vite's build pipeline

By default, your documentation is served at `/ui-doc/` during development. The base URI can be customized via the `output.baseUri` option.

## Installation

```bash
# npm
npm install --save-dev @ui-doc/vite @ui-doc/html-renderer @highlightjs/cdn-assets

# yarn
yarn add --dev @ui-doc/vite @ui-doc/html-renderer @highlightjs/cdn-assets

# pnpm
pnpm install --save-dev @ui-doc/vite @ui-doc/html-renderer @highlightjs/cdn-assets
```

**Requirements:**

- Node.js >= 16.0.0
- Vite >= 5.0.0

## Quick Start

Add the plugin to your `vite.config.js`:

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      settings: {
        texts: {
          title: 'My Component Library',
        },
      },
    }),
  ],
})
```

Start the dev server:

```bash
vite
```

Your documentation will be available at `http://localhost:5173/ui-doc/`

## Basic Configuration

### Minimal Setup

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    uidoc({
      source: ['css/**/*.css', 'js/**/*.js'],
    }),
  ],
})
```

### With Custom Settings

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        app: 'css/index.css',
      },
    },
  },

  plugins: [
    uidoc({
      settings: {
        generate: {
          logo: () => 'My Component Library',
        },
        texts: {
          title: 'Component Documentation',
          copyright: '© 2025 My Company',
        },
      },
      source: ['css/**/*.css'],
      assets: {
        example: {
          name: 'app',
          fromInput: true,
        },
      },
    }),
  ],
})
```

## Assets Configuration

### Include Styles and Scripts

You can include custom CSS and JavaScript in your documentation pages and examples:

```js
uidoc({
  source: ['css/**/*.css'],
  assets: {
    // Static assets folder (copied to output)
    static: './assets',

    // Custom styles/scripts for documentation pages
    page: [
      {
        name: 'custom-ui-doc',
        fromInput: true, // Asset defined in Vite's input
      },
    ],

    // Custom styles/scripts for example previews
    example: [
      {
        name: 'app',
        fromInput: true,
        attrs: {
          type: 'module', // Add custom HTML attributes
        },
      },
    ],
  },
})
```

### Asset Options

Assets can be loaded from different sources:

```text
{
  // Load from Vite's input configuration
  name: 'app',
  fromInput: true,

  // Or load from a file
  name: 'custom.css',
  file: './path/to/custom.css',

  // Or load from node_modules
  name: 'library.js',
  dependency: 'some-library/dist/library.js',

  // Or provide source directly
  name: 'inline.css',
  source: 'body { margin: 0; }',

  // Add HTML attributes
  attrs: {
    type: 'module',
    defer: 'true',
  },
}
```

## Output Configuration

### Change Output Directory

```js
uidoc({
  source: ['css/**/*.css'],
  output: {
    dir: 'docs', // Output to dist/docs instead of dist/ui-doc
  },
})
```

### Change Base URI

```js
uidoc({
  source: ['css/**/*.css'],
  output: {
    baseUri: '/documentation/', // Serve at /documentation/ instead of /ui-doc/
  },
})
```

### Relative URLs for Build

```js
uidoc({
  source: ['css/**/*.css'],
  output: {
    baseUri: '.', // Use relative URLs in build output
  },
})
```

## Advanced Configuration

### Custom Templates

Override default templates or add custom ones:

```js
uidoc({
  source: ['css/**/*.css'],
  templatePath: 'ui-doc/templates', // Directory with custom templates
})
```

### Conditional Configuration

Configure the plugin differently for dev and build:

```js
export default defineConfig(({ command }) => {
  return {
    plugins: [
      uidoc({
        source: ['css/**/*.css'],
        output: {
          // Use absolute path in dev, relative in build
          baseUri: command === 'serve' ? undefined : '.',
        },
      }),
    ],
  }
})
```

### Complete Example

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  return {
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          'app': 'js/app.js',
          'ui-doc-custom': 'ui-doc/custom.css',
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
          page: [
            {
              name: 'ui-doc-custom',
              fromInput: true,
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
  }
})
```

## Plugin Options

All options from [@ui-doc/rollup](../rollup/README.md#options) are supported. The Vite plugin adds the following defaults:

| Name       | Type   | Default    | Description                                      |
| ---------- | ------ | ---------- | ------------------------------------------------ |
| output.dir | string | `'ui-doc'` | Output directory (relative to Vite's output dir) |

### Core Options Summary

| Name         | Type            | Required | Description                                  |
| ------------ | --------------- | -------- | -------------------------------------------- |
| source       | string[]        | yes      | Glob patterns to find source files           |
| output       | object          | no       | Output configuration (dir, baseUri)          |
| settings     | object          | no       | UI-Doc settings (generate, texts)            |
| assets       | object          | no       | Asset configuration (static, page, example)  |
| templatePath | string          | no       | Custom template directory                    |
| renderer     | Renderer        | no       | Custom renderer instance                     |
| blockParser  | BlockParser     | no       | Custom block parser instance                 |

See the [@ui-doc/rollup documentation](../rollup/README.md#options) for detailed option descriptions.

## Development Server

When running `vite` or `vite dev`, the plugin adds a development server that:

1. Serves documentation at `/{output.dir}/` (default: `/ui-doc/`)
2. Hot-reloads when documentation changes
3. Injects Vite's client script for HMR
4. Serves static assets from the configured static folder

The plugin logs the documentation URL on server start:

```text
UI-Doc v0.3.1 under /ui-doc/

➜  Local: http://localhost:5173/ui-doc/
```

## Build Output

When running `vite build`, the plugin:

1. Generates documentation files in `{outDir}/{output.dir}/`
2. Copies static assets to the output directory
3. Resolves and bundles all CSS/JS assets from Vite's input

Example output structure:

```text
dist/
├── assets/
│   ├── app-abc123.js
│   └── app-abc123.css
└── ui-doc/
    ├── index.html
    ├── components.html
    ├── examples/
    │   └── button.html
    ├── assets/
    │   └── (static assets)
    └── (other documentation files)
```

## Writing Documentation

UI-Doc uses JSDoc-style comment blocks with special tags. See the [@ui-doc/core documentation](../core/README.md) for the complete documentation syntax.

### Quick Example

```css
/**
 * @page buttons Buttons
 */

/**
 * A primary button for main actions.
 *
 * @location buttons.primary Primary Button
 * @example
 * <button class="btn btn-primary">Click Me</button>
 */
.btn-primary {
  background: blue;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
}
```

## Common Patterns

### Pattern 1: Standalone Documentation

Build UI-Doc independently from your main application:

```js
export default defineConfig({
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: {
        styles: 'ui-doc/styles.css',
      },
    },
  },

  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      output: {
        dir: '.', // Output directly to docs/
        baseUri: '.',
      },
      assets: {
        static: './ui-doc/assets',
        page: [
          {
            name: 'styles',
            fromInput: true,
          },
        ],
      },
    }),
  ],
})
```

### Pattern 2: Integrated Documentation

Include UI-Doc alongside your application build:

```js
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        app: 'src/main.js',
      },
    },
  },

  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      output: {
        dir: 'ui-doc', // dist/ui-doc/
      },
      assets: {
        example: [
          {
            name: 'app',
            fromInput: true,
          },
        ],
      },
    }),
  ],
})
```

### Pattern 3: Multiple Input Entries

Use multiple Vite inputs for custom documentation styling:

```js
export default defineConfig(({ command }) => {
  return {
    build: {
      rollupOptions: {
        input: {
          'app': 'src/main.js',
          'ui-doc-theme': 'ui-doc/theme.css',
        },
      },
    },

    plugins: [
      uidoc({
        source: ['src/**/*.css'],
        output: {
          baseUri: command === 'serve' ? undefined : '.',
        },
        assets: {
          page: [
            {
              name: 'ui-doc-theme',
              fromInput: true,
            },
          ],
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
})
```

## Troubleshooting

### Documentation Not Showing in Dev Server

Make sure you don't set `output.baseUri` to `'.'` in dev mode:

```js
// This will break dev server
uidoc({ output: { baseUri: '.' } })

// Use conditional configuration instead
uidoc({
  output: {
    baseUri: command === 'serve' ? undefined : '.',
  },
})
```

### Assets Not Loading

Ensure assets are registered correctly:

```text
// If using Vite's input configuration
{
  name: 'app', // Must match the key in rollupOptions.input
  fromInput: true,
}

// If using a file path
{
  name: 'custom.css',
  file: './path/to/custom.css', // Relative to project root
}
```

### Hot Reload Not Working

The plugin automatically watches your source files for changes. If hot reload isn't working:

1. Check that your `source` glob patterns are correct
2. Verify that Vite is watching the files (check Vite config)
3. Try restarting the dev server

## API

### Plugin Export

```ts
export default function uidocPlugin(options: Options): Promise<Plugin<Api>>
```

### Options Type

```ts
import type { Options as RollupPluginOptions } from '@ui-doc/rollup'

export type Options = RollupPluginOptions
```

See [@ui-doc/rollup API documentation](../rollup/README.md#options) for the complete options reference.

### API Type

```ts
import type { Api as RollupPluginApi } from '@ui-doc/rollup'

export interface Api extends RollupPluginApi {
  version: string
}
```

## Related Packages

- [@ui-doc/core](../core/README.md) - Core parsing and rendering engine
- [@ui-doc/rollup](../rollup/README.md) - Rollup plugin (wrapped by this plugin)
- [@ui-doc/html-renderer](../html-renderer/README.md) - Default HTML renderer
- [@ui-doc/node](../node/README.md) - File system utilities

## License

See [LICENSE.md](../../LICENSE.md) for license information.
