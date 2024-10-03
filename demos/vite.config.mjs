import path from 'node:path'

import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  return {
    build: {
      outDir: 'dist/vite',
      rollupOptions: {
        input: {
          app: 'js/app-vite.js',
          'ui-doc-custom': 'ui-doc/vite.css',
        },
      },
    },

    resolve: {
      alias: {
        '@assets': path.resolve(__dirname, 'assets'),
        '@css': path.resolve(__dirname, 'css'),
        '@js': path.resolve(__dirname, 'js'),
      },
    },

    plugins: [
      uidoc({
        output: {
          baseUri: command === 'serve' ? undefined : '.',
        },
        source: ['css/**/*.css'],
        templatePath: 'ui-doc/templates',
        assets: {
          static: './ui-doc/assets',
          page: [
            {
              name: 'ui-doc-custom',
              fromInput: true,
            },
          ],
          example: [
            {
              name: 'app',
              fromInput: true,
              attrs: {
                type: 'module',
              },
            },
          ],
        },
      }),
    ],
  }
})
