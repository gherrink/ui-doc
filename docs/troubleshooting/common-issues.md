# Troubleshooting common issues

Common problems and solutions when using UI-Doc.

## Documentation not generating

### Symptoms

- Build completes without errors but no documentation files appear
- Output directory is empty or missing
- No HTML files in the expected location

### Causes

This typically happens when:

1. Source files don't contain valid doc blocks
2. Source glob patterns don't match any files
3. Output directory configuration is incorrect

### Solutions

**If source files have no doc blocks:**

Verify your source files contain valid JSDoc-style comment blocks with UI-Doc tags. Doc blocks must start with `/**` and include at least one placement tag (`@page`, `@section`, or `@location`).

```css
/**
 * Valid doc block with placement tag.
 *
 * @location components.button Button
 * @example
 * <button class="btn">Click me</button>
 */
.btn {
  padding: 10px 20px;
}
```

**If glob patterns don't match:**

Check your `source` configuration. The patterns use picomatch syntax and are relative to your project root.

```js
// Vite config
uidoc({
  source: ['src/**/*.css'], // Matches all CSS files in src/
})
```

Test your glob patterns by running a file listing command:

```bash
ls src/**/*.css
```

**If output directory is wrong:**

Verify the `output.dir` setting and check where your build tool outputs files.

```js
// Vite - outputs to dist/ui-doc/
export default defineConfig({
  build: {
    outDir: 'dist',
  },
  plugins: [
    uidoc({
      output: {
        dir: 'ui-doc', // Creates dist/ui-doc/
      },
    }),
  ],
})
```

### Prevention

To avoid this issue in the future:

- Include at least one doc block with a `@page` tag in your source files
- Test glob patterns match your intended files
- Check build output logs for UI-Doc messages

---

## Documentation not showing in dev server

### Symptoms

- Vite dev server runs without errors
- Navigating to `/ui-doc/` shows a 404 error
- Documentation works in build but not in development

### Causes

This typically happens when:

1. `output.baseUri` is set to `'.'` in development mode
2. The dev server middleware isn't properly configured
3. The output directory path is incorrect

### Solutions

**If baseUri is misconfigured:**

Don't use `'.'` for `baseUri` during development. Use conditional configuration to set it only for builds.

```js
// Wrong - breaks dev server
uidoc({
  output: {
    baseUri: '.',
  },
})

// Correct - conditional configuration
export default defineConfig(({ command }) => {
  return {
    plugins: [
      uidoc({
        output: {
          baseUri: command === 'serve' ? undefined : '.',
        },
      }),
    ],
  }
})
```

**If dev server middleware isn't working:**

Make sure you're using `@ui-doc/vite` (not `@ui-doc/rollup`) in your Vite config. The Rollup plugin doesn't include the dev server middleware.

```js
// Use the Vite plugin
import uidoc from '@ui-doc/vite'

export default defineConfig({
  plugins: [uidoc({ source: ['src/**/*.css'] })],
})
```

**If the output directory is wrong:**

The default dev server path is `/ui-doc/`. If you changed `output.dir`, navigate to that path instead:

```js
uidoc({
  output: {
    dir: 'docs', // Serves at /docs/
  },
})
```

Navigate to `http://localhost:5173/docs/`.

### Prevention

To avoid this issue in the future:

- Always use conditional configuration for `baseUri`
- Use the correct plugin package for your build tool
- Check the console output for the documentation URL

---

## Assets not loading or showing 404 errors

### Symptoms

- Documentation pages load but have no styling
- Example previews show unstyled content
- Browser console shows 404 errors for CSS/JS files
- Images or fonts are missing

### Causes

This typically happens when:

1. Asset names don't match Rollup/Vite input keys when using `fromInput: true`
2. The `baseUri` is incorrect for your deployment environment
3. Static asset paths are wrong
4. Assets weren't copied to the output directory

### Solutions

**If using fromInput with wrong names:**

Ensure the asset `name` exactly matches the key in your build tool's input configuration.

```js
// Vite/Rollup config
export default {
  input: {
    'app': 'src/main.js', // Key is 'app'
    'custom-theme': 'ui-doc/theme.css', // Key is 'custom-theme'
  },
  plugins: [
    uidoc({
      assets: {
        example: [
          {
            name: 'app', // Must match input key exactly
            fromInput: true,
          },
        ],
        page: [
          {
            name: 'custom-theme', // Must match input key exactly
            fromInput: true,
          },
        ],
      },
    }),
  ],
}
```

