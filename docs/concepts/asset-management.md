# Understanding asset management

UI-Doc needs to bundle CSS, JavaScript, and other static files for your documentation to display and function correctly. Understanding how asset discovery and bundling works helps you configure documentation that matches your deployment needs and integrates seamlessly with your build pipeline.

## What is asset management?

Asset management is the process UI-Doc uses to discover, resolve, bundle, and deliver stylesheets, scripts, fonts, images, and other static resources needed by your generated documentation.

Assets in UI-Doc serve two distinct purposes: some assets style and enhance the documentation pages themselves (like UI-Doc's own stylesheet), while others enable your component examples to render correctly (like your application's compiled CSS and JavaScript). This separation ensures examples display exactly as they would in production while keeping documentation pages clean and consistent.

## How asset management works

Asset management happens in several phases during the build process. Each phase handles a specific responsibility, from discovering what assets exist to delivering them in the final build output.

### Discovery phase

When your build starts, UI-Doc identifies all assets that need to be included in the documentation. This includes:

**Built-in assets** - UI-Doc automatically discovers its required assets from installed packages:

- `ui-doc.min.css` and `ui-doc.min.js` from `@ui-doc/html-renderer`
- `highlight.min.js` and theme stylesheets from `@highlightjs/cdn-assets` (configurable or disabled)

**Custom assets** - Assets you explicitly configure are discovered based on their source type:

- Assets loaded from the file system are resolved to absolute paths
- Assets from node_modules packages are resolved through Node's require resolution
- Assets marked with `fromInput: true` are identified but not loaded yet (they come from your build)
- Inline assets with direct source content are prepared for bundling

### Resolution phase

Once discovered, UI-Doc resolves where each asset should come from:

```text
Asset Option → Resolution Strategy
────────────────────────────────────
fromInput: true     → Wait for Rollup/Vite to generate the asset
file: './path'      → Read from file system
dependency: 'pkg'   → Resolve from node_modules
source: 'content'   → Use provided content directly
```

The `NodeAssetLoader` class handles package resolution, searching through Node's module resolution paths to find installed packages and their exports. File system assets use standard path resolution relative to your configuration file.

### Bundling phase

During the build, UI-Doc emits assets into your build output:

**For assets with source content** (from files, packages, or inline):

1. UI-Doc creates a Rollup asset through `this.emitFile()`
2. The asset is written to the output directory with the configured `output.dir` prefix
3. Asset type (style or script) is determined by file extension
4. File naming is controlled by the `useAssetFileNames` option:
   - When `false` (default): Uses explicit `fileName` (e.g., `custom.css`)
   - When `true`: Omits `fileName`, letting Rollup apply `output.assetFileNames` pattern (e.g., `assets/custom-abc123.css`)

**For assets from input** (`fromInput: true`):

1. Rollup/Vite generates the asset through your normal build process
2. UI-Doc registers the asset but doesn't emit it (it already exists)
3. If `output.dir` creates a subdirectory, the asset is copied after the build completes

**Special handling for built-in assets:**

Built-in assets (ui-doc.css, ui-doc.js, highlight.js, etc.) and HTML documentation pages always use explicit file names regardless of the `useAssetFileNames` option. This ensures documentation structure remains predictable and accessible.

### Delivery phase

The final phase makes assets available in the generated HTML:

**Page assets** are included in documentation page HTML:

```html
<link rel="stylesheet" href="ui-doc.css">
<link rel="stylesheet" href="custom-docs.css">
<script src="ui-doc.js"></script>
```

**Example assets** are included in example preview iframes:

```html
<!-- Inside example iframe -->
<link rel="stylesheet" href="../app.css">
<script src="../app.js"></script>
```

Asset paths in HTML use the `output.baseUri` configuration to generate correct references for your deployment target.

## Asset flow diagram

```text
Configuration
     │
     ├─→ Built-in Assets
     │       │
     │       └─→ Resolve from packages
     │              (@ui-doc/html-renderer, @highlightjs/cdn-assets)
     │
     ├─→ Custom Assets (file/dependency)
     │       │
     │       └─→ Resolve & read source
     │              │
     │              └─→ Emit to output
     │
     ├─→ Custom Assets (fromInput)
     │       │
     │       └─→ Register for tracking
     │              │
     │              ├─→ Build generates asset
     │              │
     │              └─→ Copy to UI-Doc dir (if needed)
     │
     └─→ Static Assets
             │
             └─→ Copy directory to output
                    │
                    └─→ Preserve folder structure

All Assets
     │
     └─→ Generate HTML references
            │
            ├─→ Page assets in <head>/<body>
            │
            └─→ Example assets in iframes
```

