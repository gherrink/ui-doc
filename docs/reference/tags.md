# Tags reference

Complete reference for all built-in UI-Doc tags, including syntax, parameters, and examples.

## Overview

UI-Doc uses JSDoc-style tags to control where documentation appears and what content is displayed. Tags are divided into two categories:

- **Placement tags** - Define where your doc block appears in the generated documentation (at least one required)
- **Display tags** - Control what content is shown and how it's rendered

All tags follow the syntax: `@tag-name[ {type}][ name][ description]`

## Placement tags

Placement tags determine the location of your documentation. Every doc block must include at least one placement tag.

### @page

Creates a top-level documentation page or references an existing page.

**Syntax:**

```text
@page {page-key} [Page Title]
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| page-key | Yes | `string` | Unique identifier for the page |
| Page Title | No | `string` | Display title for the page (required when creating a new page) |

**Example:**

```css
/**
 * Creates a page for typography documentation.
 *
 * @page typography Typography
 */

/**
 * References the typography page to add content to it.
 *
 * @page typography
 * @section headings Headings
 */
```

**Output:**

Creates a documentation page accessible via navigation with the title "Typography".

### @section

Creates a documentation section within a page. Sections can be nested using dot notation.

**Syntax:**

```text
@section {section-key}[.nested-key] [Section Title]
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| section-key | Yes | `string` | Unique identifier for the section within its parent |
| nested-key | No | `string` | Additional keys for nested sections (use dot notation) |
| Section Title | Yes | `string` | Display title for the section |

**Example:**

```css
/**
 * Create a top-level section on the typography page.
 *
 * @page typography
 * @section headings Headings
 */

/**
 * Create a nested section within headings.
 *
 * @page typography
 * @section headings.sizes Heading Sizes
 */
```

**Output:**

Creates a "Headings" section on the Typography page, with a "Heading Sizes" subsection nested inside.

### @location

Shorthand that combines `@page` and `@section` in a single tag.

**Syntax:**

```text
@location {page-key}[.section-key] [Title]
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| page-key | Yes | `string` | Unique identifier for the page |
| section-key | No | `string` | Section identifier(s) using dot notation |
| Title | Yes | `string` | Display title for the page or section |

**Example:**

```css
/**
 * Create a section on the typography page.
 *
 * @location typography.headings Headings
 */

/**
 * Create a nested section.
 *
 * @location typography.headings.sizes Heading Sizes
 */

/**
 * Create a page (no section key).
 *
 * @location typography Typography
 */
```

**Output:**

Equivalent to using `@page` and `@section` separately.

### @order

Defines the display order for pages or sections using a number. Lower numbers appear first.

**Syntax:**

```text
@order {order-number}
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| order-number | Yes | `number` | Sort order (lower appears first) |

**Example:**

```css
/**
 * This page will appear second in navigation.
 *
 * @page components Components
 * @order 2
 */

/**
 * This page will appear first in navigation.
 *
 * @page getting-started Getting Started
 * @order 1
 */

/**
 * When order values are equal, alphabetical sorting is used.
 *
 * @location components.button Button
 * @order 1
 */

/**
 * This section will appear before Button (same order, alphabetical).
 *
 * @location components.accordion Accordion
 * @order 1
 */
```

**Output:**

Pages and sections are sorted by order number first, then alphabetically when order values match.

## Display tags

Display tags control what content is shown in your documentation and how it's rendered.

### @example

Displays both a live preview and the code. The preview renders the HTML while the code block shows the source.

**Syntax:**

```text
@example
[HTML content on following lines]
```

**Parameters:**

None. Content follows the tag on subsequent lines.

**Example:**

```css
/**
 * Button component with different states.
 *
 * @location components.button Button
 * @example
 * <button class="btn">Default</button>
 * <button class="btn" disabled>Disabled</button>
 * <a href="#" class="btn">Link Button</a>
 */
.btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
}
```

**Output:**

Shows a live preview of the buttons followed by a copyable code block with the HTML.

### @code

