# Understanding the variation system

The variation system allows you to display UI components in multiple contexts, such as light and dark backgrounds, different themes, or various container states. This enables comprehensive documentation that shows how components adapt across different use cases.

## What is the variation system?

The variation system is a feature in UI-Doc that lets you define reusable wrappers and automatically display components within them. Instead of manually creating examples for every combination of component and background, you define variations once and apply them to multiple components.

The system consists of three tags that work together:

- `@variation` - Defines a wrapper context that components can be displayed in
- `@variations` - Marks which variations a component should be shown with
- `@showcase` - Outputs a component rendered in all its applicable variations

This approach reduces duplication and ensures consistent presentation across your documentation.

## How the variation system works

### Defining variations with `@variation`

A variation defines a wrapper template that will surround component examples. The wrapper must include the `{{content}}` placeholder where the component's example will be injected.

```css
/**
 * @location utils.background.light Light Background
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
```

**Key components:**

- **Variation key** (`bg.light`) - A unique identifier using hierarchical dot notation
- **Display name** (`Light Background`) - Human-readable label shown in documentation
- **Wrapper template** - HTML containing `{{content}}` placeholder

**Hierarchical keys:**

Variations use dot notation to create groups. For example:

- `bg.light` - Belongs to the `bg` group
- `bg.dark` - Also belongs to the `bg` group
- `theme.primary` - Belongs to the `theme` group

This grouping enables bulk selection when applying variations to components.

### Marking components with `@variations`

The `@variations` tag specifies which variations should be applied to a component. You can reference individual variations, entire groups, or use pattern matching.

```css
/**
 * Primary action button with brand colors.
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
```

**Pattern matching:**

| Pattern | Matches | Example |
|---------|---------|---------|
| `bg` | All variations starting with `bg.` | `bg.light`, `bg.dark`, `bg.subtle` |
| `bg.light` | Exact match only | `bg.light` |
| `*` | All defined variations | Everything |
| `bg, theme` | Multiple groups | All `bg.*` and `theme.*` variations |
| Empty or no tag | All variations | Same as `*` |

**Exclusion patterns:**

You can exclude specific variations using the `-` prefix:

| Pattern | Result |
|---------|--------|
| `bg, -bg.dark` | All `bg.*` except `bg.dark` |
| `*, -bg.dark` | All variations except `bg.dark` |
| `-bg.dark, -theme.muted` | All variations except these two |

### Creating showcases with `@showcase`

The `@showcase` tag creates a documentation section that displays a component in each of its applicable variations. It references another block by its key and inherits that block's variation settings.

```css
/**
 * Display the primary button across all background variations.
 *
 * @location showcases.buttons Primary Button Showcase
 * @showcase components.button.primary
 */
```

This creates a section showing the primary button component rendered once for each variation specified in the original component's `@variations` tag.

**Overriding variations:**

You can override the source block's variations by adding a `@variations` tag to the showcase:

```css
/**
 * Show the primary button only on light backgrounds.
 *
 * @location showcases.buttons.light Primary Button (Light Only)
 * @showcase components.button.primary
 * @variations bg.light
 */
```

## Variation system in practice

Here's a complete example showing all three tags working together:

```css
/* Step 1: Define background variations */

/**
 * @location _variations.backgrounds Backgrounds
 * @variation bg.light Light Background
 * @example
 * <div class="bg bg-light" style="padding: 2rem; min-height: 100px;">
 *   {{content}}
 * </div>
 */
.bg-light {
  --bg-color: var(--color-white);
  --font-color: var(--color-black);
}

/**
 * @location _variations.backgrounds Backgrounds
 * @variation bg.dark Dark Background
 * @example
 * <div class="bg bg-dark" style="padding: 2rem; min-height: 100px;">
 *   {{content}}
 * </div>
 */
.bg-dark {
  --bg-color: var(--color-black);
  --font-color: var(--color-white);
}

/**
 * @location _variations.backgrounds Backgrounds
 * @variation bg.gray Gray Background
 * @example
 * <div class="bg bg-gray" style="padding: 2rem; min-height: 100px;">
 *   {{content}}
 * </div>
 */
.bg-gray {
  --bg-color: var(--color-gray);
  --font-color: var(--color-black);
}

/* Step 2: Mark components with variations */

/**
 * Primary button for main actions.
 *
 * @location components.button.primary Primary Button
 * @variations bg
 * @example
 * <button class="btn btn-primary">Save Changes</button>
 */
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
}

/**
 * Secondary button for less prominent actions.
 *
 * @location components.button.secondary Secondary Button
 * @variations bg, -bg.gray
 * @example
 * <button class="btn btn-secondary">Cancel</button>
 */
.btn-secondary {
  background: var(--color-secondary);
  color: white;
  padding: 0.5rem 1rem;
}

/* Step 3: Create showcases */

/**
 * Displays all button variations across backgrounds.
 *
 * @location showcases.buttons Button Showcase
 * @showcase components.button
 */
```

