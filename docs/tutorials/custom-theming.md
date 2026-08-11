# Tutorial: Customize templates and theming

Learn how to customize UI-Doc's appearance by creating custom templates and adding your own styles to match your brand or design system.

## What you'll learn

By the end of this tutorial, you'll know how to:

- Create custom HTML templates for layouts, pages, and partials
- Override default UI-Doc templates with your own designs
- Add custom CSS to style your documentation
- Include custom JavaScript for enhanced interactivity
- Use template syntax to create dynamic content

## Prerequisites

This tutorial assumes you have:

- Completed the [Getting Started with Vite](../getting-started/vite.md) guide or have a working UI-Doc setup
- Basic understanding of HTML, CSS, and the template syntax
- A Vite or Rollup project with UI-Doc installed

## Step 1: Create a custom templates directory

First, create a directory structure for your custom templates. UI-Doc expects templates to be organized by type.

```bash
mkdir -p ui-doc/templates/layouts
mkdir -p ui-doc/templates/pages
mkdir -p ui-doc/templates/partials
```

This directory structure mirrors the built-in templates and allows you to override any part of the default design.

### Checkpoint

At this point, your project should have:

- A `ui-doc/templates/` directory with three subdirectories: `layouts`, `pages`, and `partials`

## Step 2: Configure the template path

Tell UI-Doc where to find your custom templates by adding the `templatePath` option to your Vite configuration.

```js
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

The `templatePath` option points to the root directory containing your `layouts`, `pages`, and `partials` subdirectories. UI-Doc will automatically load templates from these folders and use them instead of the defaults when available.

### Checkpoint

Your `vite.config.js` should now include:

- The `templatePath` option pointing to `'ui-doc/templates'`

## Step 3: Create a custom layout

Create a custom layout that adds a branded header and custom footer to all documentation pages.

Create `ui-doc/templates/layouts/default.html` with the following content:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{{var:title}}</title>
    <link rel="shortcut icon" href="./favicon.ico" />

    {{var:styles}}
    <style>
      .custom-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem;
        text-align: center;
        font-weight: bold;
      }
      .custom-footer {
        border-top: 3px solid #667eea;
        margin-top: 2rem;
      }
    </style>
  </head>
  <body class="page {{var:page.id}}">
    <div class="custom-header">🎨 Custom Documentation Theme</div>
    {{partial:nav-main}} {{page:page.id page}}
    <footer class="width-content py bg custom-footer">
      <div class="text">{{var:footerText}} | Powered by UI-Doc</div>
    </footer>

    {{var:scripts}}
    <script type="application/javascript">
      hljs.highlightAll()
    </script>
  </body>
</html>
```

This layout includes:

- Custom inline styles in the `<head>` for the header and footer
- A branded header with a gradient background
- The default navigation partial `{{partial:nav-main}}`
- The page content area `{{page:page.id page}}`
- A customized footer with border styling

### Checkpoint

Your `ui-doc/templates/layouts/default.html` should:

- Include the custom header and footer styles
- Use template syntax to include navigation, page content, and footer
- Properly load scripts and styles with `{{var:styles}}` and `{{var:scripts}}`

## Step 4: Add custom CSS assets

Instead of inline styles, let's create a separate CSS file for better organization and reusability.

Create `ui-doc/theme.css`:

```css
/* Custom theme for UI-Doc */
:root {
  --brand-primary: #667eea;
  --brand-secondary: #764ba2;
  --brand-gradient: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
}

.custom-header {
  background: var(--brand-gradient);
  color: white;
  padding: 1.5rem 1rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-footer {
  border-top: 3px solid var(--brand-primary);
  margin-top: 2rem;
}

/* Customize navigation colors */
.nav-main .logo {
  color: var(--brand-primary);
  font-weight: bold;
}

.nav-main .control:hover {
  background-color: rgba(102, 126, 234, 0.1);
}

/* Custom section headers */
h2 {
  border-left: 4px solid var(--brand-primary);
  padding-left: 1rem;
}
```

