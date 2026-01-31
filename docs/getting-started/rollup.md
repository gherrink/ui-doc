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
npm install --save-dev @ui-doc/rollup @ui-doc/html-renderer @highlightjs/cdn-assets

# yarn
yarn add --dev @ui-doc/rollup @ui-doc/html-renderer @highlightjs/cdn-assets

# pnpm
pnpm install --save-dev @ui-doc/rollup @ui-doc/html-renderer @highlightjs/cdn-assets
```

> **Note:** `@ui-doc/html-renderer` is required for generating HTML documentation pages. `@highlightjs/cdn-assets` provides syntax highlighting for code examples and can be skipped if you disable highlighting in your configuration.

## Basic setup

Add the UI-Doc plugin to your Rollup configuration. This minimal setup searches your source files for doc blocks and generates HTML pages in your output directory.

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
/* src/button.css */

/**
 * Button components for user interactions.
 *
 * @page buttons Buttons
 */

/**
 * Primary button for main calls to action.
 * Use this for form submissions and important actions.
 *
 * @location buttons.primary Primary Button
 * @example
 * <button class="btn btn-primary">Save Changes</button>
 */
.btn-primary {
  background: #0066cc;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #0052a3;
}
```

### Understanding the doc block

- `@page buttons Buttons` creates a documentation page titled "Buttons" with the key `buttons`
- `@location buttons.primary Primary Button` places content on the "Buttons" page in a section titled "Primary Button"
- `@example` creates a live preview showing the rendered button, followed by the HTML code

The text before the tags becomes the section description.

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

## Build for production

The documentation is generated as static HTML files in your output directory. To serve them in production:

1. Deploy the entire `dist/` directory to your web server or hosting platform
2. The documentation will be available at the root of your deployment
3. No server-side processing is required - all pages are static HTML

### Organizing documentation separately

To keep documentation in a separate directory, configure the `output.dir` option:

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
      output: {
        dir: 'ui-doc',
        baseUri: '.',
      },
      settings: {
        texts: {
          title: 'My Component Library',
        },
      },
    }),
  ],
}
```

This generates documentation in `dist/ui-doc/` with relative URLs, making it portable and viewable without a web server.

## Watch mode

To rebuild documentation automatically during development, use Rollup's watch mode:

```bash
# If using npm scripts
npm run dev

# Or run Rollup directly
npx rollup -c --watch
```

UI-Doc will regenerate documentation whenever you modify files matching your `source` patterns.

## Next steps

Now that you have UI-Doc running with Rollup:

- Learn more about doc blocks and available tags in the [@ui-doc/core documentation](../../packages/core/README.md)
- Explore advanced configuration in the [@ui-doc/rollup documentation](../../packages/rollup/README.md)
- Include your bundled CSS in examples using `assets.example` with `fromInput: true`
- Customize the documentation appearance with custom templates using the `templatePath` option

## Troubleshooting

### Documentation not generated

If no documentation files appear in your output directory:

- Verify your `source` patterns match your files (use `npx rollup -c` with verbose logging)
- Check that your files contain valid JSDoc-style doc blocks using `/** */` syntax
- Ensure at least one doc block includes a `@page` tag to create a documentation page

### Styles not showing in examples

If your button styles don't appear in the example preview:

- Add your CSS as an example asset using the `assets.example` option
- For CSS generated by your Rollup build, use `fromInput: true` to reference the bundled output
- See the [@ui-doc/rollup documentation](../../packages/rollup/README.md#assets-options) for details on asset configuration

### Assets not loading

If you see 404 errors for documentation assets:

- Check that `output.baseUri` matches your deployment path
- When using `output.dir`, ensure `baseUri` is set correctly (use `'.'` for relative URLs)
- Verify the asset files exist in the expected location in your output directory
