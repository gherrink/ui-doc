# Tutorial: Document your first UI component

Learn how to document a UI component from scratch using UI-Doc's doc block syntax. By the end of this tutorial, you'll understand how to structure documentation, use placement and display tags, and create comprehensive component documentation with live examples.

## What you'll learn

By the end of this tutorial, you'll know how to:

- Write a complete doc block with placement and display tags
- Organize documentation into pages and sections
- Add live examples with code previews
- Document color variables and other design tokens
- Control documentation order and structure

## Prerequisites

This tutorial assumes you have:

- Completed the [Getting Started with Vite](../getting-started/vite.md) or [Getting Started with Rollup](../getting-started/rollup.md) guide
- UI-Doc configured and running in development mode
- Basic understanding of CSS and HTML

## Step 1: Create the component page

Start by creating a page that will contain all your button documentation. This page serves as a container for related component variants.

Create a new CSS file `src/components/button.css`:

```css
/**
 * Button components for user interactions.
 *
 * @page buttons Buttons
 */
```

This creates a documentation page with the key `buttons` and the title "Buttons". The description "Button components for user interactions" appears at the top of the page.

### Checkpoint

At this point:

- You should see a "Buttons" entry in the navigation menu
- Clicking it opens a page with the description "Button components for user interactions"
- The page is empty except for the description

## Step 2: Add your first component section

Now add a primary button component with a live example. This section will appear on the Buttons page you just created.

Add this to `src/components/button.css`:

```css
/**
 * Primary button for main calls to action.
 * Use this for form submissions and important actions.
 *
 * @location buttons.primary Primary Button
 * @example
 * <button class="btn btn-primary">Save Changes</button>
 * <button class="btn btn-primary">Submit Form</button>
 * <button class="btn btn-primary">Continue</button>
 */
.btn-primary {
  background: #0066cc;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn-primary:hover {
  background: #0052a3;
}
```

### Understanding this doc block

- `@location buttons.primary Primary Button` - Places this section on the `buttons` page with the key `primary` and title "Primary Button"
- `@example` - Everything after this tag becomes the live preview HTML
- The description explains when to use this button variant

The `@location` tag combines `@page` and `@section` in one convenient tag. It's equivalent to writing `@page buttons` and `@section primary Primary Button`.

### Checkpoint

Your Buttons page should now show:

- A "Primary Button" section
- Your description about when to use it
- Three interactive buttons you can hover over
- The HTML code displayed below the preview

## Step 3: Add button states

Document the disabled state to show users how buttons behave when inactive.

Add this to `src/components/button.css`:

```css
/**
 * Disabled state prevents user interaction.
 * The button appears grayed out and the cursor changes to indicate it's not clickable.
 *
 * @location buttons.primary.disabled Disabled State
 * @example
 * <button class="btn btn-primary" disabled>Cannot Submit</button>
 * <button class="btn btn-primary" aria-disabled="true">Cannot Save</button>
 */
.btn-primary:disabled,
.btn-primary[aria-disabled="true"] {
  background: #cccccc;
  color: #666666;
  cursor: not-allowed;
  opacity: 0.6;
}
```

Notice how `buttons.primary.disabled` nests this section inside the "Primary Button" section. The dot notation creates a hierarchy in your documentation.

### Checkpoint

Under the "Primary Button" section, you should now see:

- A nested "Disabled State" subsection
- Two disabled buttons showing the visual appearance
- The code with both `disabled` and `aria-disabled` examples

## Step 4: Document color variables

If your buttons use CSS custom properties for colors, document them so users understand your color system.

Add this to `src/components/button.css`:

```css
/**
 * Color variables used across button components.
 * These can be customized by overriding the CSS custom properties.
 *
 * @location buttons.colors Button Colors
 * @color {0 102 204} --btn-primary-bg | Primary background
 * @color {0 82 163} --btn-primary-hover | Primary hover state
 * @color {255 255 255} --btn-text | Button text
 * @color {204 204 204} --btn-disabled | Disabled state
 */
:root {
  --btn-primary-bg: 0 102 204;
  --btn-primary-hover: 0 82 163;
  --btn-text: 255 255 255;
  --btn-disabled: 204 204 204;
}
```

The `@color` tag syntax is: `@color {rgb-values} variable-name | description`

### Checkpoint

Your Buttons page now has a "Button Colors" section showing:

- Color swatches for each variable
- The variable name (e.g., `--btn-primary-bg`)
- A description of where it's used
- The RGB values for each color

## Step 5: Add a secondary variant

Document a secondary button variant to show users alternative styles. Use the `@order` tag to control where it appears.

Add this to `src/components/button.css`:

```css
/**
 * Secondary button for less prominent actions.
 * Use this for cancel buttons or alternative actions.
 *
 * @location buttons.secondary Secondary Button
 * @order 2
 * @example
 * <button class="btn btn-secondary">Cancel</button>
 * <button class="btn btn-secondary">Go Back</button>
 */
.btn-secondary {
  background: transparent;
  color: #0066cc;
  padding: 10px 20px;
  border: 2px solid #0066cc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn-secondary:hover {
  background: #0066cc;
  color: white;
}
```

Now go back and add an order to your primary button section:

```css
/**
 * Primary button for main calls to action.
 * Use this for form submissions and important actions.
 *
 * @location buttons.primary Primary Button
 * @order 1
 * @example
 * <button class="btn btn-primary">Save Changes</button>
 * <button class="btn btn-primary">Submit Form</button>
 * <button class="btn btn-primary">Continue</button>
 */
```

