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
        output: {
          baseUri: command === 'serve' ? undefined : '.',
        },
        source: ['css/**/*.css'],
        assets: {
          static: './assets',
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
            },
          ],
        },
      }),
    ],
  }
})
