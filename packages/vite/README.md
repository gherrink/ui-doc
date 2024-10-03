# UI-Doc vite plugin

Integrates UI-Doc into vite by using the `@ui-doc/rollup` plugin and add functionality to vite dev server to display / preview the UI-Doc. Per default it will add a `ui-doc` uri to your vite dev url. You can change the uri by changing the `output.dir` or `output.baseUri` option.

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
      assets: {
        example: {
          name: 'app',
          input: true,
        },
      },
    }),
  ],
})
```

## Options

Please see the Options from [@ui-doc/rollup](../rollup/README.md#options) they are the same.

# Good to Know

## The `output.baseUri` setting can be changed depending on context

When using vite serve and build with same setting and you want to extract the UI-Doc into a other system you need to change the `output.baseUri` depending on build context. UI-Doc in vite will set the `output.dir` per default to `ui-doc` so it can run correctly while serving but you may don't want the `ui-doc` uri in your final output.

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
        source: ['css/**/*.css'],
        assets: {
          output: {
            baseUri: command === 'serve' ? undefined : '.',
          }
          staticAssets: './assets',
          page: {
            name: 'ui-doc-custom'
            input: true
          }
          example: {
            name: 'app',
            input: true,
          },
        },
      }),
    ],
  }
})
```

# Known Issues
