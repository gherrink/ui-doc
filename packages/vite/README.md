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

# Known Issues

## The `customStyle` setting need to be changed depending on context

The custom style detection is a bit wonky and needs to be improved. To get the correct output you need to change the `customStyle` depending on context. In the example below we are using the `command` param to check if we are serving then we need to use the input file so vue serve will load the correct file. When generating we need to use the output file name.

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  return {
    build: {
      outDir: 'dist/vite',
      rollupOptions: {
        input: {
          app: 'css/index.css',
          'ui-doc-custom': 'css/ui-doc.css',
        },
      },
    },

    plugins: [
      uidoc({
        customStyle: command === 'serve' ? 'css/ui-doc.css' : 'ui-doc-custom.css',
        outputBaseUri: command === 'serve' ? undefined : '.',
        source: ['css/**/*.css'],
        staticAssets: './assets',
      }),
    ],
  }
})
```
