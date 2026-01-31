# Tutorial: Create a color palette documentation page

In this tutorial, you'll create a complete color palette documentation page using UI-Doc's `@color` tag. You'll learn how to document design tokens for colors, organize them into logical groups, and display them with proper visual representation.

## What you'll learn

By the end of this tutorial, you'll know how to:

- Use the `@color` tag to document color tokens
- Define colors using RGB and hex values
- Control text color on color swatches for better readability
- Reference CSS custom properties for dynamic color display
- Organize colors into logical sections
- Create a complete design system color page

## Prerequisites

This tutorial assumes you have:

- Completed the [Getting started with Vite](../getting-started/vite.md) or [Getting started with Rollup](../getting-started/rollup.md) guide
- UI-Doc installed and configured in your project
- Basic familiarity with CSS custom properties
- A running development server

## Step 1: Create a colors file

Create a new CSS file to hold your color palette definitions. This file will contain both your CSS custom properties and the documentation for them.

```css
/* src/design-tokens/colors.css */

/**
 * Design system color palette.
 *
 * @page design-tokens Design Tokens
 */

:root {
  /* We'll add colors here in the next step */
}
```

This creates a "Design Tokens" page where your colors will be documented. The `:root` selector is where you'll define your CSS custom properties.

### Checkpoint

At this point, your file should:

- Be in your project's source directory
- Match the glob pattern in your UI-Doc configuration (e.g., `src/**/*.css`)
- Contain a `@page` tag that creates the Design Tokens page

## Step 2: Add your primary brand colors

Add your brand colors using both CSS custom properties and `@color` documentation tags.

```css
/* src/design-tokens/colors.css */

/**
 * Design system color palette.
 *
 * @page design-tokens Design Tokens
 */

/**
 * Primary brand colors used throughout the application.
 * These colors represent our brand identity.
 *
 * @location design-tokens.colors.brand Brand Colors
 * @color {20 33 61|255 255 255} --color-primary | Primary Blue
 * @color {252 163 17} --color-accent | Accent Orange
 * @color {0 0 0|255 255 255} --color-dark | Dark
 */
:root {
  --color-primary: 20 33 61;
  --color-accent: 252 163 17;
  --color-dark: 0 0 0;
}
```

The `@color` tag follows this syntax:

- `{20 33 61|255 255 255}` - The type (in braces) contains the background color in RGB format, followed by an optional text color after the `|` separator
- `--color-primary` - The name of your CSS custom property
- `| Primary Blue` - The human-readable description

> **Note:** The `|` separator can also be a `-` or whitespace. Use whichever feels most natural.

### Checkpoint

Save the file and check your documentation in the browser. You should see:

- A "Design Tokens" page in the navigation
- A "Brand Colors" section
- Three color swatches showing your colors
- The variable names and descriptions below each swatch

## Step 3: Add neutral colors

Expand your palette by adding neutral colors in a separate section. This shows how to organize related colors together.

```css
/**
 * Neutral colors for backgrounds, borders, and text.
 *
 * @location design-tokens.colors.neutrals Neutral Colors
 * @color {255 255 255} --color-white | White
 * @color {229 229 229} --color-gray-light | Light Gray
 * @color {128 128 128|255 255 255} --color-gray | Gray
 * @color {64 64 64|255 255 255} --color-gray-dark | Dark Gray
 * @color {0 0 0|255 255 255} --color-black | Black
 */
:root {
  --color-white: 255 255 255;
  --color-gray-light: 229 229 229;
  --color-gray: 128 128 128;
  --color-gray-dark: 64 64 64;
  --color-black: 0 0 0;
}
```

This creates a second section on the same page. Notice how light colors don't need a text color specified (they default to dark text), while dark colors need `|255 255 255` to ensure white text is readable.

### Checkpoint

Your colors.css file should now look like this:

```css
/* src/design-tokens/colors.css */

/**
 * Design system color palette.
 *
 * @page design-tokens Design Tokens
 */

/**
 * Primary brand colors used throughout the application.
 * These colors represent our brand identity.
 *
 * @location design-tokens.colors.brand Brand Colors
 * @color {20 33 61|255 255 255} --color-primary | Primary Blue
 * @color {252 163 17} --color-accent | Accent Orange
 * @color {0 0 0|255 255 255} --color-dark | Dark
 */
:root {
  --color-primary: 20 33 61;
  --color-accent: 252 163 17;
  --color-dark: 0 0 0;
}

/**
 * Neutral colors for backgrounds, borders, and text.
 *
 * @location design-tokens.colors.neutrals Neutral Colors
 * @color {255 255 255} --color-white | White
 * @color {229 229 229} --color-gray-light | Light Gray
 * @color {128 128 128|255 255 255} --color-gray | Gray
 * @color {64 64 64|255 255 255} --color-gray-dark | Dark Gray
 * @color {0 0 0|255 255 255} --color-black | Black
 */
:root {
  --color-white: 255 255 255;
  --color-gray-light: 229 229 229;
  --color-gray: 128 128 128;
  --color-gray-dark: 64 64 64;
  --color-black: 0 0 0;
}
```

## Step 4: Add semantic colors with hex values

Add semantic colors for UI states using hex values. This demonstrates that you can use either RGB or hex format.