Displays only the code block without a live preview. When used with `@example`, overrides the displayed code.

**Syntax:**

```text
@code
[Code content on following lines]
```

**Parameters:**

None. Content follows the tag on subsequent lines.

**Example:**

```css
/**
 * Display code without preview.
 *
 * @location components.grid Grid
 * @code
 * <div class="grid">
 *   <div class="grid-item">Item 1</div>
 *   <div class="grid-item">Item 2</div>
 * </div>
 */

/**
 * Show clean code while preview includes helper markup.
 *
 * @location components.card Card
 * @example
 * <div class="card" style="max-width: 300px">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </div>
 * @code
 * <div class="card">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </div>
 */
```

**Output:**

First example shows only the code block. Second example shows a preview with inline styles but the code block without them.

### @hideCode

Hides the code block when you only want to show the visual example.

**Syntax:**

```text
@hideCode
```

**Parameters:**

None.

**Example:**

```css
/**
 * Show only visual examples of typography variations.
 *
 * @location typography.examples Typography Examples
 * @example
 * <span>Normal Text</span><br>
 * <strong>Strong Text</strong><br>
 * <em>Emphasis Text</em><br>
 * <small>Small Text</small>
 * @hideCode
 */
```

**Output:**

Shows the rendered typography examples without displaying the HTML source code.

### @color

Defines color variables used in your styles. Multiple colors can be defined in one block and will be displayed together with color swatches.

**Syntax:**

```text
@color [{color-value}[|{text-color}]] {variable-name} [separator] [description]
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| color-value | No | `string` | RGB values (`0 0 0`), hex (`#fff`), or CSS variable reference (`--color-name`) |
| text-color | No | `string` | RGB values for text color on the swatch (after `\|`) |
| variable-name | Yes | `string` | CSS variable name (e.g., `--color-primary`) |
| separator | No | `\|` or `-` | Separates variable name from description |
| description | Yes | `string` | Human-readable color name |

**Example:**

```css
/**
 * Brand color palette.
 *
 * @location variables.colors Colors
 * @color {0 0 0|255 255 255} --color-black | black
 * @color {20 33 61|255 255 255} --color-blue | blue
 * @color {252 163 17} --color-yellow | yellow
 * @color {#fff} --color-white-hex | white
 * @color {--color-primary} --color-primary-ref | primary reference
 * @color --color-from-stylesheet | color from stylesheet
 */
:root {
  --color-black: 0 0 0;
  --color-blue: 20 33 61;
  --color-yellow: 252 163 17;
  --color-white-hex: #fff;
  --color-primary: var(--color-blue);
  --color-from-stylesheet: 100 100 100;
}
```

**Output:**

Displays color swatches with variable names and descriptions. If a CSS variable reference is used without a type value, UI-Doc will attempt to resolve it from your stylesheet.

> **Note:** When using the pipe separator (`|`) for text color, the first RGB value is the background and the second is the text color for the swatch.

### @space

Defines spacing variables used in your layout. Multiple spacing values can be defined in one block.

**Syntax:**

```text
@space {{spacing-value}} {variable-name} [separator] [description]
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| spacing-value | Yes | `number` | Spacing multiplier (e.g., `0.5`, `1.2`) |
| variable-name | Yes | `string` | CSS variable name (e.g., `--space-sm`) |
| separator | No | `\|` or `-` | Separates variable name from description |
| description | Yes | `string` | Human-readable spacing name |

**Example:**

```css
/**
 * Spacing scale for consistent layout.
 *
 * @location variables.spaces Spacing
 * @space {0.5} --space-xs | Extra small
 * @space {0.7} --space-sm | Small
 * @space {1} --space-normal | Normal
 * @space {1.3} --space-md | Medium
 * @space {1.8} --space-lg | Large
 * @space {3.2} --space-xl | Extra large
 */
