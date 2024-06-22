import styleguide from '@styleguide/vite'
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
    styleguide({
      source: ['css/**/*.css'],
    }),
  ],
})
