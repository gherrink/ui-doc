# How to copy fonts, images, and media assets

Copy static assets like fonts, images, and media files to your UI-Doc output directory with explicit control over file selection and output paths.

## Overview

The `assets.copy` configuration option uses glob patterns to select specific assets and copy them to your documentation output. Unlike `assets.static` which copies entire directories, `assets.copy` gives you precise control over which files are copied and where they go.

**Use this guide when you want to:**

- Copy font files from your source directory to documentation
- Include specific images or media files in examples
- Control output paths for different asset types
- Reference assets from CSS files with automatic URL rewriting

## Prerequisites

Before starting, ensure you have:

- UI-Doc installed with either `@ui-doc/vite` or `@ui-doc/rollup`
- Static assets (fonts, images, etc.) in your project
- Basic understanding of glob patterns

## Solution

### Step 1: Configure basic asset copying

Add the `assets.copy` option to copy files using glob patterns:

```js
// vite.config.js or rollup.config.js
import uidoc from '@ui-doc/vite'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        copy: [
          {
            from: 'src/fonts/**/*.woff2',
            to: 'fonts',
          },
        ],
      },
    }),
  ],
}
```

This copies all `.woff2` files from `src/fonts/` to the `fonts/` directory in your UI-Doc output.

### Step 2: Add multiple asset types

Copy different asset types to organized directories:

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    copy: [
      {
        from: 'src/fonts/**/*.{woff,woff2}',
        to: 'fonts',
      },
      {
        from: 'src/images/**/*.{png,svg,jpg}',
        to: 'images',
      },
    ],
  },
})
```

Each entry in the `copy` array processes files independently, allowing you to organize assets by type or purpose.

### Step 3: Reference assets in CSS

UI-Doc automatically rewrites CSS `url()` references when assets are configured via `assets.page` or `assets.example`:

```css
/* src/styles/typography.css - original */
@font-face {
  font-family: 'CustomFont';
  src: url('../fonts/custom-font.woff2') format('woff2');
}
```

```js
// Configuration
uidoc({
  source: ['src/**/*.css'],
  assets: {
    copy: [
      {
        from: 'src/fonts/**/*.woff2',
        to: 'static/fonts',
      },
    ],
    page: [
      {
        name: 'typography.css',
        file: 'src/styles/typography.css',
      },
    ],
  },
})
```

```css
/* Output in documentation - automatically rewritten */
@font-face {
  font-family: 'CustomFont';
  src: url('./static/fonts/custom-font.woff2') format('woff2');
}
```

The URL is automatically updated to match the copy asset's output path.

### Result

Your configuration now copies specific assets to the documentation output:

```bash
pnpm build
```

The output structure looks like:

```text
dist/
└── ui-doc/
    ├── index.html
    ├── fonts/
    │   ├── custom-regular.woff2
    │   └── custom-bold.woff2
    ├── images/
    │   ├── logo.svg
    │   └── icon.png
    └── typography.css (with rewritten URLs)
```

## Variations

### Copy to output root

Omit the `to` option to place files directly in the output directory:

```js
uidoc({
  assets: {
    copy: [
      {
        from: 'public/**/*',
        // No 'to' - preserves directory structure from glob base
      },
    ],
  },
})
```

**Path calculation:**

```text
from: 'public/**/*'
file: 'public/images/logo.svg'
output: 'images/logo.svg' (relative to glob base 'public/')
```

### Preserve subdirectory structure

Copy assets while maintaining their nested structure:

```js
uidoc({
  assets: {
    copy: [
      {
        from: 'src/assets/**/*',
        to: 'assets',
      },
    ],
  },
})
```

**Path calculation:**

```text
from: 'src/assets/**/*'
file: 'src/assets/fonts/custom.woff2'
output: 'assets/fonts/custom.woff2'
```

The directory structure relative to the glob base (`src/assets/`) is preserved under the `to` directory.

### Copy specific file patterns

Use multiple glob patterns for precise file selection:

```js
uidoc({
  assets: {
    copy: [
      {
        from: 'src/fonts/brand/**/*.{woff,woff2,ttf}',
        to: 'fonts/brand',
      },
      {
        from: 'src/fonts/system/**/*.{woff,woff2}',
        to: 'fonts/system',
      },
    ],
  },
})
```

This copies different font families to separate output directories.

### Combine with static assets

Use both `assets.static` and `assets.copy` together:

```js
uidoc({
  assets: {
    static: './public', // Copy entire public directory as-is
    copy: [
      {
        from: 'src/fonts/**/*.woff2', // Copy only .woff2 fonts
        to: 'fonts',
      },
    ],
  },
})
```

Use `static` for complete directories and `copy` for selective file inclusion.

### Use in example CSS

Copy assets and reference them in example stylesheets:

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: './src/app.css',
      },
    },
  },
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        copy: [
          {
            from: 'src/fonts/**/*.woff2',
            to: 'static/fonts',
          },
        ],
        example: [
          {
            name: 'app',
            fromInput: true, // CSS with url() references
          },
        ],
      },
    }),
  ],
})
```

