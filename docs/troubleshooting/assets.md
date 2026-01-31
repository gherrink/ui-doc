# Troubleshooting asset loading and paths

Common issues and solutions when working with assets in UI-Doc.

## Assets not loading in documentation

### Symptoms

- Browser console shows 404 errors for CSS or JavaScript files
- Documentation pages are unstyled or missing functionality
- Example previews do not render correctly
- Network tab shows failed asset requests

### Causes

This typically happens when:

1. The `output.baseUri` does not match your deployment path
2. Assets are configured in the wrong context (page vs example)
3. Assets from input have incorrect name configuration
4. Built-in assets failed to resolve from node_modules

### Solutions

**If baseUri is incorrect:**

The `output.baseUri` must match where you deploy the documentation. Check browser console for the attempted path versus the actual path.

```js
// For subdirectory deployment
uidoc({
  source: ['src/**/*.css'],
  output: {
    dir: 'docs',
    baseUri: '/styleguide/', // Must match server path
  },
})
```

```js
// For relative paths (portable documentation)
uidoc({
  source: ['src/**/*.css'],
  output: {
    dir: 'docs',
    baseUri: '.', // Use relative URLs
  },
})
```

```js
// For root deployment
uidoc({
  source: ['src/**/*.css'],
  output: {
    dir: 'docs',
    baseUri: '/', // Serve from root
  },
})
```

**If assets are in wrong context:**

Example assets must use `assets.example`, not `assets.page`. Page assets only load in documentation pages, not in example iframes.

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    // Component styles go in examples
    example: [
      {
        name: 'app',
        fromInput: true,
      },
    ],
    // Documentation-only assets go in page
    page: [
      {
        name: 'analytics.js',
        file: './src/docs/analytics.js',
      },
    ],
  },
})
```

**If asset from input has wrong name:**

When using `fromInput: true`, the asset `name` must exactly match a key in your build configuration's input object.

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

**If built-in assets fail to resolve:**

Ensure required peer dependencies are installed:

```bash
pnpm install @ui-doc/html-renderer @highlightjs/cdn-assets
```

If you want to disable highlight.js and avoid the dependency:

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    highlightStyle: false,
    highlightScript: false,
  },
})
```

### Prevention

To avoid asset loading issues:

- Test documentation deployment paths in development using the same `baseUri`
- Use relative paths (`baseUri: '.'`) for maximum portability
- Verify asset names match input keys when using `fromInput: true`
- Check browser console during development for 404 errors

---

## Static assets not copied

### Symptoms

- Images, fonts, or other static files return 404 errors
- Static assets folder does not appear in build output
- Assets work locally but fail after build

### Causes

This typically happens when:

1. The `assets.static` path is incorrect or relative to wrong directory
2. The static directory does not exist at build time
3. Build output directory is being cleared after UI-Doc runs

### Solutions

**If static path is incorrect:**

The `assets.static` path must be relative to your configuration file location, not the project root or output directory.

```js
// rollup.config.js in project root
uidoc({
  source: ['src/**/*.css'],
  assets: {
    static: './public/assets', // Relative to config file
  },
})
```

```js
// vite.config.js in subdirectory
uidoc({
  source: ['src/**/*.css'],
  assets: {
    static: '../public/assets', // Relative to config location
  },
})
```

**If directory does not exist:**

Verify the static directory exists before running the build:

```bash
ls -la ./public/assets
```

If the directory is created by another build step, ensure UI-Doc runs after that step completes.

**If build clears output:**

Some build configurations clear the output directory. Ensure UI-Doc writes to a subdirectory that is preserved:

```js
// vite.config.js
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true, // This clears dist/
  },
  plugins: [
    uidoc({
      output: {
        dir: 'docs', // Creates dist/docs/ which may be cleared
      },
      assets: {
        static: './public/assets',
      },
    }),
  ],
})
```

### Prevention

To avoid static asset issues:

- Use absolute paths during development to verify static directory location
- Check build output structure to confirm files are copied
- Place static assets in version control to ensure they exist during build

---

## Custom assets not loading

### Symptoms

- Custom CSS or JavaScript files return 404 errors
- Assets configured in `assets.page` or `assets.example` do not appear in output
- Browser console shows "Failed to load resource" errors

### Causes

This typically happens when:

1. Asset option is missing required source configuration
2. File path in `file` option cannot be resolved
3. Package in `dependency` option is not installed
4. Asset has invalid file extension (not recognized as style or script)

### Solutions

**If source configuration is missing:**

Every asset must have either `source`, `file`, `dependency`, or `fromInput: true`.

```text
// Invalid - no source specified
{
  name: 'custom.css',
}

// Valid options:
{
  name: 'custom.css',
  source: 'body { margin: 0; }', // Inline source
}

{
  name: 'custom.css',
  file: './src/docs/custom.css', // Read from file
}

{
  name: 'custom.css',
  dependency: 'normalize.css', // Load from package
}

{
  name: 'custom',
  fromInput: true, // Load from build input
}
```

**If file path is incorrect:**

File paths in the `file` option are resolved relative to your configuration file.

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    page: [
      {
        name: 'custom-styles.css',
        file: './src/docs/styles.css', // Relative to config file
      },
    ],
  },
})
```

Verify the file exists:

```bash
# From project root where config file is located
ls ./src/docs/styles.css
```

**If dependency package is missing:**

When using the `dependency` option, ensure the package is installed:

```bash
# Check if package is installed
pnpm list normalize.css

