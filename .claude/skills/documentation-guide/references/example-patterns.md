# Example Patterns

Real documentation patterns from the UI-Doc demos and packages.

## Doc Block Patterns

### Page Creation

Create a dedicated page for a category of components:

```css
/**
 * The Variables page contains all design tokens and CSS custom properties.
 *
 * @page variables Variables
 */
```

### Section with Example

Document a component with a live example:

```css
/**
 * Buttons extend the `.control` class and can be used with different HTML elements.
 *
 * @location components.button Button
 * @example
 * <button class="btn">Button</button>
 * <button class="btn" disabled>Button disabled</button>
 * <a href="#" class="btn">Link Button</a>
 * <input type="submit" class="btn" value="Submit button" />
 */
.btn {
  /* styles */
}
```

### Nested Sections

Organize related variants under a parent section:

```css
/**
 * We use background colors to modify button appearance.
 *
 * @location components.button.colors Colors
 * @example
 * <button class="btn bg-white">White</button>
 * <button class="btn bg-black">Black</button>
 */

/**
 * Hover effects are disabled on disabled buttons.
 *
 * @location components.button.colors.hover Hover Effect
 * @example
 * <button class="btn bg-black" disabled>Disabled</button>
 * <button class="btn bg-black no-hover">No hover</button>
 */
```

### Color Documentation

Document a color palette:

```css
/**
 * The color palette defines all brand and UI colors.
 *
 * @location variables.colors Colors
 * @color {--color-black|--color-white} --color-black | Black
 * @color {20 33 61|255 255 255} --color-blue | Blue
 * @color {252 163 17} --color-yellow | Yellow
 * @color {229 229 229} --color-gray | Gray
 * @color {255 255 255} --color-white | White
 */
:root {
  --color-black: 0 0 0;
  --color-blue: 20 33 61;
  --color-yellow: 252 163 17;
  --color-gray: 229 229 229;
  --color-white: 255 255 255;
}
```

### Spacing Documentation

Document spacing scale:

```css
/**
 * Spacing variables for consistent layout.
 *
 * @location variables.spacing Spacing
 * @space {0.5} --space-xs | Extra Small
 * @space {0.8} --space-sm | Small
 * @space {1} --space-md | Medium
 * @space {1.2} --space-lg | Large
 * @space {2} --space-xl | Extra Large
 */
```

### Code Without Preview

Show code that shouldn't be rendered:

```css
/**
 * JavaScript example for dynamic button states.
 *
 * @location components.button.javascript JavaScript
 * @code
 * const btn = document.querySelector('.btn')
 * btn.addEventListener('click', () => {
 *   btn.classList.toggle('active')
 * })
 */
```

### Preview Without Code

Show visual result without exposing implementation:

```css
/**
 * Icon showcase displaying available icons.
 *
 * @location components.icons.showcase Showcase
 * @example
 * <span class="icon icon-check"></span>
 * <span class="icon icon-close"></span>
 * <span class="icon icon-arrow"></span>
 * @hideCode
 */
```

### Using @code to Clean Up Example

Show clean code while example has extra styling:

```css
/**
 * Container with responsive width.
 *
 * @location components.container Container
 * @example
 * <div class="container" style="background: #eee; padding: 20px;">
 *   Container content
 * </div>
 *
 * @code
 * <div class="container">
 *   Container content
 * </div>
 */
```

## Configuration Patterns

### Vite with Custom Assets

```js
// vite.config.mjs
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
        output: {
          baseUri: command === 'serve' ? undefined : '.',
        },
        source: ['css/**/*.css'],
        templatePath: 'ui-doc/templates',
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

### Rollup Basic Setup

```js
import uidoc from '@ui-doc/rollup'
// rollup.config.mjs
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
        texts: {
          title: 'Design System',
          copyright: '© 2025 MyCompany',
        },
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
}
```

### Node.js Script

```js
// generate-docs.mjs
import fs from 'node:fs/promises'
import { UIDoc } from '@ui-doc/core'
import { HtmlRenderer, NodeParser, TemplateLoader } from '@ui-doc/html-renderer'
import { NodeFileSystem } from '@ui-doc/node'

const fileSystem = new NodeFileSystem()
const renderer = new HtmlRenderer(NodeParser.init())

// Load built-in templates
const templatePath = await fileSystem.assetLoader().packagePath(
  TemplateLoader.TEMPLATES_PACKAGE,
)
await TemplateLoader.load({ renderer, fileSystem, templatePath })

// Create UI-Doc instance
const uidoc = new UIDoc({
  renderer,
  texts: {
    title: 'My Documentation',
  },
})

// Process source files
const cssContent = await fs.readFile('./src/styles.css', 'utf8')
uidoc.sourceCreate('./src/styles.css', cssContent)

// Output documentation
await uidoc.output(async (file, content) => {
  await fs.mkdir('./docs', { recursive: true })
  await fs.writeFile(`./docs/${file}`, content)
})

// Copy assets
const assetLoader = fileSystem.assetLoader()
await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.css', './docs/ui-doc.css')
await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.js', './docs/ui-doc.js')
await assetLoader.copy('@highlightjs/cdn-assets/styles/default.min.css', './docs/highlight.css')
await assetLoader.copy('@highlightjs/cdn-assets/highlight.min.js', './docs/highlight.js')

console.log('Documentation generated!')
```

## Project Structure Patterns

### Standalone Documentation Project

```
project/
├── css/
│   ├── components/
│   │   ├── button.css
│   │   └── card.css
│   └── variables/
│       ├── colors.css
│       └── spacing.css
├── ui-doc/
│   ├── assets/
│   │   └── logo.svg
│   ├── templates/       # Custom template overrides
│   │   └── partials/
│   │       └── header.html
│   └── custom.css       # Documentation-specific styles
├── docs/                # Output directory
├── vite.config.mjs
└── package.json
```

### Integrated with Application

```
project/
├── src/
│   ├── components/
│   │   └── Button.tsx
│   ├── styles/
│   │   ├── button.css   # Contains doc blocks
│   │   └── index.css
│   └── main.tsx
├── dist/
│   ├── assets/
│   └── ui-doc/          # Documentation output
├── vite.config.mjs
└── package.json
```

## File Organization Patterns

### By Component Type

```css
/* css/components/button.css */
/**
 * @page components Components
 */

/**
 * @location components.button Button
 */

/**
 * @location components.button.primary Primary
 */

/**
 * @location components.button.secondary Secondary
 */
```

### By Design Token Category

```css
/* css/tokens/colors.css */
/**
 * @page tokens Design Tokens
 */

/**
 * @location tokens.colors Colors
 * @color ...
 */

/* css/tokens/spacing.css */
/**
 * @location tokens.spacing Spacing
 * @space ...
 */
```

### Flat Structure with Order

```css
/**
 * @page getting-started Getting Started
 * @order 1
 */

/**
 * @page components Components
 * @order 2
 */

/**
 * @page utilities Utilities
 * @order 3
 */
```