**Result:**

The documentation will display:

1. A background variations reference page
2. Individual button component pages with examples
3. A showcase page showing:
   - Primary button in light, dark, and gray backgrounds (3 examples)
   - Secondary button in light and dark backgrounds only (2 examples, gray excluded)

## Why the variation system matters

The variation system provides several practical benefits:

- **Consistency** - Define wrapper styles once and reuse them across all components
- **Completeness** - Automatically verify components work in all required contexts
- **Maintainability** - Update a variation definition in one place to affect all uses
- **Documentation quality** - Show real-world usage patterns without manual duplication

### Example use cases

**Testing accessibility:**

```css
/**
 * @variation contrast.high High Contrast
 * @example
 * <div style="filter: contrast(150%);">
 *   {{content}}
 * </div>
 */
```

**Responsive containers:**

```css
/**
 * @variation container.mobile Mobile Width
 * @example
 * <div style="max-width: 320px;">
 *   {{content}}
 * </div>
 */
```

**Theme contexts:**

```css
/**
 * @variation theme.enterprise Enterprise Theme
 * @example
 * <div class="theme-enterprise">
 *   {{content}}
 * </div>
 */
```

## Common patterns

### Organizing variation definitions

Use a dedicated location for variation definitions:

```css
/**
 * @location _variations Variation Definitions
 * @variation bg.light Light Background
 * @example
 * <div class="bg-light">{{content}}</div>
 */
```

The underscore prefix (`_variations`) is a common convention to sort these entries separately in navigation.

### Default variations for component groups

Apply variations to entire component sections:

```css
/**
 * All buttons should be shown on various backgrounds.
 *
 * @location components.buttons Buttons
 * @variations bg
 */

/**
 * Inherits bg variations from parent.
 *
 * @location components.buttons.primary Primary Button
 * @example
 * <button class="btn-primary">Click me</button>
 */
```

### Selective showcase displays

Create multiple showcases with different variation subsets:

```css
/**
 * @location showcases.buttons.all Complete Button Showcase
 * @showcase components.button.primary
 */

/**
 * @location showcases.buttons.accessible Accessible Contexts Only
 * @showcase components.button.primary
 * @variations contrast.high, contrast.normal
 */
```

## Troubleshooting

### Variation not appearing

**Problem:** A component isn't showing in a variation you expect.

**Solution:** Check the pattern matching. The pattern `bg.light` only matches exactly that variation, not other `bg.*` variations. Use `bg` to match all variations in the group.

```css
/* Only shows in bg.light */
@variations bg.light

/* Shows in all bg.* variations */
@variations bg
```

### Missing `{{content}}` placeholder

**Problem:** Error message: "Variation wrapper must include {{content}} placeholder."

**Solution:** Ensure your variation's `@example` includes `{{content}}`:

```css
/**
 * @variation bg.light Light Background
 * @example
 * <div class="bg-light">
 *   {{content}}
 * </div>
 */
```

### Showcase not finding component

**Problem:** Showcase displays nothing or shows an error.

**Solution:** Verify the showcase references the correct block key. Use the format `page.section`:

```css
/**
 * @location components.button.primary Primary Button
 * @example
 * <button>Click</button>
 */

/**
 * References using page.section format
 * @showcase components.button.primary
 */
```

### Case sensitivity

**Problem:** Variations aren't matching even though the names look correct.

**Solution:** All variation keys are automatically converted to lowercase. Ensure consistency:

```css
/* Define as bg.light (lowercase) */
@variation bg.light Light Background

/* Reference as bg.light (lowercase) */
@variations bg.light
```

## Related documentation

- [Tag Reference](../reference/tags.md) - Complete documentation for `@variation`, `@variations`, and `@showcase` tags
- [Getting Started with Vite](../getting-started/vite.md) - Basic UI-Doc setup to start using variations
- [Doc Block Concepts](../concepts/doc-blocks.md) - Understanding how doc blocks work in UI-Doc

## Further reading

- [Examples in demos](../../demos/css/) - Real variation system usage in the project demos
- [@ui-doc/core documentation](../../packages/core/README.md) - Core API and tag system details