:root {
  --space-xs: 0.5;
  --space-sm: 0.7;
  --space-normal: 1;
  --space-md: 1.3;
  --space-lg: 1.8;
  --space-xl: 3.2;
}
```

**Output:**

Displays a visual representation of each spacing value. The multiplier is used with the default spacing unit (typically `1rem`) to show the actual size.

### @icon

Defines icons from your icon font. Multiple icons can be defined in one block.

**Syntax:**

```text
@icon [{icon-code}] {variable-name} [separator] [description]
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| icon-code | No | `string` | Unicode character code (e.g., `e900`) or CSS variable reference |
| variable-name | Yes | `string` | CSS variable name (e.g., `--icon-chevron`) |
| separator | No | `\|` or `-` | Separates variable name from description |
| description | Yes | `string` | Human-readable icon name |

**Example:**

```css
/**
 * Navigation icons.
 *
 * @location variables.icons Icons
 * @icon {e900} --icon-chevron-down - chevron down
 * @icon {e901} --icon-chevron-left - chevron left
 * @icon {--icon-chevron-right} --icon-chevron-right | chevron right
 * @icon --icon-chevron-up | chevron up
 */
:root {
  --icon-chevron-down: "\e900";
  --icon-chevron-left: "\e901";
  --icon-chevron-right: "\e902";
  --icon-chevron-up: "\e903";
}
```

**Output:**

Displays each icon with its variable name and description.

> **Requirements:** You must provide a custom stylesheet with an `@font-face` declaration for your icon font and set the `--icons-font-family` CSS variable:

```css
@font-face {
  font-family: icons;
  font-weight: normal;
  font-style: normal;
  font-display: block;
  src:
    url('fonts/icons.woff') format('woff'),
    url('fonts/icons.ttf') format('truetype');
}

:root {
  --icons-font-family: icons;
}
```

### @variation

Defines a reusable wrapper context that components can be displayed in. The variation system allows showing components in multiple environments (e.g., light/dark backgrounds, different themes).

**Syntax:**

```text
@variation {variation-key} [Display Name]
@example
[Wrapper HTML with {{content}} placeholder]
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| variation-key | Yes | `string` | Unique identifier using dot notation (e.g., `bg.light`, `theme.primary`) |
| Display Name | Yes | `string` | Human-readable name for the variation |

**Example:**

```css
/**
 * Light background variation for component showcase.
 *
 * @location _variations.backgrounds Backgrounds
 * @variation bg.light Light Background
 * @example
 * <div class="bg bg-light" style="padding: 2rem;">
 *   {{content}}
 * </div>
 */
.bg-light {
  --bg-color: var(--color-white);
  --font-color: var(--color-black);
}

/**
 * Dark background variation for component showcase.
 *
 * @location _variations.backgrounds Backgrounds
 * @variation bg.dark Dark Background
 * @example
 * <div class="bg bg-dark" style="padding: 2rem;">
 *   {{content}}
 * </div>
 */
.bg-dark {
  --bg-color: var(--color-black);
  --font-color: var(--color-white);
}
```

**Output:**

Creates variation definitions that can be applied to components using `@variations`. The wrapper HTML must include `{{content}}` as a placeholder where component examples will be injected.

**Key features:**

- **Hierarchical keys:** Use dot notation like `bg.light`, `bg.dark` to create groups
- **Group matching:** Components can reference `bg` to use all `bg.*` variations
- **Required placeholder:** Wrapper must contain `{{content}}`

### @variations

Specifies which variations a component should be displayed in. Supports pattern matching including groups, wildcards, and exclusions.

**Syntax:**

```text
@variations [pattern1[, pattern2, ...]]
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| patterns | No | `string` | Comma-separated list of variation patterns (empty/no tag = all variations) |

**Pattern matching:**

| Pattern | Matches | Example |
|---------|---------|---------|
| `bg` | All variations in the `bg` group | `bg.light`, `bg.dark`, etc. |
| `bg.light` | Exact match only | `bg.light` |
| `*` | All defined variations | Everything |
| `bg, theme` | Multiple groups | All `bg.*` and `theme.*` |
| `bg, -bg.dark` | Group with exclusion | All `bg.*` except `bg.dark` |
| `*, -bg.dark` | Wildcard with exclusion | All variations except `bg.dark` |
| Empty or no tag | All variations | Same as `*` |