The `@order` tag ensures "Primary Button" appears before "Secondary Button" even though "secondary" comes after "primary" alphabetically.

### Checkpoint

Your Buttons page sections should appear in this order:

1. Primary Button (`@order 1`)
2. Secondary Button (`@order 2`)
3. Button Colors (no order specified, appears alphabetically after ordered sections)

## Step 6: Hide implementation details

Sometimes your example needs extra HTML for proper display, but you don't want to show it in the code block. Use `@code` to show simplified code while keeping the full example.

Add this to `src/components/button.css`:

```css
/**
 * Button sizing variants for different contexts.
 *
 * @location buttons.sizes Sizes
 * @example
 * <div style="display: flex; gap: 10px; align-items: center;">
 *   <button class="btn btn-primary btn-sm">Small</button>
 *   <button class="btn btn-primary">Default</button>
 *   <button class="btn btn-primary btn-lg">Large</button>
 * </div>
 *
 * @code
 * <button class="btn btn-primary btn-sm">Small</button>
 * <button class="btn btn-primary">Default</button>
 * <button class="btn btn-primary btn-lg">Large</button>
 */
.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-lg {
  padding: 14px 28px;
  font-size: 16px;
}
```

The example includes a wrapper `<div>` for layout, but the code block only shows the clean button markup.

### Checkpoint

In the "Sizes" section, you should see:

- Three buttons displayed in a row with proper spacing (from the example)
- Code showing only the button elements without the wrapper div (from the `@code` tag)

## Step 7: Verify the complete documentation

Start your development server if it's not already running:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Navigate to `http://localhost:5173/ui-doc/` (or your configured URL).

You should see:

- "Buttons" in the navigation menu
- A well-organized page with sections in the correct order
- Live, interactive examples for each button variant
- Color swatches showing your design tokens
- Clean, copyable code examples

Try interacting with the examples:

- Hover over primary and secondary buttons to see hover states
- Notice that disabled buttons don't respond to hover
- Click buttons to verify they're fully functional

## Summary

In this tutorial, you learned how to:

- Create documentation pages with `@page`
- Organize content with `@location` and nested sections
- Add live examples with `@example`
- Document design tokens with `@color`
- Control section order with `@order`
- Show simplified code with `@code` while keeping detailed examples

## Complete code

Here's the complete code from this tutorial:

<details>
<summary>src/components/button.css</summary>

```css
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
 * @order 1
 * @example
 * <button class="btn btn-primary">Save Changes</button>
 * <button class="btn btn-primary">Submit Form</button>
 * <button class="btn btn-primary">Continue</button>
 */
.btn-primary {
  background: #0066cc;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn-primary:hover {
  background: #0052a3;
}

/**
 * Disabled state prevents user interaction.
 * The button appears grayed out and the cursor changes to indicate it's not clickable.
 *
 * @location buttons.primary.disabled Disabled State
 * @example
 * <button class="btn btn-primary" disabled>Cannot Submit</button>
 * <button class="btn btn-primary" aria-disabled="true">Cannot Save</button>
 */
.btn-primary:disabled,
.btn-primary[aria-disabled="true"] {
  background: #cccccc;
  color: #666666;
  cursor: not-allowed;
  opacity: 0.6;
}

/**
 * Secondary button for less prominent actions.
 * Use this for cancel buttons or alternative actions.
 *
 * @location buttons.secondary Secondary Button
 * @order 2
 * @example
 * <button class="btn btn-secondary">Cancel</button>
 * <button class="btn btn-secondary">Go Back</button>
 */
.btn-secondary {
  background: transparent;
  color: #0066cc;
  padding: 10px 20px;
  border: 2px solid #0066cc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn-secondary:hover {
  background: #0066cc;
  color: white;
}

/**
 * Button sizing variants for different contexts.
 *
 * @location buttons.sizes Sizes
 * @example
 * <div style="display: flex; gap: 10px; align-items: center;">
 *   <button class="btn btn-primary btn-sm">Small</button>
 *   <button class="btn btn-primary">Default</button>
 *   <button class="btn btn-primary btn-lg">Large</button>
 * </div>
 *
 * @code
 * <button class="btn btn-primary btn-sm">Small</button>
 * <button class="btn btn-primary">Default</button>
 * <button class="btn btn-primary btn-lg">Large</button>
 */
.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-lg {
  padding: 14px 28px;
  font-size: 16px;
}

/**
 * Color variables used across button components.
 * These can be customized by overriding the CSS custom properties.
 *
 * @location buttons.colors Button Colors
 * @color {0 102 204} --btn-primary-bg | Primary background
 * @color {0 82 163} --btn-primary-hover | Primary hover state
 * @color {255 255 255} --btn-text | Button text
 * @color {204 204 204} --btn-disabled | Disabled state
 */
:root {
  --btn-primary-bg: 0 102 204;
  --btn-primary-hover: 0 82 163;
  --btn-text: 255 255 255;
  --btn-disabled: 204 204 204;
}
```

</details>

## Next steps

Continue learning with:

- [Tag Reference](../reference/tags.md) - Explore all available tags including `@space`, `@icon`, and `@hideCode`
- [Organizing documentation](../how-to/organize-documentation.md) - Learn strategies for structuring large component libraries
- [Customizing examples](../how-to/customize-examples.md) - Add custom styles and scripts to your examples
- [Conceptual: Doc blocks](../concepts/doc-blocks.md) - Understand how doc blocks are parsed and transformed