When `app.css` contains `url()` references to fonts, they are automatically rewritten to match the copy asset output paths.

### Watch mode behavior

Assets are automatically copied during development:

```bash
# Vite dev server
vite

# Rollup watch mode
rollup -c --watch
```

Changes to source files matching the glob patterns trigger automatic copying to the output directory.

## Troubleshooting

### CSS URLs not rewritten

Ensure the CSS file is configured in `assets.page` or `assets.example`:

```js
// Wrong - CSS not processed
uidoc({
  assets: {
    copy: [
      { from: 'src/fonts/**/*.woff2', to: 'fonts' },
    ],
  },
})

// Correct - CSS processed for URL rewriting
uidoc({
  assets: {
    copy: [
      { from: 'src/fonts/**/*.woff2', to: 'fonts' },
    ],
    page: [
      {
        name: 'custom.css',
        file: 'src/styles/custom.css', // Will be processed
      },
    ],
  },
})
```

Only CSS files configured via `assets.page` or `assets.example` have their URLs automatically rewritten.

### No files copied

Verify the glob pattern matches your file structure:

```text
Pattern: { from: 'src/fonts/**/*.woff2', to: 'fonts' }
Glob base: 'src/fonts/'

File: src/fonts/custom.woff2
Output: fonts/custom.woff2 ✓

File: fonts/custom.woff2 (wrong directory)
Output: (not matched) ✗
```

The glob pattern must match files relative to your configuration file location.

### Wrong output paths

Understanding path resolution:

```text
Output path = to + (source path relative to glob base)

Example 1:
from: 'src/fonts/**/*'
to: 'fonts'
file: 'src/fonts/subfolder/font.woff2'
glob base: 'src/fonts/'
relative: 'subfolder/font.woff2'
output: 'fonts/subfolder/font.woff2'

Example 2:
from: 'public/**/*'
to: (undefined)
file: 'public/images/logo.svg'
glob base: 'public/'
relative: 'images/logo.svg'
output: 'images/logo.svg'
```

The glob base is determined automatically by picomatch based on the pattern structure.

### Assets not loading in examples

Verify the asset paths match your CSS `url()` references:

```css
/* If your CSS uses this path: */
url('../fonts/custom.woff2')

/* And CSS file is at: dist/ui-doc/styles.css */
/* The font should be at: dist/ui-doc/fonts/custom.woff2 */

/* Configure copy to match: */
{
  from: 'src/fonts/**/*.woff2',
  to: 'fonts', // Creates dist/ui-doc/fonts/
}
```

The rewritten URL is always relative (`./output-path`), so ensure your `to` directory matches the expected path structure.

### Data URIs or external URLs affected

UI-Doc skips rewriting for:

- Data URIs: `url("data:image/png;base64,...")`
- HTTP/HTTPS URLs: `url("https://example.com/font.woff2")`
- Protocol-relative URLs: `url("//example.com/font.woff2")`

Only relative file paths are rewritten to match copy asset output locations.

## Related guides

- [Configure asset loading](./configure-assets.md) - General asset configuration
- [Getting Started with Vite](../getting-started/vite.md) - Basic Vite setup
- [Asset management concepts](../concepts/asset-management.md) - How assets work in UI-Doc