**Example:**

```css
/**
 * Primary button shown in all background variations.
 *
 * @location components.button.primary Primary Button
 * @variations bg
 * @example
 * <button class="btn btn-primary">Save Changes</button>
 */
.btn-primary {
  background: var(--color-primary);
  color: white;
}

/**
 * Secondary button shown in all backgrounds except dark.
 *
 * @location components.button.secondary Secondary Button
 * @variations bg, -bg.dark
 * @example
 * <button class="btn btn-secondary">Cancel</button>
 */
.btn-secondary {
  background: var(--color-secondary);
  color: white;
}

/**
 * Alert shown in all variations.
 *
 * @location components.alert Alert
 * @variations *
 * @example
 * <div class="alert">Important message</div>
 */
.alert {
  padding: 1rem;
  border-radius: 4px;
}
```

**Output:**

When used with `@showcase` or the variation rendering system, displays the component wrapped in each matching variation.

### @showcase

Creates a documentation block that displays a component in all its applicable variations. References another block by its key and renders that block's example in each variation.

**Syntax:**

```text
@showcase {page-key.section-key}
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| page-key.section-key | Yes | `string` | Block key to showcase (format: `page.section`) |

**Example:**

```css
/**
 * Showcase the primary button across all its variations.
 *
 * @location showcases.buttons Primary Button Showcase
 * @showcase components.button.primary
 */

/**
 * Override variations to show only on light backgrounds.
 *
 * @location showcases.buttons.light Primary Button (Light Only)
 * @showcase components.button.primary
 * @variations bg.light
 */
```

**Output:**

Creates a section showing the referenced component rendered once in each applicable variation wrapper. If the showcase block includes a `@variations` tag, it overrides the source block's variations.

**How it works:**

1. References the target block (e.g., `components.button.primary`)
2. Uses the target block's `@example` content
3. Wraps the example in each variation from the target's `@variations` (or showcase's `@variations` if overridden)
4. Displays all variations in sequence

### @variationdemo

Creates a documentation block that displays multiple components within a single variation wrapper. This is the inverse of `@showcase` - instead of showing one component in multiple variations, it shows multiple components in one variation.

**Syntax:**

```text
@variationdemo {variation-key}[, component-patterns]
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| variation-key | Yes | `string` | The variation to use as the wrapper (e.g., `bg.light`, `bg.dark`) |
| component-patterns | No | `string` | Comma-separated component patterns with optional `+` or `-` prefixes |

**Pattern modes:**

| Prefix | Mode | Behavior |
|--------|------|----------|
| None or `-` | Auto-discover | Find all components with matching `@variations`, optionally exclude specific components |
| `+` | Explicit | Only include explicitly specified components |

**Example:**

```css
/**
 * Auto-discover all components that work with bg.light variation.
 * This finds all blocks with @variations that match "bg.light".
 *
 * @location demos.backgrounds.light Light Background Demo
 * @variationdemo bg.light
 */

/**
 * Auto-discover with exclusion.
 * Shows all bg.dark components except the white button.
 *
 * @location demos.backgrounds.dark Dark Background Demo
 * @variationdemo bg.dark, -components.button.white
 */

/**
 * Explicit mode - only show specified components.
 * The + prefix switches to explicit selection.
 *
 * @location demos.backgrounds.selected Selected Components
 * @variationdemo bg.blue, +components.button.black, +components.input
 */

/**
 * Multiple exclusions in auto-discover mode.
 *
 * @location demos.backgrounds.filtered Filtered Demo
 * @variationdemo bg.gray, -components.button.white, -components.card
 */
```

**Output:**

Creates a section showing multiple components rendered together within the specified variation wrapper. The variation wrapper is applied once, and all matching components are displayed inside it.

**Pattern matching rules:**