Now configure Vite to include this stylesheet in your documentation pages:

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'ui-doc-theme': 'ui-doc/theme.css',
      },
    },
  },

  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      templatePath: 'ui-doc/templates',
      settings: {
        texts: {
          title: 'My Component Library',
        },
      },
      assets: {
        page: [
          {
            name: 'ui-doc-theme',
            fromInput: true,
          },
        ],
      },
    }),
  ],
})
```

Update your layout to remove the inline styles since they're now in the external CSS file:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{{var:title}}</title>
    <link rel="shortcut icon" href="./favicon.ico" />

    {{var:styles}}
  </head>
  <body class="page {{var:page.id}}">
    <div class="custom-header">🎨 Custom Documentation Theme</div>
    {{partial:nav-main}} {{page:page.id page}}
    <footer class="width-content py bg custom-footer">
      <div class="text">{{var:footerText}} | Powered by UI-Doc</div>
    </footer>

    {{var:scripts}}
    <script type="application/javascript">
      hljs.highlightAll()
    </script>
  </body>
</html>
```

### Checkpoint

At this point, you should have:

- A `ui-doc/theme.css` file with custom styles using CSS variables
- Updated `vite.config.js` that includes the theme CSS as a page asset
- Modified `default.html` layout without inline styles

## Step 5: Customize a navigation partial

Create a custom navigation partial to add a logo or modify the navigation structure.

Create `ui-doc/templates/partials/nav-main.html`:

```html
<div class="nav-main" aria-label="Main navigation" role="menu">
  <div class="bar width-content">
    <a class="control logo" role="menuitem" href="{{var:homeLink}}" aria-label="To homepage">
      <span style="font-size: 1.5rem;">🎨</span> {{var:logo}}
    </a>

    <button
      class="control burger"
      aria-label="Toggle menu"
      aria-haspopup="true"
      aria-expanded="false"
      aria-controls="nav-main-menu"
    >
      <span class="line"></span>
      <span class="line"></span>
      <span class="line"></span>
    </button>
    <nav class="menu" role="menubar" id="nav-main-menu" data-animate="menu-show" data-inert="body > .content, body > footer">
      {{for:menu}}<a class="control" role="menuitem" tabindex="0" href="{{var:href}}"{{if:active}} aria-current="page"{{/if}}>{{var:text}}</a>{{/for}}
    </nav>
  </div>
</div>
```

This custom navigation adds an emoji icon before the logo text and keeps the responsive menu structure intact.

### Checkpoint

Your `ui-doc/templates/partials/nav-main.html` should:

- Include a custom logo icon
- Maintain the accessible navigation structure
- Use template syntax to loop through menu items

## Step 6: Add custom JavaScript

Add interactive features to your documentation with custom JavaScript.

Create `ui-doc/custom.js`:

```js
// Add smooth scrolling to anchor links
document.addEventListener('DOMContentLoaded', () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]')

  anchorLinks.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href').substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        e.preventDefault()
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })

  // Add a "scroll to top" button
  const scrollButton = document.createElement('button')
  scrollButton.textContent = '↑'
  scrollButton.className = 'scroll-to-top'
  scrollButton.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 0.75rem 1rem;
    background: var(--brand-primary, #667eea);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 1.25rem;
    z-index: 1000;
  `

  document.body.appendChild(scrollButton)

  scrollButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollButton.style.opacity = '1'
    } else {
      scrollButton.style.opacity = '0'
    }
  })
})
```

Configure the JavaScript asset in your Vite config:

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'ui-doc-theme': 'ui-doc/theme.css',
        'ui-doc-custom': 'ui-doc/custom.js',
      },
    },
  },

  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      templatePath: 'ui-doc/templates',
      settings: {
        texts: {
          title: 'My Component Library',
        },
      },
      assets: {
        page: [
          {
            name: 'ui-doc-theme',
            fromInput: true,
          },
          {
            name: 'ui-doc-custom',
            fromInput: true,
            attrs: {
              type: 'module',
            },
          },
        ],
      },
    }),
  ],
})
```

### Checkpoint

You should now have:

- A `ui-doc/custom.js` file with smooth scrolling and scroll-to-top functionality
- Updated Vite config that includes the custom JavaScript as a page asset
- The JavaScript loaded with `type="module"` attribute

## Step 7: Verify the result

Start the development server to see your customizations in action.

```bash
vite
```

Visit `http://localhost:5173/ui-doc/` and verify:

- The custom header with gradient background appears at the top
- The navigation includes your custom logo icon
- Section headers have the left border styling
- The scroll-to-top button appears when you scroll down
- Clicking anchor links scrolls smoothly

You should see your fully themed documentation with all custom styles and interactivity.

## Summary

In this tutorial, you learned how to:

