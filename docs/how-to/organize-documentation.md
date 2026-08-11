# How to organize documentation with pages and sections

Organize your UI-Doc site with a clear hierarchy using placement tags.

## Overview

UI-Doc uses placement tags to structure documentation into a navigable hierarchy. This guide shows you how to create pages and sections that make your documentation easy to explore and understand.

**Use this guide when you want to:**

- Create multiple documentation pages to group related components
- Organize content within pages using sections and subsections
- Control the order in which pages and sections appear

## Prerequisites

Before starting, ensure you have:

- UI-Doc installed and configured (see [Getting Started with Vite](../getting-started/vite.md) or [Getting Started with Rollup](../getting-started/rollup.md))
- At least one source file with doc blocks

## Solution

### Step 1: Create a page with @page

Define a page by adding a `@page` tag to a doc block. The page receives a unique key and a display name.

```css
/**
 * Variables used in the project.
 *
 * @page variables Variables
 */
```

The syntax is `@page [key] [display name]`:

- **key**: A unique identifier to reference this page (e.g., `variables`)
- **display name**: The text shown in navigation (e.g., `Variables`)

### Step 2: Add sections to a page with @location

Use `@location` to place content on a specific page within a section. The `@location` tag combines page and section information in one tag.

```css
/**
 * The color variables define the color palette.
 *
 * @location variables.colors Colors
 * @color {0 0 0} --color-black | black
 * @color {255 255 255} --color-white | white
 */
:root {
  --color-black: 0 0 0;
  --color-white: 255 255 255;
}
```

The syntax is `@location [page.section] [section name]`:

- **page**: The page key you defined earlier
- **section**: A unique section identifier
- **section name**: The text shown for this section

### Step 3: Create nested sections with dot notation

Create deeper hierarchies by using additional dots in your location path.

```css
/**
 * Global font variables used throughout the project.
 *
 * @location variables.global.font Font
 */
:root {
  --font-family: system-ui, sans-serif;
  --font-size: 16px;
}
```

This creates:

- Page: `variables`
- Section: `global`
- Subsection: `font`

### Result

Your documentation now has a navigable hierarchy. Pages appear in the main navigation, and sections create an organized structure within each page.

```text
Variables
├── Colors
└── Global
    └── Font
```

## Variations

### Using @page and @section separately

Instead of `@location`, you can use `@page` and `@section` tags separately. This is useful when you want to be explicit or when working with deeply nested structures.

```css
/**
 * Typography format examples.
 *
 * @page resets
 * @section typography.format Format
 * @example
 * <span>Normal Text</span><br>
 * <strong>Strong Text</strong><br>
 */
```

This is equivalent to:

```css
/**
 * Typography format examples.
 *
 * @location resets.typography.format Format
 * @example
 * <span>Normal Text</span><br>
 * <strong>Strong Text</strong><br>
 */
```

### Controlling display order with @order

By default, pages and sections appear in alphabetical order. Use `@order` to specify a custom ordering.

```css
/**
 * Variables used in the project.
 *
 * @page variables Variables
 * @order 10
 */

/**
 * Resets normalize browser styles.
 *
 * @page resets Resets
 * @order 20
 */

/**
 * Utility classes for common styling tasks.
 *
 * @page utils Utilities
 * @order 30
 */
```

Pages will appear in order: Variables (10), Resets (20), Utilities (30). When multiple items have the same order value, they sort alphabetically.

The `@order` tag also works with sections:

```css
/**
 * Primary button styles.
 *
 * @location components.button.primary Primary Button
 * @order 1
 */

/**
 * Secondary button styles.
 *
 * @location components.button.secondary Secondary Button
 * @order 2
 */
```

### Creating a homepage

Create a dedicated homepage by defining a page without sections and adding introductory content.

```css
/**
 * Welcome to the UI-Doc design system.
 *
 * This documentation covers all components, utilities, and design tokens
 * used in the project.
 *
 * @page index Welcome
 */
```

## Troubleshooting

### Sections appear on the wrong page

Ensure the page key in your `@location` matches the key you defined with `@page`. Keys are case-sensitive.

**Problem:**

```css
@page myPage My Page
@location MyPage.section Section; /* Wrong - capital M */
```

**Solution:**

```css
@page myPage My Page
@location myPage.section Section; /* Correct - matches case */
```

### Nested sections don't display correctly

Verify that you're using dots (`.`) to separate section levels, not slashes or other separators.

**Problem:**

```css
@location page/section/subsection Name; /* Wrong separator */
```

**Solution:**

```css
@location page.section.subsection Name; /* Correct - uses dots */
```

### Pages appear in the wrong order

Check that your `@order` values are numbers and that you haven't accidentally duplicated values. When order values are equal, alphabetical sorting determines the sequence.

**Problem:**

```css
@page foo Foo
@order first; /* Wrong - not a number */
```

**Solution:**

```css
@page foo Foo
@order 1; /* Correct - numeric value */
```

## Related guides

- [How to document design tokens](./document-design-tokens.md) - Documenting colors, spacing, and icons
- [Tutorial: First component](../tutorials/first-component.md) - Complete walkthrough of creating documentation
- [Tag reference](../../packages/core/README.md#available-tags) - Complete list of available tags
