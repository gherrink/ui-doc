# Getting started with Rollup

Generate interactive UI documentation from your source files as part of your Rollup build. This guide shows you how to install and configure the UI-Doc Rollup plugin to create your first documentation page with a live example.

## Prerequisites

Before you begin, make sure you have:

- Node.js 16.0.0 or later
- Rollup 4.0.0 or later installed and configured
- A Rollup project with CSS, JavaScript, or TypeScript source files

## What you'll build

In this guide, you'll:

1. Install the UI-Doc Rollup plugin and its dependencies
2. Add the plugin to your Rollup configuration
3. Write your first doc block in a CSS file
4. Build your project and view the generated documentation

## Installation

Install UI-Doc and its dependencies:

```bash
# npm
npm install --save-dev @ui-doc/rollup @ui-doc/html-renderer

# yarn
yarn add --dev @ui-doc/rollup @ui-doc/html-renderer

# pnpm
pnpm install --save-dev @ui-doc/rollup @ui-doc/html-renderer
```

> **Note:** `@ui-doc/html-renderer` is a peer dependency required for generating HTML documentation pages.

## Basic setup

Add the UI-Doc plugin to your Rollup configuration. This minimal setup searches your source files for documentation blocks and generates HTML pages in your output directory.

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

This configuration:

- Searches all CSS and JavaScript files in `src/` for doc blocks
- Generates documentation in `dist/` (the same directory as your build output)
- Sets "My Component Library" as the documentation title
- Includes default styles and syntax highlighting

## Write your first doc block

Create a CSS file or add to an existing one with a documentation block:

```css
/* src/styles.css */
/**
 * Button components for user interactions.
 *
 * @page buttons Buttons
 */

/**
 * Primary button for main calls to action.
 *
 * @location buttons.primary Primary Button
 * @example
 * <button class="btn btn-primary">Save Changes</button>
 */
.btn-primary {
  padding: 10px 20px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
}
```

### Understanding the doc block

- `@page buttons Buttons` creates a documentation page titled "Buttons" with the key `buttons`
- `@location buttons.primary Primary Button` places content on the "Buttons" page in a section titled "Primary Button"
- `@example` creates a live preview showing the rendered button, followed by the code

## Build your documentation

Run your Rollup build:

```bash
# If using npm scripts
npm run build

# Or run Rollup directly
npx rollup -c
```

Rollup will output your bundle and generate UI-Doc files:

```text
dist/
  index.js          # Your bundle
  index.html        # Documentation home page
  buttons.html      # Buttons page
  ui-doc.css        # Documentation styles
  highlight.js      # Syntax highlighting
  highlight.css     # Code highlighting styles
```

## View your documentation

Open `dist/index.html` in your browser. You should see:

- The "My Component Library" title in the header
- A navigation menu with a "Buttons" link
- When you click "Buttons", the Primary Button section showing:
  - The description "Primary button for main calls to action"
  - A live rendered preview of the button
  - The HTML code below the preview

Try clicking the button in the preview. It works as a real HTML element because UI-Doc renders actual markup, not screenshots.

## Next steps

Now that you have UI-Doc running with Rollup:

- Read [Understanding doc blocks](../concepts/doc-blocks.md) to learn how doc blocks work
- See all available tags in the Tag Reference (coming soon)
- Learn how to include your bundled CSS and JavaScript in examples by using assets with `fromInput: true`

For more advanced configuration options like custom assets, output directories, and templates, see the [@ui-doc/rollup package documentation](../../packages/rollup/README.md).
