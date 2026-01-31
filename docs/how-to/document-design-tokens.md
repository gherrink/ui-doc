# How to document design tokens

Document your design system's colors, spacing values, and icons using UI-Doc's specialized display tags.

## Overview

Design tokens are the foundational design decisions in your system: colors, spacing, typography, icons, and more. UI-Doc provides specialized tags to document these tokens visually alongside your CSS custom properties, making it easy to reference and maintain your design system.

**Use this guide when you want to:**

- Create a design tokens reference page for your team
- Document CSS custom properties with visual examples
- Organize colors, spacing, or icons into a searchable documentation site
- Keep token documentation co-located with the actual CSS definitions

## Prerequisites

Before starting, ensure you have:

- UI-Doc installed and configured (see [Getting Started with Vite](../getting-started/vite.md) or [Getting Started with Rollup](../getting-started/rollup.md))
- A CSS file where your design tokens are defined
- The CSS file included in your UI-Doc `source` glob pattern

## Solution

### Step 1: Create a design tokens file

Create a CSS file for your design tokens with a doc block that defines the page.

```css
/* src/design-tokens/tokens.css */

/**
 * Design system tokens for colors, spacing, and icons.
 *
 * @page tokens Design Tokens
 */
```

This creates a "Design Tokens" page in your documentation where all token sections will appear.

### Step 2: Document colors

Add your color palette using the `@color` tag. Each color is displayed as a swatch with its variable name and description.

```css
/**
 * Brand colors define our visual identity and are used
 * throughout the application for primary actions and accents.
 *
 * @location tokens.colors Brand Colors
 * @color {20 33 61|255 255 255} --color-primary | Primary Blue
 * @color {252 163 17} --color-accent | Accent Orange
 * @color {229 229 229} --color-gray | Light Gray
 */
:root {
  --color-primary: 20 33 61;
  --color-accent: 252 163 17;
  --color-gray: 229 229 229;
}
```

The `@color` tag syntax:

- **Type** (in braces): RGB values like `20 33 61`, or hex values like `#14213d`
  - Optional: Add `|255 255 255` after the color to specify text color for dark backgrounds
- **Name**: The CSS custom property name (e.g., `--color-primary`)
- **Description**: Human-readable label, separated by `|`, `-`, or whitespace

### Step 3: Document spacing values

Add spacing tokens using the `@space` tag. Each spacing value is displayed with a visual bar showing its relative size.

```css
/**
 * Spacing scale based on a rem unit. Use these values for
 * consistent margin, padding, and gap throughout the design.
 *
 * @location tokens.spacing Spacing Scale
 * @space {0.5} --space-xs | Extra Small
 * @space {1} --space-normal | Normal
 * @space {1.5} --space-md | Medium
 * @space {2} --space-lg | Large
 * @space {3} --space-xl | Extra Large
 */
:root {
  --space-xs: 0.5;
  --space-normal: 1;
  --space-md: 1.5;
  --space-lg: 2;
  --space-xl: 3;
}
```

The `@space` tag syntax:

- **Type** (in braces): Numeric multiplier (e.g., `0.5`, `1.5`)
- **Name**: The CSS custom property name (e.g., `--space-md`)
- **Description**: Human-readable label, separated by `|`, `-`, or whitespace

The spacing value is multiplied by the spacing unit when rendered. With the default renderer, this creates proportional visual bars.

### Step 4: Document icons

Add icon font definitions using the `@icon` tag. Each icon is displayed with its glyph and variable name.

```css
/**
 * Icon font glyphs for UI elements. Icons use the custom
 * icon font family defined in our font-face declarations.
 *
 * @location tokens.icons Icons
 * @icon {e900} --icon-chevron-down | Chevron Down
 * @icon {e901} --icon-chevron-left | Chevron Left
 * @icon {e902} --icon-chevron-right | Chevron Right
 * @icon {e903} --icon-chevron-up | Chevron Up
 */
:root {
  --icon-chevron-down: "\e900";
  --icon-chevron-left: "\e901";
  --icon-chevron-right: "\e902";
  --icon-chevron-up: "\e903";
}
```

The `@icon` tag syntax:

- **Type** (in braces): Character code (e.g., `e900`) or CSS variable reference (e.g., `{--icon-name}`)
- **Name**: The CSS custom property name (e.g., `--icon-chevron-down`)
- **Description**: Human-readable label, separated by `|`, `-`, or whitespace

