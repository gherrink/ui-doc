# How to configure asset loading and paths

Configure where UI-Doc loads assets from and how it references them in different deployment scenarios.

## Overview

UI-Doc needs to know how to load stylesheets, scripts, and static files for your documentation. This guide shows you how to configure asset paths for development, production builds, and various deployment targets like CDNs or subdirectories.

**Use this guide when you want to:**

- Deploy documentation to a subdirectory (e.g., `/docs/` or `/styleguide/`)
- Load custom CSS or JavaScript in documentation pages
- Include static assets like images or fonts
- Set up different paths for development vs. production
- Use assets from your build pipeline or node_modules

## Prerequisites

Before starting, ensure you have:

- UI-Doc installed with either `@ui-doc/vite` or `@ui-doc/rollup`
- Basic understanding of your build tool configuration
- Knowledge of where your documentation will be deployed

## Solution

### Step 1: Configure the output directory

Set the subdirectory where UI-Doc generates files within your build output:

```js
// vite.config.js or rollup.config.js
uidoc({
  source: ['src/**/*.css'],
  output: {
    dir: 'docs', // Creates files in dist/docs/
  },
})
```

This creates documentation in `dist/docs/` instead of the default `dist/ui-doc/`.

### Step 2: Set the base URI for links

Configure how UI-Doc generates links and asset references:

```js
uidoc({
  source: ['src/**/*.css'],
  output: {
    dir: 'docs',
    baseUri: '/styleguide/', // All links use /styleguide/ prefix
  },
})
```

The `baseUri` controls the URL prefix for all internal links and asset references. This is essential when deploying to a subdirectory.

### Step 3: Add static assets

Copy static files (images, fonts, etc.) to the documentation output:

```js
uidoc({
  source: ['src/**/*.css'],
  output: {
    dir: 'docs',
  },
  assets: {
    static: './public/assets', // Copies contents to dist/docs/
  },
})
```

All files in `./public/assets` are copied to your documentation output directory, preserving the folder structure.

### Step 4: Include custom assets in pages

Add custom CSS or JavaScript to documentation pages:

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    page: [
      {
        name: 'custom-docs.css',
        file: './src/docs/custom-styles.css',
      },
      {
        name: 'analytics.js',
        file: './src/docs/analytics.js',
        attrs: {
          async: 'true',
        },
      },
    ],
  },
})
```

These assets are included in every documentation page but not in example previews.

### Step 5: Include assets in example previews

Add CSS or JavaScript that examples need to render correctly:

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: './src/index.js',
      },
    },
  },
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        example: [
          {
            name: 'app', // Matches the input key
            fromInput: true, // Load from Vite's input
          },
        ],
      },
    }),
  ],
})
```

These assets are included in example preview iframes so your components render with the correct styles and behavior.

### Result

Your UI-Doc configuration now controls all asset loading and paths. When you build:

```bash
pnpm build
```

The output structure looks like:

```text
dist/
├── docs/                    # UI-Doc output (from output.dir)
│   ├── index.html           # Links use /styleguide/ prefix
│   ├── ui-doc.css
│   ├── ui-doc.js
│   ├── custom-docs.css      # From assets.page
│   ├── analytics.js         # From assets.page
│   ├── app.js               # From assets.example (fromInput)
│   ├── assets/              # From assets.static
│   │   ├── logo.png
│   │   └── fonts/
│   └── examples/
│       └── *.html           # Each includes app.js
└── index.html               # Your application
```

## Variations

### Relative URLs for portable documentation

Use relative URLs when documentation may be served from different paths:

```js
uidoc({
  source: ['src/**/*.css'],
  output: {
    dir: 'docs',
    baseUri: '.', // Use relative URLs
  },
})
```

This allows the documentation to work whether served at `/`, `/docs/`, or opened directly as files.

### Load assets from node_modules

Include third-party libraries from installed packages:

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    example: [
      {
        name: 'reset.css',
        dependency: 'normalize.css/normalize.css',
      },
    ],
  },
})
```

The dependency is resolved from `node_modules` and included in examples.

### Inline asset source

Provide asset content directly for small snippets:

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    page: [
      {
        name: 'inline-vars.css',
        source: ':root { --doc-color: #007acc; }',
      },
    ],
  },
})
```

### Development vs. production paths

Use environment variables to configure different paths:

```js
import process from 'node:process'

uidoc({
  source: ['src/**/*.css'],
  output: {
    dir: 'docs',
    baseUri: process.env.NODE_ENV === 'production'
      ? '/styleguide/'
      : '/docs/',
  },
})
```

### CDN deployment

Configure for serving documentation from a CDN:

```js
uidoc({
  source: ['src/**/*.css'],
  output: {
    dir: 'docs',
    baseUri: 'https://cdn.example.com/docs/',
  },
})
```

All internal links and asset references use the absolute CDN URL.

### Disable default assets

Remove highlight.js or UI-Doc's default styling:

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    highlightStyle: false, // No syntax highlighting CSS
    highlightScript: false, // No syntax highlighting JS
  },
})
```

### Custom highlight.js theme

Change the syntax highlighting theme:

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    highlightTheme: 'github-dark', // Use different theme
  },
})
```

See [available themes](https://github.com/highlightjs/highlight.js/tree/main/src/styles) for options.

### Cache-busting with hashed filenames

Use Rollup's `assetFileNames` pattern for custom assets to enable cache busting:

```js
import uidoc from '@ui-doc/vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        page: [
          {
            name: 'custom-styles.css',
            file: './src/custom.css',
            useAssetFileNames: true, // Apply assetFileNames pattern
          },
        ],
      },
    }),
  ],
})
```

With this configuration, `custom-styles.css` is output as `assets/custom-styles-abc123.css` where `abc123` is a content hash. This ensures browsers fetch the latest version when the file changes.

**Notes:**

- Only applies to custom assets (not built-in UI-Doc or highlight.js assets)
- Documentation HTML pages always use explicit file names
- Set to `false` (default) to use the exact file name without hashing

## Troubleshooting

### Assets not loading in examples

Ensure assets are registered in the correct place:

- Use `assets.example` for assets needed by component examples
- Use `assets.page` for assets only needed in documentation pages

Verify the asset name matches your build configuration when using `fromInput: true`.

### Wrong paths in links

Check that `output.baseUri` matches your deployment path:

- Development: Usually `'/ui-doc/'` or `'/docs/'`
- Production subdirectory: Match the server path (e.g., `'/styleguide/'`)
- Root deployment: Use `'/'`
- Portable/relative: Use `'.'`

### Static assets not copied

Verify the `assets.static` path is relative to your configuration file:

```text
assets: {
  static: './public/assets', // Relative to config file location
}
```

### Source maps missing

When using `fromInput: true`, UI-Doc automatically copies source map files alongside assets. Ensure your build tool generates source maps:

```js
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps
  },
})
```

### Assets from input not found

When using `fromInput: true`, the asset `name` must exactly match a key in your build configuration's input:

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'my-app': './src/index.js', // Key is 'my-app'
      },
    },
  },
  plugins: [
    uidoc({
      assets: {
        example: [
          {
            name: 'my-app', // Must match input key exactly
            fromInput: true,
          },
        ],
      },
    }),
  ],
})
```

## Related guides

- [Getting Started with Vite](../getting-started/vite.md) - Basic Vite setup
- [Getting Started with Rollup](../getting-started/rollup.md) - Basic Rollup setup
- [Tag Reference](../reference/tags.md) - Available doc block tags
