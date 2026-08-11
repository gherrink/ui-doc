# Troubleshooting build output and hot reload

Common issues and solutions when working with UI-Doc build output, file generation, and hot module reloading.

## Documentation files not generated

### Symptoms

- Running the build completes without errors but no documentation files appear
- The output directory is empty or missing
- Build logs show UI-Doc messages but no files are created

### Causes

This typically happens when:

1. Your source files don't contain valid doc blocks
2. The `source` glob patterns don't match any files
3. Doc blocks have syntax errors that prevent parsing
4. The output path is incorrect or inaccessible

### Solutions

**If your source patterns don't match files:**

Verify your glob patterns match the actual file locations. Run your build with verbose logging to see which files UI-Doc discovers.

```js
// Check if your patterns are correct
uidoc({
  source: ['src/**/*.css'], // Make sure files exist at src/**/*.css
})
```

Test your glob pattern matches files:

```bash
# List files matching your pattern
ls src/**/*.css
```

**If your files don't contain doc blocks:**

UI-Doc only generates documentation when it finds valid JSDoc-style comment blocks with UI-Doc tags. Add at least one doc block to your source files:

```css
/**
 * Creates a page for component documentation.
 *
 * @page components Components
 */
```

**If doc blocks have syntax errors:**

Check your build output or Rollup/Vite logs for parsing warnings. UI-Doc warns when it encounters malformed doc blocks but continues processing.

```text
[ui-doc] Warning: Unexpected tag @exampl in src/button.css:15
         Did you mean @example?
```

Fix the syntax error in your doc block:

```css
/* Wrong - typo in tag name */
/**
 * @exampl
 * <button>Click</button>
 */

/* Correct */
/**
 * @example
 * <button>Click</button>
 */
```

**If the output directory is inaccessible:**

Verify the output directory path is valid and you have write permissions. The path is relative to your Rollup or Vite output directory:

```js
// Rollup config
export default {
  output: {
    dir: 'dist', // Base directory
  },
  plugins: [
    uidoc({
      output: {
        dir: 'ui-doc', // Creates dist/ui-doc/
      },
    }),
  ],
}
```

### Prevention

To avoid this issue in the future:

- Test your glob patterns before building
- Add at least one doc block to verify UI-Doc is working
- Enable verbose logging during development
- Check file permissions on the output directory

---

## Documentation not showing in Vite dev server

### Symptoms

- Vite dev server starts successfully
- UI-Doc logs show the documentation URL
- Visiting the URL shows a 404 or blank page
- Browser console shows errors loading pages

### Causes

This typically happens when:

1. `output.baseUri` is set to `'.'` (relative URLs) in development mode
2. The `output.dir` value conflicts with Vite's routing
3. Vite's base option doesn't match UI-Doc's configuration

### Solutions

**If baseUri is set to relative URLs:**

The Vite dev server requires absolute paths. Use conditional configuration to set different values for dev and build:

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
          // Use absolute path in dev, relative in build
          baseUri: command === 'serve' ? undefined : '.',
        },
      }),
    ],
  }
})
```

**If the output directory conflicts with Vite routing:**

Ensure your `output.dir` doesn't collide with your application routes. The default is `ui-doc`, which works for most projects:

```js
uidoc({
  output: {
    dir: 'ui-doc', // Serves at /ui-doc/
  },
})
```

If you need a different path, make sure it doesn't overlap with your app:

```js
// If your app uses /docs/ route, choose a different name
uidoc({
  output: {
    dir: 'documentation', // Serves at /documentation/
  },
})
```

**If Vite's base doesn't match:**

When using Vite's `base` option, coordinate it with UI-Doc's `baseUri`:

```js
// vite.config.js
export default defineConfig({
  base: '/my-app/', // Vite serves from /my-app/
  plugins: [
    uidoc({
      output: {
        dir: 'ui-doc',
        baseUri: '/my-app/ui-doc/', // Match Vite's base
      },
    }),
  ],
})
```

### Prevention

To avoid this issue in the future:

- Always use conditional configuration for `baseUri` when deploying to different environments
- Keep the default `output.dir` unless you have a specific reason to change it
- Test documentation in both dev server and production build

---

## Assets not loading in documentation pages

### Symptoms

- Documentation pages display but styles are missing
- Examples show HTML code but no styling or interactivity
- Browser console shows 404 errors for CSS/JS files
- Syntax highlighting is missing

### Causes

This typically happens when:

1. Assets marked with `fromInput: true` don't match Rollup/Vite input entries
2. The `output.baseUri` is incorrect for your deployment
3. Asset file paths are wrong or files don't exist
4. Required peer dependencies are missing

### Solutions

**If assets from input aren't found:**

When using `fromInput: true`, the asset name must match a key in your Rollup or Vite input configuration:

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: './src/index.js', // Input name is 'app'
      },
    },
  },
  plugins: [
    uidoc({
      assets: {
        example: [
          {
            name: 'app', // Must match input key
            fromInput: true,
          },
        ],
      },
    }),
  ],
})
```

