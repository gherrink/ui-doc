# UI-Doc vite plugin

Integrates UI-Doc into vite by using the `@ui-doc/rollup` plugin and add functionality to vite dev server to display / preview the UI-Doc.

## Install

```sh
# npm
npm install --save-dev @ui-doc/vite @ui-doc/html-renderer @highlightjs/cdn-assets

# yarn
yarn add --dev @ui-doc/vite @ui-doc/html-renderer @highlightjs/cdn-assets

# pnpm
pnpm install --save-dev @ui-doc/vite @ui-doc/html-renderer @highlightjs/cdn-assets
```

## Setup

```js
import uidoc from '@ui-doc/vite'
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
    uidoc({
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

Please see the Options from `@ui-doc/rollup` they are the same.
