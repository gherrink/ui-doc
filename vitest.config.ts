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
      //
      // Do not be alarmed that no scripts/ rows appear in the text table: the
      // reporter only prints files with at least one metric below 100%, and
      // those are fully covered. They are counted - dropping them from
      // `include` lowers the totals by exactly their own 141 statements, 83
      // branches, 37 functions and 140 lines. Use the html or lcov report to
      // see them listed.
      include: ['packages/*/src/**/*.ts', 'packages/*/scripts/**/*.ts'],
      exclude: ['**/*.d.ts', '**/dist/**', '**/tests/**'],
    },
  },
})