**If baseUri causes broken links:**

The `baseUri` controls how asset URLs are generated. For production builds deployed to a subdirectory, use an absolute path. For local files, use `'.'`.

```js
// Deployed to https://example.com/docs/
uidoc({
  output: {
    baseUri: '/docs/',
  },
})

// Opened as local files (file://)
uidoc({
  output: {
    baseUri: '.',
  },
})
```

**If static assets aren't copied:**

Verify the `assets.static` path is correct and points to an existing directory.

```js
uidoc({
  assets: {
    static: './public', // Relative to project root
  },
})
```

Files in this directory are copied to the UI-Doc output directory. Check the build output to confirm copying happened.

**If file-based assets have wrong paths:**

When using the `file` option, paths are relative to your project root.

```js
uidoc({
  assets: {
    example: [
      {
        name: 'custom.css',
        file: './ui-doc/custom.css', // Relative to project root
      },
    ],
  },
})
```

### Prevention

To avoid this issue in the future:

- Keep input keys and asset names in sync
- Test your baseUri configuration in the deployment environment
- Use the browser's developer tools Network tab to check actual request URLs

---

## Examples not rendering correctly

### Symptoms

- Example previews show raw HTML instead of rendered components
- Examples appear unstyled or broken
- Code is visible but preview is missing

### Causes

This typically happens when:

1. Required stylesheets aren't included in example assets
2. The HTML in the `@example` tag has syntax errors
3. Content Security Policy blocks inline styles

### Solutions

**If styles are missing:**

Include your application styles in the `assets.example` configuration.

```js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: 'src/main.css', // Your application styles
      },
    },
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

**If HTML has syntax errors:**

Check your `@example` content for valid HTML. Each line in the doc block should be a valid fragment.

```css
/**
 * Valid example markup.
 *
 * @example
 * <button class="btn">Click me</button>
 * <button class="btn" disabled>Disabled</button>
 */

/**
 * Invalid - missing closing tag.
 *
 * @example
 * <button class="btn">Click me
 */
```

**If content uses JavaScript:**

For interactive examples that need JavaScript, include your scripts in the example assets.

```js
uidoc({
  assets: {
    example: [
      {
        name: 'app',
        fromInput: true,
        attrs: {
          type: 'module', // Use ES modules
        },
      },
    ],
  },
})
```

### Prevention

To avoid this issue in the future:

- Always include necessary stylesheets in example assets
- Validate HTML markup in doc blocks
- Test examples in isolation to ensure they work

---

## Syntax highlighting not working

### Symptoms

- Code blocks appear without syntax highlighting
- All code is displayed in a single color
- Missing `highlight.js` styling

### Causes

This typically happens when:

1. Highlight.js assets are disabled
2. The highlight.js theme doesn't match your design
3. Highlight.js isn't included in the output

### Solutions

**If highlight.js is disabled:**

Ensure you haven't explicitly disabled the highlighting assets.

```js
// This disables highlighting
uidoc({
  assets: {
    highlightStyle: false,
    highlightScript: false,
  },
})

// Enable highlighting (default behavior)
uidoc({
  assets: {
    highlightStyle: 'highlight.css',
    highlightScript: 'highlight.js',
  },
})
```

**If the theme needs customization:**

Change the highlight.js theme to match your documentation design.

```js
uidoc({
  assets: {
    highlightTheme: 'github-dark', // Use a different theme
  },
})
```

Available themes include: `default`, `github`, `github-dark`, `monokai`, `atom-one-dark`, and many others. See the [highlight.js styles directory](https://github.com/highlightjs/highlight.js/tree/main/src/styles) for all options.

**If highlight.js isn't installed:**

The `@highlightjs/cdn-assets` package is required for syntax highlighting.

```bash
pnpm install --save-dev @highlightjs/cdn-assets
```

### Prevention

To avoid this issue in the future:

- Keep `@highlightjs/cdn-assets` in your dev dependencies
- Don't disable highlighting unless you're using a custom solution
- Test documentation appearance in the browser

---

## Custom templates not applying

### Symptoms

- Documentation still uses default templates after setting `templatePath`
- Changes to custom templates don't appear in output
- Build succeeds but templates aren't loaded

### Causes

This typically happens when:

1. The `templatePath` points to a non-existent directory
2. Template files have incorrect names or directory structure
3. Templates weren't saved with UTF-8 encoding

### Solutions

**If templatePath is wrong:**

Verify the path exists and is relative to your project root.

```js
uidoc({
  templatePath: 'ui-doc/templates', // Must exist
})
```

The directory should be structured as:

```text
ui-doc/templates/
  ├── layouts/
  │   └── default.html
  ├── pages/
  │   └── default.html
  └── partials/
      └── nav.html
