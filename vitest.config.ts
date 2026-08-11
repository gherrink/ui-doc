import { defineConfig } from 'vitest/config'

// Each packages/*/vitest.config.mjs is a thin call to the shared factory in
// shared/vitest.config.mjs, so `vitest run` here and `pnpm --filter <pkg> test`
// from a package directory load the same settings and cannot drift.
export default defineConfig({
  test: {
    projects: ['packages/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // packages/*/scripts/** is the browser bundle shipped as
      // @ui-doc/html-renderer/ui-doc.js. It lives outside src/ because it is
      // built by a separate tsconfig, but it is published code and is covered
      // by tests/scripts/, so it belongs in the report.
      include: ['packages/*/src/**/*.ts', 'packages/*/scripts/**/*.ts'],
      exclude: ['**/*.d.ts', '**/dist/**', '**/tests/**'],
    },
  },
})
