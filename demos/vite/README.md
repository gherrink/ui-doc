# Vite Demo

Demonstrates UI-Doc integration with Vite.

## Usage

```bash
# Development with HMR
pnpm vite

# Production build
pnpm vite:build
pnpm serve:vite

# Preview production build
pnpm vite:preview
```

## Configuration

The Vite config (`vite.config.mjs`) shows:

- Alias configuration for clean imports
- Custom templates integration
- Page and example asset injection from build inputs
- Development vs production base URI handling

## Key Options

```javascript
uidoc({
  output: {
    baseUri: command === 'serve' ? undefined : '.',
  },
  source: ['../shared/css/**/*.css'],
  templatePath: '../shared/ui-doc/templates',
  assets: {
    static: '../shared/ui-doc/assets',
    page: [{ name: 'ui-doc-custom', fromInput: true }],
    example: [{ name: 'app', fromInput: true, attrs: { type: 'module' } }],
  },
})
```

## When to Use

Use the Vite plugin when:

- Building modern web applications
- You want fast HMR during development
- Your project already uses Vite
- You need the simplest possible setup
