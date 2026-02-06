# Showcase: Multi-Source

Demonstrates documentation from multiple file types (CSS + JavaScript).

## Usage

```bash
pnpm showcase:multi-source
pnpm serve:showcase:multi-source
```

## What It Shows

- CSS components documented with `@example` showing HTML
- JavaScript utilities documented with `@example js` showing code
- Both file types appearing in the same documentation site
- Unified navigation across different source types

## Configuration

```javascript
uidoc({
  source: ['src/**/*.css', 'src/**/*.js'],
})
```

## CSS Documentation

```css
/**
 * @location components.card Card
 * @example
 * <div class="card">Content</div>
 */
.card {
  /* styles */
}
```

## JavaScript Documentation

```javascript
/**
 * @location utils.formatDate Format Date
 * @example js
 * formatDate(new Date()) // "January 15, 2024"
 */
export function formatDate(date) {
  // implementation
}
```

## Use Cases

- Design systems with both CSS and JS utilities
- Component libraries with helper functions
- Mixed CSS/JS codebases
