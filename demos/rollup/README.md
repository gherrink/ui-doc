# Rollup Demo

Demonstrates UI-Doc integration with Rollup.

## Usage

```bash
pnpm rollup
pnpm serve:rollup

# Watch mode
pnpm rollup:watch
```

## Configuration

The Rollup config (`rollup.config.mjs`) shows:

- PostCSS processing alongside UI-Doc
- Custom assets (fonts, images)
- Page and example asset injection
- Custom logo and title settings

## Key Options

```javascript
uidoc({
  output: {
    dir: 'ui-doc',
    baseUri: '.',
  },
  source: ['../shared/css/**/*.css'],
  settings: {
    generate: {
      logo: () => 'Rollup',
    },
    texts: {
      title: 'Rollup Test',
    },
  },
  assets: {
    static: '../shared/ui-doc/assets',
    page: [{ name: 'ui-doc-custom.css', input: true }],
  },
})
```

## When to Use

Use the Rollup plugin when:

- Your project already uses Rollup
- You need fine-grained control over the build pipeline
- Building a library with documentation
