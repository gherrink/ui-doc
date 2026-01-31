# How to customize HTML templates and styling

Modify UI-Doc's HTML templates and add custom styles to match your brand or design requirements.

## Overview

UI-Doc uses customizable HTML templates and CSS to render documentation. You can override the default templates or add custom styling to create documentation that matches your brand identity.

**Use this guide when you want to:**

- Match UI-Doc's appearance to your brand colors and styles
- Modify the layout structure of documentation pages
- Add custom headers, footers, or navigation elements
- Include additional scripts or styles in generated documentation

## Prerequisites

Before starting, ensure you have:

- A working UI-Doc setup with either `@ui-doc/vite` or `@ui-doc/rollup`
- Basic understanding of HTML and CSS
- Familiarity with the UI-Doc template syntax (see [@ui-doc/html-renderer](../../packages/html-renderer/README.md))

## Solution

### Step 1: Create a custom templates directory

Create a directory to store your custom templates. The recommended location is at your project root.

```bash
mkdir -p ui-doc/templates
```

Inside this directory, create subdirectories for each template type:

```bash
mkdir -p ui-doc/templates/layouts
mkdir -p ui-doc/templates/pages
mkdir -p ui-doc/templates/partials
```

### Step 2: Copy default templates to customize

Copy the default templates you want to modify from `@ui-doc/html-renderer`. The built-in templates are located in the package's `templates/` directory.

For example, to customize the default layout:

```bash
# Create a custom layout template
cat > ui-doc/templates/layouts/default.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{{var:title}}</title>
    <link rel="shortcut icon" href="./favicon.ico" />

    {{var:styles}}
    <link rel="stylesheet" href="custom-styles.css" />
  </head>
  <body class="page {{var:page.id}}">
    <header class="site-header">
      <div class="brand">My Documentation</div>
      {{partial:nav-main}}
    </header>

    {{page:page.id page}}

    <footer class="site-footer">
      <div class="footer-content">
        <p>{{var:footerText}}</p>
        <p>&copy; 2026 Your Company</p>
      </div>
    </footer>

    {{var:scripts}}
    <script type="application/javascript">
      hljs.highlightAll()
    </script>
  </body>
</html>
EOF
```

### Step 3: Configure your build tool to use custom templates

Add the `templatePath` option to your UI-Doc configuration to point to your custom templates directory.

**For Vite:**

```js
// vite.config.js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      templatePath: 'ui-doc/templates',
      settings: {
        texts: {
          title: 'My Component Library',
        },
      },
    }),
  ],
})
```

**For Rollup:**

```js
// rollup.config.js
import uidoc from '@ui-doc/rollup'

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      templatePath: 'ui-doc/templates',
      settings: {
        texts: {
          title: 'My Component Library',
        },
      },
    }),
  ],
}
```

### Step 4: Add custom styles

Create a custom CSS file and include it in your documentation pages using the `assets.page` option.

First, create your custom styles:

```css
/* ui-doc/custom-styles.css */
:root {
  --brand-primary: #7c3aed;
  --brand-secondary: #2563eb;
}

.site-header {
  background: linear-gradient(90deg, var(--brand-primary), var(--brand-secondary));
  color: white;
  padding: 1rem;
  margin-bottom: 2rem;
}

.brand {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.site-footer {
  background: #f3f4f6;
  padding: 2rem 1rem;
  margin-top: 3rem;
  border-top: 3px solid var(--brand-primary);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: #6b7280;
}
```

Then, add the stylesheet as a page asset:

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'custom-styles': 'ui-doc/custom-styles.css',
      },
    },
  },

  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      templatePath: 'ui-doc/templates',
      assets: {
        page: [
          {
            name: 'custom-styles',
            fromInput: true,
          },
        ],
      },
    }),
  ],
})
```

### Result

Your UI-Doc documentation now uses your custom templates and styling. The generated HTML includes your custom header, footer, and styles.

When you run your build or dev server, you'll see:

```bash
$ vite build

...
✓ UI-Doc documentation generated
  - Custom templates loaded from ui-doc/templates/
  - Custom styles applied from custom-styles.css
```

## Variations

### Override specific partials

You can override individual partials without modifying the entire layout. Create only the partial files you want to customize.

```html
<!-- ui-doc/templates/partials/nav-main.html -->
<div class="nav-main" aria-label="Main navigation" role="menu">
  <div class="bar width-content">
    <a class="control logo" role="menuitem" href="{{var:homeLink}}">
      <img src="/logo.svg" alt="Logo" />
      {{var:logo}}
    </a>

    <nav class="menu" role="menubar">
      {{for:menu}}
        <a class="control" role="menuitem" href="{{var:href}}"
           {{if:active}} aria-current="page"{{/if}}>
          {{var:text}}
        </a>
      {{/for}}
    </nav>
  </div>
</div>
```

### Load custom styles from a file

If you don't want to use Vite/Rollup inputs, you can load styles directly from a file:

```js
uidoc({
  source: ['src/**/*.css'],
  templatePath: 'ui-doc/templates',
  assets: {
    page: [
      {
        name: 'custom-styles.css',
        file: 'ui-doc/custom-styles.css',
      },
    ],
  },
})
```

### Include inline styles

For small style tweaks, you can include styles directly in your custom layout template:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{{var:title}}</title>

    {{var:styles}}
    <style>
      :root {
        --brand-color: #7c3aed;
      }
      .page-header {
        background: var(--brand-color);
        color: white;
        padding: 2rem 1rem;
      }
    </style>
  </head>
  <body class="page {{var:page.id}}">
    {{partial:nav-main}}
    {{page:page.id page}}
    {{var:scripts}}
  </body>
</html>
```

### Add custom JavaScript

Include custom JavaScript for interactive features in documentation pages:

```js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'custom-script': 'ui-doc/custom-script.js',
      },
    },
  },

  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      assets: {
        page: [
          {
            name: 'custom-script',
            fromInput: true,
            attrs: {
              type: 'module',
              defer: 'true',
            },
          },
        ],
      },
    }),
  ],
})
```

## Troubleshooting

### Templates not loading

Verify that your `templatePath` is correct and points to a directory containing the proper structure (layouts/, pages/, partials/). The path is relative to your project root.

```text
ui-doc/templates/
  ├── layouts/
  │   └── default.html
  ├── pages/
  │   └── default.html
  └── partials/
      └── nav-main.html
```

### Custom styles not appearing

If using `fromInput: true`, ensure the asset name matches a key in your build configuration's `input` object. Check browser DevTools to verify the stylesheet is being loaded.

```text
// The names must match
build: {
  rollupOptions: {
    input: {
      'custom-styles': 'ui-doc/custom-styles.css', // ← This name
    },
  },
},
assets: {
  page: [
    {
      name: 'custom-styles', // ← Must match this name
      fromInput: true,
    },
  ],
}
```

### Template syntax errors

UI-Doc uses a specific template syntax with `{{...}}` directives. Common errors include:

- Missing closing tags: `{{if:condition}}` requires `{{/if}}`
- Invalid variable paths: Use dot notation for nested properties `{{var:page.title}}`
- Incorrect directive names: Use `var:`, `if:`, `for:`, `page:`, `partial:`, etc.

Check your build output for `HTMLRendererSyntaxError` messages that indicate the exact location of syntax errors.

## Related guides

- [Template syntax reference](../../packages/html-renderer/README.md#template-syntax) - Complete template directive documentation
- [Asset configuration guide](../../packages/rollup/README.md#assets-options) - Detailed asset loading options
- [Built-in templates reference](../../packages/html-renderer/README.md#built-in-templates) - Default template structure and available variables
