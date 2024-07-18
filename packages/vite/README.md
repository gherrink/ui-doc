# Styleguide vite plugin

Integrates styleguide into vite by using the `@styleguide/rollup` plugin and add functionality to vite dev server to display the styleguide.

## Install

```sh
# npm
npm install --save-dev @styleguide/vite @styleguide/html-renderer @highlightjs/cdn-assets

# yarn
yarn add --dev @styleguide/vite @styleguide/html-renderer @highlightjs/cdn-assets

# pnpm
pnpm install --save-dev @styleguide/vite @styleguide/html-renderer @highlightjs/cdn-assets
```

## Setup

```js
import styleguide from '@styleguide/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/vite',
    rollupOptions: {
      input: {
        app: 'css/index.css',
      },
    },
  },

  plugins: [
    styleguide({
      settings: {
        generate: {
          logo: () => 'Vite',
        },
        texts: {
          title: 'Vite Example',
        },
      },
      source: ['css/**/*.css'],
    }),
  ],
})
```

## Options

Please see the Options from `@styleguide/rollup` they are the same.