- Create a custom templates directory structure for UI-Doc
- Configure the `templatePath` option in Vite
- Override the default layout template with custom HTML
- Add external CSS files for better organization
- Customize navigation partials with custom markup
- Include custom JavaScript for enhanced interactivity
- Load custom assets using Vite's input configuration

## Complete code

Here's the complete code from this tutorial:

<details>
<summary>vite.config.js</summary>

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'ui-doc-theme': 'ui-doc/theme.css',
        'ui-doc-custom': 'ui-doc/custom.js',
      },
    },
  },

  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      templatePath: 'ui-doc/templates',
      settings: {
        texts: {
          title: 'My Component Library',
        },
      },
      assets: {
        page: [
          {
            name: 'ui-doc-theme',
            fromInput: true,
          },
          {
            name: 'ui-doc-custom',
            fromInput: true,
            attrs: {
              type: 'module',
            },
          },
        ],
      },
    }),
  ],
})
```

</details>

<details>
<summary>ui-doc/templates/layouts/default.html</summary>

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{{var:title}}</title>
    <link rel="shortcut icon" href="./favicon.ico" />

    {{var:styles}}
  </head>
  <body class="page {{var:page.id}}">
    <div class="custom-header">🎨 Custom Documentation Theme</div>
    {{partial:nav-main}} {{page:page.id page}}
    <footer class="width-content py bg custom-footer">
      <div class="text">{{var:footerText}} | Powered by UI-Doc</div>
    </footer>

    {{var:scripts}}
    <script type="application/javascript">
      hljs.highlightAll()
    </script>
  </body>
</html>
```

</details>

<details>
<summary>ui-doc/templates/partials/nav-main.html</summary>

```html
<div class="nav-main" aria-label="Main navigation" role="menu">
  <div class="bar width-content">
    <a class="control logo" role="menuitem" href="{{var:homeLink}}" aria-label="To homepage">
      <span style="font-size: 1.5rem;">🎨</span> {{var:logo}}
    </a>

    <button
      class="control burger"
      aria-label="Toggle menu"
      aria-haspopup="true"
      aria-expanded="false"
      aria-controls="nav-main-menu"
    >
      <span class="line"></span>
      <span class="line"></span>
      <span class="line"></span>
    </button>
    <nav class="menu" role="menubar" id="nav-main-menu" data-animate="menu-show" data-inert="body > .content, body > footer">
      {{for:menu}}<a class="control" role="menuitem" tabindex="0" href="{{var:href}}"{{if:active}} aria-current="page"{{/if}}>{{var:text}}</a>{{/for}}
    </nav>
  </div>
</div>
```

</details>

<details>
<summary>ui-doc/theme.css</summary>

```css
/* Custom theme for UI-Doc */
:root {
  --brand-primary: #667eea;
  --brand-secondary: #764ba2;
  --brand-gradient: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
}

.custom-header {
  background: var(--brand-gradient);
  color: white;
  padding: 1.5rem 1rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-footer {
  border-top: 3px solid var(--brand-primary);
  margin-top: 2rem;
}

/* Customize navigation colors */
.nav-main .logo {
  color: var(--brand-primary);
  font-weight: bold;
}

.nav-main .control:hover {
  background-color: rgba(102, 126, 234, 0.1);
}

/* Custom section headers */
h2 {
  border-left: 4px solid var(--brand-primary);
  padding-left: 1rem;
}
```

</details>

<details>
<summary>ui-doc/custom.js</summary>

```js
// Add smooth scrolling to anchor links
document.addEventListener('DOMContentLoaded', () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]')

  anchorLinks.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href').substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        e.preventDefault()
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })

  // Add a "scroll to top" button
  const scrollButton = document.createElement('button')
  scrollButton.textContent = '↑'
  scrollButton.className = 'scroll-to-top'
  scrollButton.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 0.75rem 1rem;
    background: var(--brand-primary, #667eea);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 1.25rem;
    z-index: 1000;
  `

  document.body.appendChild(scrollButton)

  scrollButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollButton.style.opacity = '1'
    } else {
      scrollButton.style.opacity = '0'
    }
  })
})
```

</details>

## Next steps

Continue learning with:

- [API Reference: Template Syntax](../reference/template-syntax.md) - Complete template syntax reference
- [How-To: Create Custom Page Templates](../how-to/custom-page-templates.md) - Create specialized page layouts
- [@ui-doc/html-renderer Documentation](../../packages/html-renderer/README.md) - Detailed renderer API
