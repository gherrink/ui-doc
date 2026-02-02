import path from 'node:path'

import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  root: import.meta.dirname,
  build: {
    outDir: '../dist/showcase-multi-source',
    rollupOptions: {
      input: {
        components: path.join(import.meta.dirname, 'src/components.css'),
      },
    },
  },
  plugins: [
    uidoc({
      output: {
        baseUri: '.',
      },
      source: [
        path.join(import.meta.dirname, 'src/**/*.css'),
        path.join(import.meta.dirname, 'src/**/*.js'),
      ],
      assets: {
        example: [
          {
            name: 'components',
            fromInput: true,
          },
        ],
      },
    }),
  ],
})
