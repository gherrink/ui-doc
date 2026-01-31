# Getting started with UI-Doc for Vite

UI-Doc generates interactive documentation from JSDoc-style comments in your source files. In this guide, you'll install UI-Doc in a Vite project, write your first doc block, and view the generated documentation.

## Prerequisites

Before you begin, make sure you have:

- Node.js 16.0 or later
- Vite 5.0 or later installed and configured
- A Vite project (create one with `npm create vite@latest` if needed)

## What you'll build

In this guide, you'll:

1. Install UI-Doc and its dependencies
2. Configure the Vite plugin
3. Write a doc block for a button component
4. View your documentation in the browser

## Installation

Install UI-Doc and its dependencies:

```bash
# npm
npm install --save-dev @ui-doc/vite @ui-doc/html-renderer @highlightjs/cdn-assets

# yarn
yarn add --dev @ui-doc/vite @ui-doc/html-renderer @highlightjs/cdn-assets

# pnpm
pnpm install --save-dev @ui-doc/vite @ui-doc/html-renderer @highlightjs/cdn-assets
```

> **Note:** `@highlightjs/cdn-assets` provides syntax highlighting for code examples. You can skip it if you disable syntax highlighting in your configuration.

## Basic setup

Add the UI-Doc plugin to your `vite.config.js` or `vite.config.ts`. This configuration tells UI-Doc to scan CSS files for documentation blocks and generate documentation at `/ui-doc/` during development.

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
          title: 'My Component Library',
        },
      },
    }),
  ],
})
```

For TypeScript projects, use the same configuration in `vite.config.ts`:

```ts
// vite.config.ts
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

## Write your first doc block

Create a CSS file with a documentation block. If you already have CSS files in your project, you can add doc blocks to them.

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

This example contains two doc blocks:

**The first doc block** (lines 90-94) creates a page:

- `@page buttons Buttons` creates a documentation page titled "Buttons"

**The second doc block** (lines 96-103) creates content on that page:

- `@location buttons.primary Primary Button` places content in the "Primary Button" section on the Buttons page
- `@example` shows a live preview of the button with the HTML code displayed below it
- The text before the tags becomes the section description

## View your documentation

Start the Vite development server:

```bash
# npm
npm run dev

# yarn
yarn dev

# pnpm
pnpm dev
```

You'll see output similar to this:

```text
  VITE v5.3.1  ready in 450 ms

  ➜  Local:   http://localhost:5173/

  UI-Doc v0.3.1 under /ui-doc/

  ➜  Local: http://localhost:5173/ui-doc/
```

Open your browser to `http://localhost:5173/ui-doc/`. You should see:

- A navigation menu listing your "Buttons" page
- The "Primary Button" section with your description
- A live preview of the button (you can click it)
- The HTML code below the preview

The documentation automatically reloads when you edit your CSS files.

## Build for production

When you build your project, UI-Doc generates static HTML documentation alongside your application:

```bash
# npm
npm run build

# yarn
yarn build

# pnpm
pnpm build
```

The documentation will be output to `dist/ui-doc/` by default. You can customize this with the `output.dir` option.

### Using relative URLs in production

For portable documentation that works without a web server, configure UI-Doc to use relative URLs in production:

```js
// vite.config.js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  return {
    plugins: [
      uidoc({
        source: ['src/**/*.css'],
        output: {
          baseUri: command === 'serve' ? undefined : '.',
        },
        settings: {
          texts: {
            title: 'My Component Library',
          },
        },
      }),
    ],
  }
})
```

This uses absolute URLs during development (required for the dev server) and relative URLs in the build output.

## Next steps

Now that you have UI-Doc running:

- [Understanding doc blocks](../concepts/doc-blocks.md) - Learn how doc blocks work and how to use them effectively
- [First Component Tutorial](../tutorials/first-component.md) - Build a complete component with documentation
- [@ui-doc/vite Package Reference](../../packages/vite/README.md) - Explore all configuration options
- [@ui-doc/core Package Reference](../../packages/core/README.md) - Learn about available tags and advanced features

## Troubleshooting

### Documentation not showing at /ui-doc/

Make sure you don't set `output.baseUri` to `'.'` in development mode. The Vite dev server requires an absolute path. Use conditional configuration as shown in the production build section above.

### Assets not loading in examples

If your button styles aren't showing in the preview, you may need to register your CSS as an example asset. See the [@ui-doc/vite documentation](../../packages/vite/README.md#assets-configuration) for details on the `assets.example` option.

### Hot reload not working

UI-Doc automatically watches files matching your `source` patterns. If changes aren't triggering a reload:

1. Check that your file matches the `source` glob pattern
2. Verify your doc blocks use the correct `/** */` syntax
3. Try restarting the dev server
