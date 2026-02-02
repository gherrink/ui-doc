import path from 'node:path'

import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  root: import.meta.dirname,
  build: {
    outDir: '../dist/showcase-templates',
    rollupOptions: {
      input: {
        styles: path.join(import.meta.dirname, 'src/styles.css'),
      },
    },
  },
  plugins: [
    uidoc({
      output: {
        baseUri: '.',
      },
      source: [path.join(import.meta.dirname, 'src/**/*.css')],
      templatePath: path.join(import.meta.dirname, 'templates'),
      assets: {
        example: [
          {
            name: 'styles',
            fromInput: true,
          },
        ],
      },
    }),
  ],
})