**If baseUri causes 404 errors:**

Check browser console for the failed request URL, then adjust `output.baseUri` to match your deployment:

```js
// For subdirectory deployment
uidoc({
  output: {
    baseUri: '/styleguide/', // Assets load from /styleguide/asset.css
  },
})

// For root deployment
uidoc({
  output: {
    baseUri: '/', // Assets load from /asset.css
  },
})

// For relative URLs (static hosting)
uidoc({
  output: {
    baseUri: '.', // Assets load from ./asset.css
  },
})
```

**If file paths are incorrect:**

Verify asset file paths are relative to your project root:

```js
uidoc({
  assets: {
    example: [
      {
        name: 'custom.css',
        file: './src/docs/custom.css', // Path from project root
      },
    ],
  },
})
```

Check that the file exists:

```bash
ls ./src/docs/custom.css
```

**If highlight.js is missing:**

UI-Doc requires `@highlightjs/cdn-assets` for syntax highlighting. Install it if you see errors:

```bash
pnpm install --save-dev @highlightjs/cdn-assets
```

Or disable highlighting if you don't need it:

```js
uidoc({
  assets: {
    highlightStyle: false,
    highlightScript: false,
  },
})
```

### Prevention

To avoid this issue in the future:

- Always verify input names match when using `fromInput: true`
- Test your documentation with the same `baseUri` you'll use in production
- Use absolute paths or verify relative paths from project root
- Include `@highlightjs/cdn-assets` in your dependencies

---

## Hot reload not working

### Symptoms

- Changes to source files don't update documentation automatically
- You must manually refresh the browser to see updates
- The dev server doesn't detect file changes
- Template changes don't trigger updates

### Causes

This typically happens when:

1. Source files don't match the `source` glob patterns
2. Files are outside Vite's watch directory
3. File system watchers are not configured correctly
4. Template hot-reload is not supported for your renderer

### Solutions

**If source files aren't being watched:**

Verify your files match the `source` patterns you configured:

```js
uidoc({
  source: ['src/**/*.css', 'src/**/*.js'], // Matches all CSS and JS in src/
})
```

Test if your file matches:

```bash
# If your file is src/components/button.css
# Pattern src/**/*.css should match it
```

Adjust the pattern if needed:

```js
// If files are in css/ directory instead of src/
uidoc({
  source: ['css/**/*.css'], // Update to match actual location
})
```

**If files are outside the watch directory:**

Vite only watches files inside your project root by default. If your source files are elsewhere, you need to configure Vite's watch:

```js
// vite.config.js
export default defineConfig({
  server: {
    watch: {
      // Add additional directories to watch
      ignored: ['!**/external-sources/**'],
    },
  },
  plugins: [
    uidoc({
      source: ['external-sources/**/*.css'],
    }),
  ],
})
```

**If template changes aren't detected:**

UI-Doc supports hot-reload for custom templates when using the HTML renderer. Verify your `templatePath` is configured:

```js
uidoc({
  templatePath: './ui-doc/templates',
})
```

Template files must be in the correct subdirectories:

```text
ui-doc/templates/
├── layouts/
│   └── custom.html
├── pages/
│   └── index.html
└── partials/
    └── header.html
```

Changes to template files automatically reload the documentation.

**If the dev server doesn't detect changes:**

Try restarting the dev server. Some file system configurations (network drives, Docker volumes) may not trigger watch events correctly. You can force polling:

```js
// vite.config.js
export default defineConfig({
  server: {
    watch: {
      usePolling: true,
    },
  },
})
```

### Prevention