# Install if missing
pnpm install normalize.css
```

**If file extension is not recognized:**

UI-Doc only recognizes `.css`, `.scss`, `.sass`, `.less` (styles) and `.js`, `.ts` (scripts). Other extensions will not be included.

```text
// This asset will be filtered out (invalid extension)
{
  name: 'config.json',
  source: '{"key": "value"}',
}

// Use a recognized extension
{
  name: 'config.js',
  source: 'export default {"key": "value"}',
}
```

### Prevention

To avoid custom asset issues:

- Verify file paths during development
- Keep custom asset files in version control
- Use `fromInput: true` for assets already in your build pipeline
- Check build tool output for asset resolution warnings

---

## Source maps missing

### Symptoms

- Source maps (`.map` files) are not present in UI-Doc output
- Browser dev tools cannot show original source code
- Only minified code appears when debugging

### Causes

This typically happens when:

1. Build tool is not generating source maps
2. Assets from input are configured but source maps are disabled
3. Source maps are in different directory than asset files

### Solutions

**If build tool is not generating source maps:**

Enable source map generation in your build configuration.

```js
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps
  },
  plugins: [
    uidoc({
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
})
```

```js
// rollup.config.js
export default {
  output: {
    sourcemap: true, // Enable source maps
  },
  plugins: [
    uidoc({
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

**If source maps exist but are not copied:**

UI-Doc automatically copies source map files (`.map`) alongside assets when using `fromInput: true`. Verify that:

1. The build generates source maps before UI-Doc runs
2. Source map files have the same base name as the asset (e.g., `app.js` and `app.js.map`)
3. Source maps are in the same directory as the asset files

Check your build output:

```bash
# Source maps should exist in output before copy
ls dist/app.js.map
```

### Prevention

To ensure source maps work correctly:

- Always enable source maps in development builds
- Use `fromInput: true` for assets that need source maps
- Verify source map files are generated before UI-Doc runs

---

## Wrong syntax highlighting theme

### Symptoms

- Code examples use incorrect color scheme
- Syntax highlighting does not match design
- Highlight.js theme appears as default despite configuration

### Causes

This typically happens when:

1. Theme name is misspelled or does not exist
2. Highlight.js CDN assets are not installed
3. Custom theme name does not match available themes

### Solutions

**If theme name is incorrect:**

Verify the theme name matches an available highlight.js theme. See [available themes](https://github.com/highlightjs/highlight.js/tree/main/src/styles).

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    highlightTheme: 'github-dark', // Must match exact theme name
  },
})
```

Common theme names:

- `default`
- `github`
- `github-dark`
- `monokai`
- `atom-one-dark`
- `atom-one-light`
- `vs`
- `vs2015`

**If @highlightjs/cdn-assets is missing:**

Ensure the package is installed:

```bash
pnpm install @highlightjs/cdn-assets
```

**If using custom highlighting:**

You can disable built-in highlighting and provide your own:

```js
uidoc({
  source: ['src/**/*.css'],
  assets: {
    highlightStyle: false, // Disable default
    highlightScript: false,
    page: [
      {
        name: 'custom-highlight.css',
        file: './src/docs/highlight-theme.css',
      },
      {
        name: 'custom-highlight.js',
        file: './src/docs/highlight-script.js',
      },
    ],
  },
})
```

### Prevention

To avoid highlighting theme issues:

- Use common theme names that are well-supported
- Test theme appearance during development
- Check that theme exists before deploying

---

## Assets loading in production but not development

### Symptoms

- Assets load correctly after build but return 404 in dev server
- Examples work in production but not during development
- Paths appear correct but requests fail in dev mode

### Causes

This typically happens when:

1. Development server uses different base path than production
2. Assets from input are not generated during dev server start
3. Build output directory differs between dev and production

### Solutions

**If base paths differ between environments:**

Use environment-specific configuration:

```js
export default defineConfig(({ command }) => {
  return {
    plugins: [
      uidoc({
        source: ['src/**/*.css'],
        output: {
          baseUri: command === 'serve' ? '/ui-doc/' : '.',
        },
      }),
    ],
  }
})
```

**If assets from input are not generated in dev:**

Ensure your dev server builds the input assets before UI-Doc runs:

```js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: './src/index.js', // Built in production
      },
    },
  },
  plugins: [
    uidoc({
      assets: {
        example: [
          {
            name: 'app',
            fromInput: true, // May not exist in dev mode
          },
        ],
      },
    }),
  ],
})
```

Consider using `file` option for development:

```js
import process from 'node:process'

uidoc({
  assets: {
    example: [
      process.env.NODE_ENV === 'production'
        ? { name: 'app', fromInput: true }
        : { name: 'app.js', file: './src/index.js' },
    ],
  },
})
```

### Prevention

To avoid development vs production issues:

- Test with both dev server and production builds
- Use consistent base paths when possible
- Verify assets exist before UI-Doc processes them

---

## Still having issues?

If you are experiencing a problem not covered here:

1. Check the [Asset Management](../concepts/asset-management.md) concept guide for how assets work
2. Review the [Configure Assets](../how-to/configure-assets.md) how-to guide for setup instructions
3. Search [GitHub issues](https://github.com/gherrink/ui-doc/issues) for similar problems
4. Open a new issue with your configuration and error messages