```

**If template names are wrong:**

Templates must follow specific naming conventions. The most important template names are:

- `layouts/default.html` - Default page layout
- `pages/default.html` - Default page structure
- `pages/index.html` - Homepage structure

**If templates have encoding issues:**

Ensure all template files are saved as UTF-8. Some editors default to other encodings which can cause parsing errors.

**If using custom template syntax:**

Templates use a specific syntax documented in the [@ui-doc/html-renderer README](../../packages/html-renderer/README.md). Verify your templates use the correct tag format:

```html
<!-- Variables -->
{{var:title}}

<!-- Conditionals -->
{{if:showContent}}
  <p>Content</p>
{{/if}}

<!-- Loops -->
{{for:items}}
  <li>{{var:_loop.value}}</li>
{{/for}}

<!-- Partials -->
{{partial:nav}}

<!-- Pages -->
{{page:default}}
```

### Prevention

To avoid this issue in the future:

- Keep templates in the standard directory structure
- Use UTF-8 encoding for all template files
- Start by copying the built-in templates and modifying them

---

## Hot reload not working in Vite

### Symptoms

- Making changes to source files doesn't update documentation
- Must restart dev server to see changes
- Regular application code hot-reloads but documentation doesn't

### Causes

This typically happens when:

1. Source files aren't being watched by Vite
2. Template files changed but templates aren't reloaded
3. The Vite plugin version doesn't support hot reload

### Solutions

**If source files aren't watched:**

Ensure your source glob patterns are covered by Vite's file watching. Files outside the project root might not be watched.

```js
uidoc({
  source: ['src/**/*.css'], // Within project root - watched
})
```

**If templates need reload:**

Template changes require a server restart since templates are loaded once at startup. This is expected behavior. Restart the dev server:

```bash
# Stop the server (Ctrl+C)
# Start it again
pnpm dev
```

**If using an older version:**

Template hot reload was added in version 0.3.0. Update to the latest version:

```bash
pnpm update @ui-doc/vite @ui-doc/rollup
```

### Prevention

To avoid this issue in the future:

- Keep source files within your project root
- Restart the dev server after changing templates
- Keep UI-Doc packages up to date

---

## Build fails with "Cannot find module" errors

### Symptoms

- Build fails with module resolution errors
- Error messages about missing `@ui-doc/*` packages
- TypeScript errors about missing types

### Causes

This typically happens when:

1. Required peer dependencies aren't installed
2. Packages aren't in sync after updates
3. TypeScript can't resolve package paths

### Solutions

**If peer dependencies are missing:**

Install all required packages. The exact dependencies depend on which plugin you're using.

For Vite:

```bash
pnpm install --save-dev @ui-doc/vite @ui-doc/html-renderer @highlightjs/cdn-assets
```

For Rollup:

```bash
pnpm install --save-dev @ui-doc/rollup @ui-doc/html-renderer @highlightjs/cdn-assets
```

For Node.js scripts:

```bash
pnpm install --save-dev @ui-doc/core @ui-doc/node @ui-doc/html-renderer @highlightjs/cdn-assets
```

**If packages are out of sync:**

After updating, rebuild all packages and clear any caches.

```bash
# Clear node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# Rebuild if using local packages
pnpm workspace:build
```

**If TypeScript can't resolve paths:**

Ensure your `tsconfig.json` includes the correct module resolution settings.

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "types": ["vite/client"]
  }
}
```

### Prevention

To avoid this issue in the future:

- Install all peer dependencies when adding UI-Doc
- Keep all `@ui-doc/*` packages at the same version
- Run install after pulling updates that change dependencies

---

## Colors or icons not displaying

### Symptoms

- `@color` tags show no color preview
- `@icon` tags show blank boxes or missing characters
- Design tokens display text but no visual representation

### Causes

This typically happens when:

1. Color values use an unsupported format
2. Icon fonts aren't properly configured
3. CSS custom properties aren't defined

### Solutions

**If color format is wrong:**

The `@color` tag supports specific formats. Use RGB values or hex codes.

```css
/**
 * Supported color formats.
 *
 * @color {255 0 0} --color-red | Red (RGB)
 * @color {#ff0000} --color-red-hex | Red (Hex)
 * @color {255 0 0|255 255 255} --color-red-text | Red with white text
 * @color {--color-red} --color-red-var | Reference to CSS variable
 */