To avoid this issue in the future:

- Keep source files inside your project directory
- Use glob patterns that match current and future files
- Organize templates in the expected directory structure
- Test hot-reload after initial setup

---

## Assets from input not copied to UI-Doc directory

### Symptoms

- Assets marked with `fromInput: true` work in dev but fail in production
- Build completes but assets are missing from the UI-Doc output directory
- Assets exist in the main build output but not in `dist/ui-doc/`
- Examples don't load styles or scripts in the production build

### Causes

This typically happens when:

1. The asset name doesn't match the Rollup/Vite input key
2. The build hasn't completed before UI-Doc tries to copy assets
3. Source maps are missing (if expected)

### Solutions

**If asset names don't match:**

Verify the asset name matches the input configuration exactly:

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
            name: 'my-app', // Must exactly match 'my-app'
            fromInput: true,
          },
        ],
      },
    }),
  ],
})
```

**If the build timing is wrong:**

UI-Doc copies assets during the `writeBundle` phase, which runs after Rollup/Vite generates all output. This should work automatically, but if you're experiencing issues:

Check that the asset exists in the build output before UI-Doc runs:

```bash
# After build completes
ls dist/assets/my-app*.js
```

If the file exists in `dist/` but isn't copied to `dist/ui-doc/`, verify your `output.dir` is set correctly:

```js
uidoc({
  output: {
    dir: 'ui-doc', // Creates dist/ui-doc/ and copies assets there
  },
})
```

**If source maps are missing:**

UI-Doc automatically copies `.map` files alongside assets when they exist. If source maps aren't being generated:

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
            fromInput: true, // Copies both app.js and app.js.map
          },
        ],
      },
    }),
  ],
})
```

### Prevention

To avoid this issue in the future:

- Use consistent naming between input keys and asset configurations
- Enable source maps if you need them for debugging
- Verify assets are generated before testing the documentation build

---

## Custom templates not applied

### Symptoms

- Documentation generates but uses default templates
- Custom template files are ignored
- Template changes have no effect
- Documentation looks the same as default

### Causes

This typically happens when:

1. The `templatePath` points to a non-existent directory
2. Template files have incorrect names or structure
3. Templates use invalid syntax
4. The renderer doesn't support custom templates

### Solutions

**If the templatePath is wrong:**

Verify the path exists and contains template files:

```js
uidoc({
  templatePath: './ui-doc/templates', // Path from project root
})
```

Check the directory structure:

```bash
ls ./ui-doc/templates
# Should show: layouts/  pages/  partials/
```

**If template files have the wrong structure:**

UI-Doc expects templates in specific subdirectories with specific names:

```text
ui-doc/templates/
├── layouts/
│   ├── default.html    # Override default layout
│   └── custom.html     # Add custom layout
├── pages/
│   ├── index.html      # Override index page template
│   └── page.html       # Override standard page template
└── partials/
    ├── header.html     # Override header partial
    └── footer.html     # Override footer partial
```

Template filenames must match exactly (including `.html` extension).

**If templates have syntax errors:**

UI-Doc uses Handlebars templating. Verify your templates use valid Handlebars syntax:

```html
<!-- Valid Handlebars -->
<h1>{{title}}</h1>

{{#each sections}}
<section>{{this.title}}</section>
{{/each}}
```

Check the build output for template compilation errors.

**If using a custom renderer:**

Custom templates only work with the default `HtmlRenderer` from `@ui-doc/html-renderer`. If you've specified a custom renderer, it may not support template overrides:

```js
import { HtmlRenderer } from '@ui-doc/html-renderer'

uidoc({
  renderer: new HtmlRenderer(), // Supports custom templates
  templatePath: './ui-doc/templates',
})
```

### Prevention

To avoid this issue in the future:

- Create the template directory structure before adding template files
- Copy default templates as starting points for customization
- Test templates during development with hot-reload enabled
- Verify template syntax using a Handlebars validator

---

## Still having issues?

If you're experiencing a problem not covered here:

1. Check the [Getting Started with Vite](../getting-started/vite.md) guide for basic setup
2. Review the [Rollup plugin options](../reference/rollup-options.md) for configuration details
3. Search [GitHub issues](https://github.com/gherrink/ui-doc/issues) for similar problems
4. Report a new issue with your configuration, error messages, and build logs