## Asset management in practice

Here's how asset management works in a real configuration:

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
      output: {
        dir: 'docs',
        baseUri: '/styleguide/',
      },
      assets: {
        static: './public/images',
        highlightTheme: 'github-dark',
        page: [
          {
            name: 'analytics.js',
            file: './src/docs/analytics.js',
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

**What happens during the build:**

1. **Discovery** - UI-Doc finds:
   - `ui-doc.min.css` and `ui-doc.min.js` from `@ui-doc/html-renderer`
   - GitHub Dark theme for highlight.js from `@highlightjs/cdn-assets`
   - `analytics.js` at `./src/docs/analytics.js`
   - Registers `app` asset (will come from Vite)

2. **Resolution** - UI-Doc resolves:
   - Built-in packages through Node's module resolution
   - `analytics.js` to an absolute file path
   - `app` is marked to track Vite's output

3. **Bundling** - Build output:
   - Vite generates `dist/app.js` (your normal build)
   - UI-Doc emits to `dist/docs/`:
     - `ui-doc.css`, `ui-doc.js`
     - `highlight.css`, `highlight.js`
     - `analytics.js`
   - UI-Doc copies `dist/app.js` to `dist/docs/app.js`
   - Static images copied to `dist/docs/images/`

4. **Delivery** - Generated HTML:
   - Documentation pages include `ui-doc.css`, `highlight.css`, and `analytics.js`
   - Example iframes include `app.js`
   - All paths use `/styleguide/` prefix

## Why asset management matters

Understanding asset management helps you make better configuration decisions:

- **Correct rendering** - Examples only work when they have the necessary CSS and JavaScript. Separating page and example assets ensures components display accurately while documentation pages load minimal resources.

- **Build integration** - Using `fromInput: true` leverages your existing build pipeline instead of duplicating asset processing. Your Vite or Rollup configuration already handles transformations, minification, and code splitting.

- **Deployment flexibility** - The `output.baseUri` option lets you deploy documentation to any path (subdirectory, CDN, or relative URLs) without changing how you write doc blocks or reference assets.

- **Performance optimization** - UI-Doc bundles assets efficiently by resolving them once during build rather than at runtime. Built-in assets come pre-minified, and your custom assets use your existing optimization pipeline.

## Common misconceptions

### "Static assets must be in node_modules"

Static assets can come from anywhere in your project. The `assets.static` option accepts any directory path relative to your configuration file. This is useful for fonts, images, or other resources that don't need processing.

```text
assets: {
  static: './public/assets', // Any directory path works
}
```

### "Assets from input are copied during bundling"

Assets marked with `fromInput: true` are copied during the `writeBundle` phase, which happens after Rollup/Vite finishes generating all output files. This timing is critical because the asset must exist before UI-Doc can copy it.

### "All assets need to be listed in configuration"

Built-in assets (UI-Doc stylesheet, UI-Doc script, and highlight.js) are automatically included. You only configure custom assets or when you want to disable/replace defaults:

```text
assets: {
  highlightStyle: false, // Disable highlight.js CSS
  // UI-Doc styles still included automatically
}
```

### "Source maps aren't supported for assets from input"

UI-Doc automatically copies source map files (`.map`) alongside assets when using `fromInput: true`. If your build generates `app.js` and `app.js.map`, both are copied to the UI-Doc output directory.

## Related concepts

- [Doc blocks](./doc-blocks.md) - How documentation content is extracted from source files
- [Template system](./template-system.md) - How assets are referenced in generated HTML
- [Build integration](./build-integration.md) - How UI-Doc integrates with Rollup and Vite

## Further reading

- [Configure asset loading](../how-to/configure-assets.md) - Step-by-step guide for asset configuration
- [Rollup plugin API reference](../../packages/rollup/README.md) - Complete asset options documentation
- [HTML renderer documentation](../../packages/html-renderer/README.md) - How assets are rendered in HTML