/**
 * Unsupported formats.
 *
 * @color {rgb(255, 0, 0)} --wrong | Won't work
 * @color {hsl(0, 100%, 50%)} --wrong | Won't work
 */
```

**If icon fonts aren't configured:**

Icons require a custom stylesheet defining the font-face and the `--icons-font-family` variable.

```css
/* Include this in your page assets */
@font-face {
  font-family: icons;
  font-weight: normal;
  font-style: normal;
  font-display: block;
  src: url('fonts/icons.woff2') format('woff2');
}

:root {
  --icons-font-family: icons;
}
```

Then add this stylesheet to your page assets:

```js
uidoc({
  assets: {
    page: [
      {
        name: 'icon-font.css',
        file: './ui-doc/icon-font.css',
      },
    ],
  },
})
```

**If CSS variables aren't accessible:**

When using variable references in color tags, the variables must be defined in a stylesheet included in your page assets.

```css
/* In your page assets */
:root {
  --color-primary: 20 33 61;
}
```

```css
/* In your documented file */
/**
 * @color {--color-primary} --color-primary | Primary color
 */
```

### Prevention

To avoid this issue in the future:

- Use RGB or hex formats for colors
- Set up icon fonts with the required CSS variables
- Include variable definitions in page assets, not just example assets

---

## Documentation builds but pages are blank

### Symptoms

- HTML files are generated successfully
- Files have correct file size and structure
- Opening pages in browser shows blank white screen
- No errors in browser console

### Causes

This typically happens when:

1. Templates are empty or missing required content
2. Context data isn't being passed to templates
3. JavaScript errors occur silently

### Solutions

**If templates are incomplete:**

Ensure custom templates include the required template tags. At minimum, layouts need:

```html
<!doctype html>
<html>
  <head>
    <title>{{var:title}}</title>
    {{var:styles}}
  </head>
  <body>
    {{page:default}}
    {{var:scripts}}
  </body>
</html>
```

And pages need:

```html
<main>
  {{var:content}}
</main>
```

**If context is missing:**

Add debug output to see what context is available:

```html
<!-- Add to your template temporarily -->
{{debug}}
```

This will output the entire context as JSON, helping you identify what data is available.

**If JavaScript has errors:**

Check the browser console for errors. Even silent errors can prevent rendering. Open developer tools (F12) and check the Console tab.

### Prevention

To avoid this issue in the future:

- Test custom templates with simple content first
- Use the `{{debug}}` tag during development
- Keep browser developer tools open when testing

---

## Still having issues?

If you're experiencing a problem not covered here:

1. Check the [GitHub issues](https://github.com/gherrink/ui-doc/issues) for similar problems
2. Review the [package documentation](../../packages) for your specific integration
3. [Open a new issue](https://github.com/gherrink/ui-doc/issues/new) with:
   - UI-Doc version
   - Build tool and version (Vite/Rollup/Node.js)
   - Minimal reproduction example
   - Error messages or unexpected behavior description

## Related documentation

- [Getting Started with Vite](../getting-started/vite.md) - Initial setup guide
- [Getting Started with Rollup](../getting-started/rollup.md) - Rollup configuration
- [Configure Assets](../how-to/configure-assets.md) - Asset configuration details
- [Customize Templates](../how-to/customize-templates.md) - Template customization guide
- [Tag Reference](../reference/tags.md) - All available doc block tags
