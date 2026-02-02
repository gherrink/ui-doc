import path from 'node:path'

import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  root: import.meta.dirname,
  build: {
    outDir: '../dist/showcase-variations',
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
      source: [path.join(import.meta.dirname, 'src/**/*.css')],
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
