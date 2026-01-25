# UI-Doc

Generate interactive UI documentation from JSDoc-style comment blocks in your CSS, JavaScript, and TypeScript files.

UI-Doc combines documentation with testing by allowing you to write examples directly in your source code as comment blocks. These examples are then rendered as live, interactive documentation pages.

## Why UI-Doc?

**Design First, Document as You Build**

UI-Doc addresses common challenges in component development:

- **Speed up development** - Build and test components in isolation before integrating them
- **Document close to the code** - Keep documentation and implementation in sync
- **Prevent breakage** - See all component variants in one place to avoid unintended changes
- **Familiar syntax** - Use JSDoc-style comments that feel natural to developers
- **Live examples** - View rendered components alongside their code

**The Problem**

Often developers struggle with CSS and component development because:

1. **Too much context switching** - Moving between CMS/framework setup, markup, and styling breaks focus
2. **Hidden dependencies** - Changes to shared components break pages you didn't know existed
3. **No single source of truth** - Documentation drifts from implementation

**The Solution**

Work in your documentation. As you document and write examples, you see the results immediately:

- Design components in isolation
- Document behavior and usage
- Provide an overview of what exists and how to use it
- Test components independently
- Prevent CSS class name collisions

## Features

- Parse JSDoc-style documentation blocks from CSS, JS, and TS files
- Render live component examples with code
- Organize documentation into pages and sections
- Document colors, spacing, and icon systems
- Integrate with Rollup and Vite build pipelines
- Extensible tag system for custom documentation needs
- Zero-config HTML renderer with customizable templates

## Quick Start

### Installation

Install the packages you need for your build tool:

```bash
# For Vite projects
pnpm install --save-dev @ui-doc/vite @ui-doc/html-renderer @highlightjs/cdn-assets

# For Rollup projects
pnpm install --save-dev @ui-doc/rollup @ui-doc/html-renderer @highlightjs/cdn-assets

# For Node.js scripts
pnpm install --save-dev @ui-doc/core @ui-doc/node @ui-doc/html-renderer
```

### Basic Setup

#### Vite

```js
// vite.config.js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      settings: {
        texts: {
          title: 'My UI Documentation',
        },
      },
    }),
  ],
})
```

#### Rollup

```js
// rollup.config.js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      settings: {
        texts: {
          title: 'My UI Documentation',
        },
      },
    }),
  ],
}
```

### Writing Documentation

Add JSDoc-style comment blocks to your source files:

```css
/**
 * Typography system for the application.
 *
 * @page typography Typography
 */

/**
 * Default text formatting elements.
 *
 * @location typography.format Format
 * @example
 * <span>Normal Text</span><br>
 * <strong>Strong Text</strong><br>
 * <small>Small Text</small><br>
 * <em>Emphasis Text</em><br>
 * <i>Italic Text</i>
 */
```

## Packages

This monorepo contains five packages that work together to generate UI documentation:

### [@ui-doc/core](./packages/core)

