# UI-Doc rollup plugin

This plugin integrates UI-Doc into rollup.

## Install

```sh
# npm
npm install --save-dev @ui-doc/rollup @ui-doc/html-renderer @highlightjs/cdn-assets

# yarn
yarn add --dev @ui-doc/rollup @ui-doc/html-renderer @highlightjs/cdn-assets

# pnpm
pnpm install --save-dev @ui-doc/rollup @ui-doc/html-renderer @highlightjs/cdn-assets
```

## Setup

```js
import uidoc from '@ui-doc/rollup'
import postcss from 'rollup-plugin-postcss'

export default [
  {
    input: {
      app: 'css/index.css',
    },
    output: {
      dir: 'dist',
    },
    plugins: [
      postcss({
        extract: 'app.css',
      }),
      uidoc({
        settings: {
          generate: {
            logo: () => 'Rollup',
          },
          texts: {
            title: 'Rollup Example',
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
  },
]
```

## Options

| Name | Required | Type | Description |
| --- | --- | --- | --- |
| blockParser | no | BlockParser | Give a custom BlockParser instance to change the block parsing. |
| renderer | no | Renderer | Instance of renderer. Per default a instance of `@ui-doc/html-renderer` will be created. |
| source | yes | string[] | List of glob patterns to find source files. Please see [picomatch](https://github.com/micromatch/picomatch) how to define patterns. |
| outputDir | no | string | Change output directory to create the UI-Doc in a subfolder of your application. |
| templatePath | no | string | When using the default renderer you can override default templates from the renderer or add custom templates for generation. |
| output | no | object | Change output settings |
| output.dir | no | string | path where you wan't to put the ui-doc. Will be relativ to rollup's output dir |
| output.baseUri | no | string | Change the base URI of you UI-Kit useful if you wan't to place the UI-Doc somewhere else then the output folder. If `output.dir` is given and no `output.baseUri` the dir will be used. You can give '.' so all URLs will be relative. |
| settings | no | object | UI-Doc specific settings. |
| settings.generate | no | object | UI-Doc core generate setting |
| settings.texts | no | object | UI-Doc core texts setting |
| assets | no | object | Change asset usage |
| assets.static | no | string | ive a static assets folder (path relativ to your working directory), files and sub folders will be copied to the UI-Doc output dir. |
| assets.styleAsset | no | false / string | With false prevent including the UI-Doc style. With string change the included style name. |
| assets.highlightStyle | no | false / string | With false prevent including highlight.js style. With string change name of included style. |
| assets.highlightTheme | no | string | Change highlight.js style theme (default is `default`). Please look into the [highlight.js repository](https://github.com/highlightjs/highlight.js/tree/main/src/styles) to see available themes. |
| assets.highlightScript | no | false / string | With false prevent including highlight.js. With string change name of included script. |
| assets.page | no | AssetOption[] | Include custom scripts and styles for UI-Doc pages |
| assets.example | no | AssetOption[] | Include custom scripts and styles for UI-Doc examples |

```ts
export interface AssetOption {
  name: string | (() => string) // name or relative file name of the asset
  fromInput?: boolean | ((asset: AssetResolved) => boolean) // try to get asset information from rollup's input option. Eg. if you configure the input as object you can give the asset key as name and UI-Doc will try to resolve the asset file for you
  file?: string | (() => string) // load asset from file
  dependency?: string | (() => string) // load the asset from dependency
  source?: string | Uint8Array | (() => string) // give the asset source directly
  attrs?: Record<string, string> // give asset html attributes that should be rendered into the output
}
```

# Upcoming Features

# Known Issues

- When creating assets over rollup input exclusive for UI-Doc the asset will be generated first to roleup's output directory and then be copied to the UI-Doc output.
