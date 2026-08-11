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
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/*.d.ts', '**/dist/**', '**/tests/**', '**/scripts/**'],
    },
  },
})