[![npm version](https://img.shields.io/npm/v/@ui-doc/core.svg)](https://www.npmjs.com/package/@ui-doc/core)

The core parsing and rendering engine. Extracts documentation from JSDoc-style comment blocks and transforms them into structured context for rendering.

**Key features:**

- Comment block parsing with tag transformers
- Extensible tag system (@page, @section, @example, @color, @space, @icon)
- Event system for customization
- Renderer interface for output generation

[Read the @ui-doc/core documentation](./packages/core)

### [@ui-doc/node](./packages/node)

[![npm version](https://img.shields.io/npm/v/@ui-doc/node.svg)](https://www.npmjs.com/package/@ui-doc/node)

File system operations for Node.js environments. Handles file discovery via glob patterns and reading source files.

[Read the @ui-doc/node documentation](./packages/node)

### [@ui-doc/html-renderer](./packages/html-renderer)

[![npm version](https://img.shields.io/npm/v/@ui-doc/html-renderer.svg)](https://www.npmjs.com/package/@ui-doc/html-renderer)

A lightweight HTML rendering engine with a simple template syntax. Converts UI-Doc context objects into HTML pages with zero dependencies.

**Key features:**

- Simple template syntax (var, if, for, page, partial)
- Customizable layouts, pages, and partials
- No external dependencies

[Read the @ui-doc/html-renderer documentation](./packages/html-renderer)

### [@ui-doc/rollup](./packages/rollup)

[![npm version](https://img.shields.io/npm/v/@ui-doc/rollup.svg)](https://www.npmjs.com/package/@ui-doc/rollup)

Rollup plugin integration. Generates UI documentation as part of your Rollup build process.

**Key features:**

- Glob-based source file discovery
- Asset management for styles and scripts
- Template customization
- Static asset copying

[Read the @ui-doc/rollup documentation](./packages/rollup)

### [@ui-doc/vite](./packages/vite)

[![npm version](https://img.shields.io/npm/v/@ui-doc/vite.svg)](https://www.npmjs.com/package/@ui-doc/vite)

Vite plugin integration. Wraps the Rollup plugin and adds Vite dev server support for live documentation preview.

**Key features:**

- All Rollup plugin features
- Dev server integration
- Live preview at `/ui-doc` during development
- Configurable base URI for production builds

[Read the @ui-doc/vite documentation](./packages/vite)

## Architecture

### Package Dependency Flow

```text
@ui-doc/core                    # Parse doc blocks → context objects
    ↓
@ui-doc/node                    # File system operations (depends on core)
    ↓
@ui-doc/html-renderer           # Render context → HTML (depends on core)
    ↓
@ui-doc/rollup                  # Rollup plugin (depends on core + node)
    ↓
@ui-doc/vite                    # Vite plugin (wraps rollup)
```

### Processing Pipeline

1. **Core** parses JSDoc comment blocks from source text using `CommentBlockParser`
2. Blocks are transformed into UI-Doc context objects via tag transformers
3. **Node** handles file discovery and reading via glob patterns
4. **HTML Renderer** converts context to HTML pages with styling
5. Build plugins (**Rollup/Vite**) integrate the pipeline and output documentation

## Documentation

- [Live Demo](https://gherrink.github.io/ui-doc/) - See UI-Doc in action
- [@ui-doc/core Documentation](./packages/core/README.md) - Core API and tag reference
- [@ui-doc/html-renderer Documentation](./packages/html-renderer/README.md) - Template syntax
- [@ui-doc/rollup Documentation](./packages/rollup/README.md) - Rollup plugin options
- [@ui-doc/vite Documentation](./packages/vite/README.md) - Vite plugin options

## Examples

Check out the [demos](./demos) directory for complete examples:

- Node.js script - `demos/base.ts`
- Rollup configuration - `demos/rollup.config.mjs`
- Vite configuration - `demos/vite.config.mjs`

## Development

### Prerequisites

- Node.js >= 16.0.0
- pnpm 9.1.0 or higher

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm workspace:build

# Run tests
pnpm workspace:test

# Lint code
pnpm lint

# Fix linting issues
pnpm fix
```

### Package Scripts

```bash
# Build a specific package
pnpm --filter @ui-doc/core build

# Test a specific package
pnpm --filter @ui-doc/core test

# Type check all packages
pnpm typecheck
```

### Testing

Tests are located in `packages/*/tests/` and use Vitest with TypeScript support.

```bash
# Run all tests
pnpm workspace:test

# Run tests for a specific package
pnpm --filter @ui-doc/core test
```

## Contributing

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with the following scopes:

- `release` - Release-related changes
- `core` - @ui-doc/core package
- `html-renderer` - @ui-doc/html-renderer package
- `node` - @ui-doc/node package
- `rollup` - @ui-doc/rollup package
- `vite` - @ui-doc/vite package
- `demos` - Demo applications

Example: `feat(core): add custom tag transformer support`

### Release Process

```bash
# Dry run (lint, test, version check)
pnpm release:dry

# Full release with publishing
pnpm release
```

## License

[MIT](./LICENSE.md)

Copyright (c) 2024

## Links

- [GitHub Repository](https://github.com/gherrink/ui-doc)
- [Issue Tracker](https://github.com/gherrink/ui-doc/issues)
- [Live Demo](https://gherrink.github.io/ui-doc/)
