# Showcase: Variations

Demonstrates the `@variations` tag for creating permutation grids.

## Usage

```bash
pnpm showcase:variations
pnpm serve:showcase:variations
```

## What It Shows

- `@variations` tag creates automatic permutation grids
- Components displayed across multiple variation contexts
- Background color variations
- Size variations

## How @variations Works

Define variation classes:

```css
/**
 * @location backgrounds.black Black
 */
.bg-black {
  background: #1f2937;
}

/**
 * @location backgrounds.white White
 */
.bg-white {
  background: #ffffff;
}
```

Reference them in components:

```css
/**
 * Primary button shown on all backgrounds.
 * @location buttons.primary Primary
 * @variations backgrounds
 * @example
 * <button class="btn btn-primary">Button</button>
 */
```

UI-Doc generates a grid showing the button on each background color.

## Use Cases

- Testing color contrast across themes
- Showing component states (hover, active, disabled)
- Size permutations (small, medium, large)
- Responsive breakpoint previews
