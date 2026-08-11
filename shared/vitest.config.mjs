import { defineProject } from 'vitest/config'

/**
 * Create the standard Vitest project config for a workspace package.
 * @param {object} options Configuration options
 * @param {string} options.name Project name, matching the package name
 * @returns {import('vitest/config').UserProjectConfigExport} Vitest project config
 */
export function configTest({ name }) {
  return defineProject({
    test: {
      name,
      environment: 'node',
      include: ['tests/**/*.{test,spec}.ts'],
      // Vitest 4 shrank the default exclude list to node_modules and .git only.
      exclude: ['**/node_modules/**', '**/dist/**'],
      // Vitest 4 narrowed restoreAllMocks() to vi.spyOn spies, so it no longer
      // clears call history on vi.mock() automocks. Several suites relied on
      // the old behaviour; clearing between tests restores it for every package
      // at once rather than per test file.
      //
      // Deliberately NOT restoreMocks: restoring breaks module-level vi.mock()
      // factories, as packages/rollup/tests/option.test.ts already documents.
      clearMocks: true,
    },
  })
}
