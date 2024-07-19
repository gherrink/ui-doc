import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/vite',
    rollupOptions: {
      input: {
        app: 'css/index.css',
      },
    },
  },

  plugins: [
    uidoc({
      source: ['css/**/*.css'],
    }),
  ],
})