```css
/**
 * Semantic colors for UI states and feedback.
 *
 * @location design-tokens.colors.semantic Semantic Colors
 * @color {#22c55e|#fff} --color-success | Success Green
 * @color {#eab308} --color-warning | Warning Yellow
 * @color {#ef4444|#fff} --color-error | Error Red
 * @color {#3b82f6|#fff} --color-info | Info Blue
 */
:root {
  --color-success: 34 197 94;   /* #22c55e in RGB */
  --color-warning: 234 179 8;   /* #eab308 in RGB */
  --color-error: 239 68 68;     /* #ef4444 in RGB */
  --color-info: 59 130 246;     /* #3b82f6 in RGB */
}
```

You can mix hex and RGB formats in the documentation. UI-Doc will convert hex values to RGB automatically and display both formats.

> **Tip:** Even though you define colors as hex in the `@color` tag, your CSS custom properties should use RGB format (space-separated) for better compatibility with color manipulation functions like `rgb()` and `rgba()`.

### Checkpoint

At this point, your documentation should show:

- Three sections: Brand Colors, Neutral Colors, and Semantic Colors
- All colors displayed with proper text contrast
- Color swatches that visually represent each token

## Step 5: Reference CSS variables for dynamic colors

For colors that should reference other colors, you can use CSS variable references. This is useful for aliases or theme variations.

```css
/**
 * Color aliases that reference primary palette colors.
 * These can be overridden in theme variations.
 *
 * @location design-tokens.colors.aliases Color Aliases
 * @color {--color-primary} --color-link | Link Color
 * @color {--color-gray-dark} --color-text | Text Color
 * @color {--color-white} --color-background | Background Color
 */
:root {
  --color-link: var(--color-primary);
  --color-text: var(--color-gray-dark);
  --color-background: var(--color-white);
}
```

When you reference a CSS variable like `{--color-primary}`, UI-Doc will:

1. Look for that variable in your custom stylesheet
2. Display the color based on its defined value
3. Show the variable name in the documentation

> **Note:** For this to work, you need to provide your CSS file as a custom stylesheet in your UI-Doc configuration. The colors must be defined before they're referenced.

## Step 6: Verify the complete palette

Your final colors.css file should contain all color definitions organized into logical sections. Save the file and check your documentation.

```bash
# If using Vite
pnpm dev

# If using Rollup
pnpm build
```

You should see:

- A "Design Tokens" page with a "Colors" section in the navigation
- Four subsections: Brand Colors, Neutral Colors, Semantic Colors, and Color Aliases
- Color swatches for each token with appropriate text contrast
- Variable names and descriptions clearly displayed

## Summary

In this tutorial, you learned how to:

- Document color tokens using the `@color` tag
- Define colors in both RGB and hex formats
- Control text color for better readability on dark backgrounds
- Organize colors into logical sections using nested `@location` tags
- Reference CSS variables for dynamic color documentation
- Create a complete design system color palette

## Complete code

Here's the complete color palette file from this tutorial:

<details>
<summary>src/design-tokens/colors.css</summary>

```css
/**
 * Design system color palette.
 *
 * @page design-tokens Design Tokens
 */

/**
 * Primary brand colors used throughout the application.
 * These colors represent our brand identity.
 *
 * @location design-tokens.colors.brand Brand Colors
 * @color {20 33 61|255 255 255} --color-primary | Primary Blue
 * @color {252 163 17} --color-accent | Accent Orange
 * @color {0 0 0|255 255 255} --color-dark | Dark
 */
:root {
  --color-primary: 20 33 61;
  --color-accent: 252 163 17;
  --color-dark: 0 0 0;
}

/**
 * Neutral colors for backgrounds, borders, and text.
 *
 * @location design-tokens.colors.neutrals Neutral Colors
 * @color {255 255 255} --color-white | White
 * @color {229 229 229} --color-gray-light | Light Gray
 * @color {128 128 128|255 255 255} --color-gray | Gray
 * @color {64 64 64|255 255 255} --color-gray-dark | Dark Gray
 * @color {0 0 0|255 255 255} --color-black | Black
 */
:root {
  --color-white: 255 255 255;
  --color-gray-light: 229 229 229;
  --color-gray: 128 128 128;
  --color-gray-dark: 64 64 64;
  --color-black: 0 0 0;
}

/**
 * Semantic colors for UI states and feedback.
 *
 * @location design-tokens.colors.semantic Semantic Colors
 * @color {#22c55e|#fff} --color-success | Success Green
 * @color {#eab308} --color-warning | Warning Yellow
 * @color {#ef4444|#fff} --color-error | Error Red
 * @color {#3b82f6|#fff} --color-info | Info Blue
 */
:root {
  --color-success: 34 197 94;   /* #22c55e in RGB */
  --color-warning: 234 179 8;   /* #eab308 in RGB */
  --color-error: 239 68 68;     /* #ef4444 in RGB */
  --color-info: 59 130 246;     /* #3b82f6 in RGB */
}

/**
 * Color aliases that reference primary palette colors.
 * These can be overridden in theme variations.
 *
 * @location design-tokens.colors.aliases Color Aliases
 * @color {--color-primary} --color-link | Link Color
 * @color {--color-gray-dark} --color-text | Text Color
 * @color {--color-white} --color-background | Background Color
 */
:root {
  --color-link: var(--color-primary);
  --color-text: var(--color-gray-dark);
  --color-background: var(--color-white);
}
```

</details>

## Next steps

Continue building your design system documentation with:

- [Tutorial: Document spacing tokens](./spacing-tokens.md) - Create a spacing scale using `@space`
- [Tutorial: Document icon fonts](./icon-fonts.md) - Document your icon library with `@icon`
- [Understanding doc blocks](../concepts/doc-blocks.md) - Learn more about doc block structure and usage
- [Color tag reference](../reference/tags.md#color) - Explore all color tag options and syntax
