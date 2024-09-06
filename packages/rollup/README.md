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
| staticAssets | no | string | Give a static assets folder (path relativ to your working directory), files and sub folders will be copied to the ui-doc output folder |
| outputBaseUri | no | string | Change the base uri if not provided and the `outputDir` is given the `outputDir` will be used as base uri. You can give `.` so relative urls will be used. |
| customStyle | no | string | Register custom ui-doc style where you can add or manipulate ui-doc styles. The file will be pulled out of the current build process. |

# Upcoming Features

[] Better way of registering/changing style/script assets [] Register additional custom assets from previews build steps or npm dependencies

# Known Issues

- `customStyle` setting is not always able to detect the style.
- When using `customStyle` and `outputDir` setting the plugin is not able to change the output for the used style. Instead the custom style will be generated and then copied into the ui-doc outputDir.
