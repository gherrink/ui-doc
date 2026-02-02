# Showcase: Minimal Setup

The absolute bare minimum UI-Doc setup.

## Usage

```bash
pnpm showcase:minimal
pnpm serve:showcase:minimal
```

## What It Shows

- Single CSS file with `@page` and `@example` tags
- Minimal Vite configuration
- No custom templates or assets
- Default UI-Doc styling

## Files

```text
showcase-minimal/
├── vite.config.mjs    # 15 lines of config
└── src/
    └── styles.css     # Simple CSS with UI-Doc comments
```

## Minimal Config

```javascript
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
    }),
  ],
})
```

## When to Start Here

Start with this pattern when:

- Learning UI-Doc for the first time
- Documenting a small CSS library
- Prototyping before adding customization
