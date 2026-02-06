import path from 'node:path'

import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

const sharedDir = path.resolve(import.meta.dirname, '../shared')

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    root: import.meta.dirname,
    build: {
      outDir: '../dist/vite',
      rollupOptions: {
        input: {
          app: path.resolve(import.meta.dirname, 'app.js'),
        },
      },
    },

    resolve: {
      alias: {
        '@shared': sharedDir,
      },
    },

    plugins: [
      uidoc({
        output: {
          baseUri: isDev ? undefined : '.',
        },
        source: [path.join(sharedDir, 'css/**/*.css')],
        templatePath: path.join(sharedDir, 'ui-doc/templates'),
        assets: {
          static: path.join(sharedDir, 'ui-doc/assets'),
          example: isDev
            ? [
                {
                  name: 'app.js',
                  file: path.resolve(import.meta.dirname, 'app.js'),
                  attrs: { type: 'module' },
                },
              ]
            : [
                {
                  name: 'app',
                  fromInput: true,
                  attrs: { type: 'module' },
                },
              ],
        },
      }),
    ],
  }
})
