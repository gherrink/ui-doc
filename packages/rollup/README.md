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
      }),
    ],
  },
]
```

## Options

| Name | Required | Type | Description |
| --- | --- | --- | --- |
| blockParser | no | BlockParser | Give a custom BlockParser instance to change the block parsing. |
| highlightScript | no | false / string | With false prevent including highlight.js. With string change name of included script. |
| highlightStyle | no | false / string | With false prevent including highlight.js style. With string change name of included style. |
| highlightTheme | no | string | Change highlight.js style theme (default is `default`). |
| renderer | no | Renderer | Instance of renderer. Per default a instance of `@ui-doc/html-renderer` will be created. |
| settings | no | object | UI-Doc specific settings (generate and text). |
| source | yes | string[] | List of glob patterns to find source files. Please see [picomatch](https://github.com/micromatch/picomatch) how to define patterns. |
| styleAsset | no | false / string | With false prevent including the UI-Doc style. With string change the included style name. |
| outputDir | no | string | Change output directory to create the UI-Doc in a subfolder of your application. |
| templatePath | no | string | When using the default renderer you can change the path were to find the templates for generating. |