1. **Auto-discover mode** (no `+` prefix):
   - Finds all blocks where `@variations` matches the specified variation key
   - Use `-` prefix to exclude specific components
   - Example: `bg.black` finds all components with `@variations bg` or `@variations bg.black`
   - Example: `bg.black, -components.button.white` excludes white button

2. **Explicit mode** (with `+` prefix):
   - Only includes components explicitly listed with `+` prefix
   - Auto-discovery is disabled when any `+` prefix is present
   - Example: `bg.light, +components.button.primary, +components.button.secondary`

**Relationship with other variation tags:**

| Tag | Relationship |
|-----|--------------|
| `@showcase` | ONE component → MULTIPLE variations (shows one component across different backgrounds) |
| `@variationdemo` | ONE variation → MULTIPLE components (shows multiple components in the same background) |
| `@variation` | Defines the wrapper used by `@variationdemo` |
| `@variations` | Marks components that can be auto-discovered by `@variationdemo` |

**Use cases:**

- **Background testing:** Show all light-themed components on a dark background
- **Theme demos:** Display multiple components together in a themed context
- **Accessibility testing:** View multiple components under high contrast settings
- **Comparison views:** Compare different component variants side-by-side in the same context

## Tag combinations

You can combine tags to achieve different documentation outcomes.

### Example with custom code

Show a preview with helper markup but display clean code:

```css
/**
 * Card component that needs container width for demo.
 *
 * @location components.card Card
 * @example
 * <div class="card" style="max-width: 300px; margin: 0 auto;">
 *   <h3 class="card-title">Card Title</h3>
 *   <p class="card-text">Card content goes here.</p>
 * </div>
 * @code
 * <div class="card">
 *   <h3 class="card-title">Card Title</h3>
 *   <p class="card-text">Card content goes here.</p>
 * </div>
 */
```

### Example without code

Show only visual output without source code:

```css
/**
 * Typography hierarchy demonstration.
 *
 * @location typography.hierarchy Hierarchy
 * @example
 * <h1>Heading 1</h1>
 * <h2>Heading 2</h2>
 * <h3>Heading 3</h3>
 * <p>Body text</p>
 * @hideCode
 */
```

### Multiple display tags

Document design tokens together:

```css
/**
 * Complete design system tokens.
 *
 * @location design-tokens Design Tokens
 * @color {20 33 61|255 255 255} --color-primary | Primary
 * @color {252 163 17} --color-accent | Accent
 * @space {1} --space-base | Base spacing
 * @space {2} --space-large | Large spacing
 */
```

## Complete reference table

Quick reference for all tags:

| Tag | Role | Required Parameters | Description |
|-----|------|---------------------|-------------|
| `@page` | Placement | `page-key`, `Page Title` | Create or reference a page |
| `@section` | Placement | `section-key`, `Section Title` | Create a section within a page |
| `@location` | Placement | `page-key[.section-key]`, `Title` | Shorthand for page and section |
| `@order` | Placement | `order-number` | Define sort order |
| `@example` | Display | Content on following lines | Show live preview and code |
| `@code` | Display | Content on following lines | Show code block only |
| `@hideCode` | Display | None | Hide code block from example |
| `@color` | Display | `variable-name`, `description` | Define color variables |
| `@space` | Display | `{value}`, `variable-name`, `description` | Define spacing variables |
| `@icon` | Display | `variable-name`, `description` | Define icon font characters |
| `@variation` | Display | `variation-key`, `Display Name` | Define a reusable wrapper context |
| `@variations` | Display | Patterns (optional) | Mark which variations to apply |
| `@showcase` | Display | `page-key.section-key` | Display component in variations |
| `@variationdemo` | Display | `variation-key`, patterns (optional) | Display multiple components in one variation |

## See also

- [Getting Started Guide](../getting-started/vite.md) - Learn the basics of writing doc blocks
- [Variation System Guide](../guides/variation-system.md) - Complete guide to using variations and showcases
- [Custom Tags Guide](../how-to/create-transformers.md) - Create your own tags with tag transformers
- [@ui-doc/core README](../../packages/core/README.md) - Complete Core API reference
