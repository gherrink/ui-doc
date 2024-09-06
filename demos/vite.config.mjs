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
        customStyle: command === 'serve' ? 'css/ui-doc.css' : 'ui-doc-custom.css',
        outputBaseUri: command === 'serve' ? undefined : '.',
        source: ['css/**/*.css'],
        staticAssets: './assets',
      }),
    ],
  }
})