> **Note:** Icons require a custom stylesheet with a `@font-face` declaration and the `--icons-font-family` variable set. See the variations section below for details.

### Result

After adding these doc blocks, your documentation will display:

- A "Design Tokens" page in the navigation
- Three sections: Brand Colors, Spacing Scale, and Icons
- Visual representations of each token (color swatches, spacing bars, icon glyphs)
- Variable names and descriptions for easy reference

## Variations

### Using hex color values

You can define colors using hex notation instead of RGB.

```css
/**
 * @location tokens.colors.semantic Semantic Colors
 * @color {#22c55e|#fff} --color-success | Success Green
 * @color {#eab308} --color-warning | Warning Yellow
 * @color {#ef4444|#fff} --color-error | Error Red
 */
:root {
  --color-success: 34 197 94;   /* RGB equivalent of #22c55e */
  --color-warning: 234 179 8;   /* RGB equivalent of #eab308 */
  --color-error: 239 68 68;     /* RGB equivalent of #ef4444 */
}
```

UI-Doc accepts both RGB and hex formats in the `@color` type. Hex values are converted internally for display.

### Referencing CSS variables for colors

For colors that reference other colors, use CSS variable references in the type.

```css
/**
 * Semantic color aliases that reference the base palette.
 *
 * @location tokens.colors.aliases Color Aliases
 * @color {--color-primary} --color-link | Link Color
 * @color {--color-gray} --color-border | Border Color
 */
:root {
  --color-link: var(--color-primary);
  --color-border: var(--color-gray);
}
```

When using variable references, ensure the referenced colors are defined in your custom stylesheet so UI-Doc can resolve their values.

### Setting up icon fonts

To use the `@icon` tag, you need to configure your icon font in a custom stylesheet.

```css
/* ui-doc-custom.css */

@font-face {
  font-family: icons;
  font-weight: normal;
  font-style: normal;
  font-display: block;
  src:
    url('fonts/icons.woff2') format('woff2'),
    url('fonts/icons.woff') format('woff'),
    url('fonts/icons.ttf') format('truetype');
}

:root {
  --icons-font-family: icons;
}
```

Then configure UI-Doc to use this custom stylesheet:

```js
// vite.config.js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      renderer: {
        customCss: './ui-doc-custom.css',
      },
    }),
  ],
})
```

### Organizing tokens into subsections

Use nested location paths to create hierarchical organization.

```css
/**
 * @location tokens.colors.brand.primary Primary Brand
 * @color {20 33 61|255 255 255} --color-brand-primary | Primary
 * @color {30 43 71|255 255 255} --color-brand-primary-dark | Primary Dark
 */

/**
 * @location tokens.colors.brand.secondary Secondary Brand
 * @color {252 163 17} --color-brand-secondary | Secondary
 * @color {255 180 50} --color-brand-secondary-light | Secondary Light
 */
```

This creates nested sections under "Brand" with subsections for "Primary" and "Secondary" colors.

## Troubleshooting

### Colors not displaying correctly

If colors appear as black swatches or don't render, verify:

1. RGB values are space-separated, not comma-separated: `20 33 61` not `20, 33, 61`
2. Hex values include the `#` symbol: `#14213d` not `14213d`
3. For variable references, ensure the referenced variable exists in your custom stylesheet

### Icons showing as squares or missing glyphs

If icons don't display properly:

1. Verify `--icons-font-family` is set in your custom stylesheet
2. Check that the `@font-face` declaration loads the correct font files
3. Confirm the character codes in your `@icon` tags match the codes in your icon font
4. Ensure the custom stylesheet is configured in your UI-Doc plugin options

### Spacing values not proportional

If spacing bars don't display correctly:

1. Use numeric values without units in the `@space` type: `1.5` not `1.5rem`
2. Ensure values are consistent with a base unit (typically `1` = 1rem)

## Related guides

- [Tutorial: Create a color palette documentation page](../tutorials/color-palette.md) - Step-by-step guide to building a complete color system
- [Tag Reference](../reference/tags.md) - Complete documentation for `@color`, `@space`, and `@icon` tags
- [Understanding doc blocks](../concepts/doc-blocks.md) - Learn how doc blocks organize into documentation
