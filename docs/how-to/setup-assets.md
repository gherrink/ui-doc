# How to configure custom assets

Add custom CSS and JavaScript to your UI-Doc documentation pages and examples.

## Overview

UI-Doc lets you include your own stylesheets and scripts in both the documentation pages and the example previews. This is useful when you want to apply custom styling to the documentation interface or ensure examples render with your application's styles.

**Use this guide when you want to:**

- Apply custom branding or styling to documentation pages
- Include application styles in example previews
- Add JavaScript functionality to documentation or examples
- Load third-party libraries in your documentation

## Prerequisites

Before starting, ensure you have:

- UI-Doc installed with either `@ui-doc/vite` or `@ui-doc/rollup`
- A working UI-Doc configuration
- Custom CSS or JavaScript files you want to include

## Solution

### Step 1: Create your custom asset files

Create CSS or JavaScript files for your documentation. Place them in a dedicated directory for organization.

```css
/* ui-doc/custom-styles.css */
:root {
  --ui-doc-primary: #0066cc;
  --ui-doc-background: #f5f5f5;
}

.site-header {
  background: var(--ui-doc-primary);
  color: white;
  padding: 1rem;
}
```

```js
// ui-doc/custom-script.js
console.log('UI-Doc documentation loaded')

// Add custom interactivity
document.addEventListener('DOMContentLoaded', () => {
  // Your custom code here
})
```

### Step 2: Configure assets for documentation pages

Add custom assets to documentation pages using the `assets.page` option. These assets are included in the main documentation HTML pages.

**For Vite:**

```js
// vite.config.js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        page: [
          {
            name: 'custom-styles.css',
            file: 'ui-doc/custom-styles.css',
          },
          {
            name: 'custom-script.js',
            file: 'ui-doc/custom-script.js',
            attrs: {
              type: 'module',
            },
          },
        ],
      },
    }),
  ],
})
```

**For Rollup:**

```js
// rollup.config.js
import uidoc from '@ui-doc/rollup'

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
  },
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        page: [
          {
            name: 'custom-styles.css',
            file: 'ui-doc/custom-styles.css',
          },
          {
            name: 'custom-script.js',
            file: 'ui-doc/custom-script.js',
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

### Step 3: Configure assets for example previews

Add custom assets to example previews using the `assets.example` option. These assets are included in the iframe where your code examples render.

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    example: [
      {
        name: 'example-styles.css',
        file: 'src/styles/example-styles.css',
      },
    ],
  },
})
```

### Result

Your custom assets will now be included in your documentation. Page assets appear in the main documentation interface, while example assets are available in code preview iframes.

```bash
$ pnpm dev

  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  UI-Doc:  http://localhost:5173/ui-doc/
```

Visit your documentation to see your custom styling and functionality applied.

## Variations

### Load assets from Rollup/Vite input

If you process assets through your build pipeline, reference them from your input configuration instead of loading from files.

**Vite example:**

```js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: 'src/main.js',
        'ui-doc-theme': 'ui-doc/theme.css',
      },
    },
  },
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
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
})
```

**Rollup example:**

```js
export default {
  input: {
    app: 'src/index.js',
    'ui-doc-custom': 'ui-doc/custom.css',
  },
  output: {
    dir: 'dist',
  },
  plugins: [
    postcss({ extract: true }),
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        page: [
          {
            name: 'ui-doc-custom',
            fromInput: true,
          },
        ],
      },
    }),
  ],
}
```

### Load assets from node_modules

Include third-party libraries from installed npm packages.

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

### Inline small scripts or styles

For small snippets, provide the source directly instead of loading from a file.

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    page: [
      {
        name: 'inline-script.js',
        source: `
          console.log('Documentation ready');
          window.DOCS_VERSION = '1.0.0';
        `,
      },
    ],
  },
})
```

### Add HTML attributes to assets

Customize how assets are loaded by adding HTML attributes.

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    page: [
      {
        name: 'custom-script.js',
        file: 'ui-doc/custom-script.js',
        attrs: {
          type: 'module',
          defer: 'true',
        },
      },
    ],
    example: [
      {
        name: 'example-styles.css',
        file: 'src/example-styles.css',
        attrs: {
          media: 'screen',
        },
      },
    ],
  },
})
```

### Include static assets

Copy entire directories of static assets (images, fonts, etc.) to your documentation output.

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    static: './ui-doc/assets',
    page: [
      {
        name: 'custom-styles.css',
        file: 'ui-doc/custom-styles.css',
      },
    ],
  },
})
```

Files in `ui-doc/assets/` will be copied to the documentation output directory and can be referenced in your custom CSS or HTML.

### Conditional configuration for dev and build

Use different asset configurations for development and production builds.

```js
export default defineConfig(({ command }) => {
  return {
    plugins: [
      uidoc({
        source: ['src/**/*.css'],
        assets: {
          page: [
            {
              name: 'ui-doc-theme',
              fromInput: true,
            },
          ],
          example: [
            {
              name: command === 'serve' ? 'app' : 'app.min',
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

### Assets not loading in examples

Ensure you're using `assets.example` not `assets.page`. Example assets are loaded in the preview iframe, while page assets are loaded in the main documentation page.

```js
// Wrong - this won't appear in examples
assets: {
  page: [{ name: 'app.css', fromInput: true }]
}

// Correct - this will appear in examples
assets: {
  example: [{ name: 'app.css', fromInput: true }]
}
```

### Assets from input not found

When using `fromInput: true`, verify the asset name matches a key in your Rollup/Vite input configuration.

```text
// Input configuration
input: {
  'my-theme': 'ui-doc/theme.css',
}

// Asset configuration - name must match
assets: {
  page: [
    {
      name: 'my-theme', // Must match input key exactly
      fromInput: true,
    },
  ],
}
```

### Styles not applying

Check browser developer tools for 404 errors. If using `output.dir`, ensure your `output.baseUri` is configured correctly.

```text
// For Vite development
output: {
  baseUri: undefined, // Uses /ui-doc/ by default
}

// For production builds
output: {
  baseUri: '.', // Use relative paths
}
```

### File path not resolving

File paths in the `file` property are relative to your project root (where your config file is located), not the config file itself.

```text
// Correct - relative to project root
{
  name: 'custom.css',
  file: './ui-doc/custom.css',
}

// Also correct - absolute paths work
{
  name: 'custom.css',
  file: '/absolute/path/to/ui-doc/custom.css',
}
```

## Related guides

- [Rollup Plugin Reference](../../packages/rollup/README.md#assets-options) - Complete asset configuration options
- [Vite Plugin Reference](../../packages/vite/README.md#assets-configuration) - Vite-specific asset handling
- [HTML Renderer Reference](../../packages/html-renderer/README.md#built-in-assets) - Understanding UI-Doc's built-in assets
