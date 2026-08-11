# Getting started with UI-Doc for Node.js

UI-Doc generates interactive documentation from JSDoc-style comments in your source files. In this guide, you'll use UI-Doc programmatically in a Node.js script, write your first doc block, and generate static HTML documentation.

## Prerequisites

Before you begin, make sure you have:

- Node.js 20.19, 22.12, or 24 and later
- A JavaScript or TypeScript project with source files to document

## What you'll build

In this guide, you'll:

1. Install UI-Doc and its dependencies
2. Create a Node.js script that generates documentation
3. Write a doc block for a button component
4. Generate and view static HTML documentation

## Installation

Install UI-Doc and its dependencies:

```bash
# npm
npm install --save-dev @ui-doc/core @ui-doc/node @ui-doc/html-renderer @highlightjs/cdn-assets

# yarn
yarn add --dev @ui-doc/core @ui-doc/node @ui-doc/html-renderer @highlightjs/cdn-assets

# pnpm
pnpm install --save-dev @ui-doc/core @ui-doc/node @ui-doc/html-renderer @highlightjs/cdn-assets
```

> **Note:** `@highlightjs/cdn-assets` provides syntax highlighting for code examples. You can skip it if you don't need syntax highlighting.

## Create a documentation script

Create a new file named `generate-docs.mjs` in your project root. This script will discover your source files, parse doc blocks, and generate HTML documentation.

```js
// generate-docs.mjs
import { UIDoc } from '@ui-doc/core'
import { HtmlRenderer, NodeParser, TemplateLoader } from '@ui-doc/html-renderer'
import { createNodeFileSystem } from '@ui-doc/node'

async function generateDocs() {
  const outputDir = './docs'

  // Initialize file system
  const fileSystem = createNodeFileSystem()
  const assetLoader = fileSystem.assetLoader()

  // Create HTML renderer
  const renderer = new HtmlRenderer(NodeParser.init())

  // Load built-in templates
  const templatePath = await assetLoader.packagePath(TemplateLoader.TEMPLATES_PACKAGE)
  await TemplateLoader.load({ fileSystem, renderer, templatePath })

  // Initialize UI-Doc
  const uidoc = new UIDoc({
    renderer,
    texts: {
      title: 'My Component Library',
    },
  })

  // Find and parse CSS source files
  const finder = fileSystem.createFileFinder(['src/**/*.css'])
  await finder.search(async file => {
    const content = await fileSystem.fileRead(file)
    uidoc.sourceCreate(file, content)
  })

  // Create output directories
  await fileSystem.ensureDirectoryExists(outputDir)
  await fileSystem.ensureDirectoryExists(`${outputDir}/examples`)

  // Write documentation files
  await uidoc.output(async (file, content) => {
    await fileSystem.fileWrite(`${outputDir}/${file}`, content)
  })

  // Copy required assets
  await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.css', `${outputDir}/ui-doc.css`)
  await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.js', `${outputDir}/ui-doc.js`)
  await assetLoader.copy(
    '@highlightjs/cdn-assets/styles/default.min.css',
    `${outputDir}/highlight.css`,
  )
  await assetLoader.copy('@highlightjs/cdn-assets/highlight.min.js', `${outputDir}/highlight.js`)

  console.log(`Documentation generated in ${outputDir}/`)
}

generateDocs()
```

### Understanding the script

The script follows these steps:

1. Creates a file system instance for reading and writing files
2. Initializes the HTML renderer with built-in templates
3. Creates a UI-Doc instance with your configuration
4. Searches for CSS files matching the glob pattern `src/**/*.css`
5. Parses doc blocks from each file
6. Writes the generated HTML files to the `docs/` directory
7. Copies required CSS and JavaScript assets

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

- `@page buttons Buttons` creates a documentation page titled "Buttons"
- `@location buttons.primary Primary Button` places content in a section on the Buttons page
- `@example` shows a live preview of the button with the HTML code displayed below it

The text before the tags becomes the section description.

## Generate your documentation

Run the script to generate documentation:

```bash
node generate-docs.mjs
```

You should see output like this:

```text
Documentation generated in docs/
```

The `docs/` directory now contains:

- `index.html` - The main documentation page
- `buttons.html` - The Buttons page you created
- `ui-doc.css` - UI-Doc styles
- `ui-doc.js` - UI-Doc JavaScript
- `highlight.css` - Syntax highlighting styles
- `highlight.js` - Syntax highlighting library
- `examples/` - Directory for example assets

## View your documentation

Open `docs/index.html` in your browser. You should see:

- A navigation menu listing your "Buttons" page
- The "Primary Button" section with your description
- A live preview of the button (you can click it)
- The HTML code below the preview

> **Tip:** For easier viewing during development, use a local web server like `npx serve docs` or Python's `python -m http.server -d docs`.

## Document multiple file types

To document CSS, JavaScript, and TypeScript files, update the glob patterns:

```js
// generate-docs.mjs
const finder = fileSystem.createFileFinder(['src/**/*.css', 'src/**/*.js', 'src/**/*.ts'])
```

## Add to your package.json

For convenience, add the script to your `package.json`:

```json
{
  "scripts": {
    "docs": "node generate-docs.mjs"
  }
}
```

Now you can generate documentation with:

```bash
npm run docs
```

## Next steps

Now that you have UI-Doc generating documentation:

- [Understanding doc blocks](../concepts/doc-blocks.md) - Learn how doc blocks work and how to use them effectively
- [Tag Reference](../reference/tags.md) - See all available documentation tags
- [Node.js API](../../packages/node/README.md) - Explore file system operations and asset loading
- [Custom Templates](../how-to/custom-templates.md) - Customize the documentation appearance

## Advanced usage

### Using TypeScript

If you prefer TypeScript, rename your script to `generate-docs.ts` and use TypeScript's type definitions:

```ts
// generate-docs.ts
import { UIDoc } from '@ui-doc/core'
import { HtmlRenderer, NodeParser, TemplateLoader } from '@ui-doc/html-renderer'
import { createNodeFileSystem } from '@ui-doc/node'

async function generateDocs(): Promise<void> {
  const outputDir = './docs'
  const fileSystem = createNodeFileSystem()
  const assetLoader = fileSystem.assetLoader()

  const renderer = new HtmlRenderer(NodeParser.init())
  const templatePath = await assetLoader.packagePath(TemplateLoader.TEMPLATES_PACKAGE)

  if (!templatePath) {
    throw new Error('Template package not found')
  }

  await TemplateLoader.load({ fileSystem, renderer, templatePath })

  const uidoc = new UIDoc({
    renderer,
    texts: {
      title: 'My Component Library',
    },
  })

  // Continue with file processing...
}

generateDocs()
```

Run it with `tsx` or compile it first:

```bash
# Using tsx
npx tsx generate-docs.ts

# Or compile and run
tsc generate-docs.ts && node generate-docs.js
```

### Error handling

Add error handling to catch parsing errors:

```js
import { BlockParseError } from '@ui-doc/core'
import { HTMLRendererSyntaxError } from '@ui-doc/html-renderer'

try {
  await finder.search(async file => {
    const content = await fileSystem.fileRead(file)
    uidoc.sourceCreate(file, content)
  })
} catch (error) {
  if (error instanceof BlockParseError) {
    console.error('Error parsing doc block:', error.message)
    console.error('File:', error.source)
  } else {
    throw error
  }
}
```

### Custom configuration

You can customize UI-Doc behavior with additional options:

```js
const uidoc = new UIDoc({
  renderer,
  texts: {
    title: 'My Component Library',
    copyright: '© 2024 My Company',
  },
  generate: {
    name: () => 'My Library',
    footerText: () => 'Custom footer text',
  },
})
```

See the [@ui-doc/core documentation](../../packages/core/README.md) for all available options.

## Troubleshooting

### Template package not found

If you see an error about the template package not being found, ensure `@ui-doc/html-renderer` is installed:

```bash
npm list @ui-doc/html-renderer
```

If it's missing, reinstall it:

```bash
npm install --save-dev @ui-doc/html-renderer
```

### No doc blocks found

If your script runs but generates no documentation:

1. Verify your source files exist in the paths specified by the glob patterns
2. Check that doc blocks use the correct `/** */` syntax (not `/* */`)
3. Ensure at least one doc block includes a `@page` or `@location` tag

### Permission errors

If you get permission errors when writing files, ensure:

1. You have write permissions to the output directory
2. The output directory isn't being used by another process
3. Your file system supports the required operations
