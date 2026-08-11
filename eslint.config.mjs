import antfu from '@antfu/eslint-config'

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Rule Sets
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Type-aware rules that require TypeScript project configuration.
 * These are disabled for config files, demos, and markdown code blocks
 * where type information is not available.
 */
const typeAwareRulesOff = {
  'ts/await-thenable': 'off',
  'ts/explicit-function-return-type': 'off',
  'ts/no-floating-promises': 'off',
  'ts/no-misused-promises': 'off',
  'ts/no-unsafe-argument': 'off',
  'ts/no-unsafe-assignment': 'off',
  'ts/no-unsafe-call': 'off',
  'ts/no-unsafe-member-access': 'off',
  'ts/no-unsafe-return': 'off',
  'ts/restrict-template-expressions': 'off',
  'ts/strict-boolean-expressions': 'off',
  'ts/switch-exhaustiveness-check': 'off',
  'ts/unbound-method': 'off',
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Configuration
// ─────────────────────────────────────────────────────────────────────────────

export default antfu({
  type: 'lib',
  typescript: {
    tsconfigPath: './tsconfig.eslint.json',
    parserOptions: {
      projectService: false,
      project: './tsconfig.eslint.json',
    },
  },
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,
  },
  jsonc: true,
  yaml: true,
  markdown: true,
  // antfu's config defaults to gitignore: true, which already covers
  // node_modules, dist, .worktree and TODOs*.md. coverage/ is not gitignored.
  ignores: [
    '**/coverage/**',
  ],
},

// ─────────────────────────────────────────────────────────────────────────────
// JS/TS Rules
// ─────────────────────────────────────────────────────────────────────────────
{
  files: ['**/*.{js,ts,mjs,cjs,jsx,tsx}'],
  rules: {
    // ── Code Style ───────────────────────────────────────────────────────────
    'curly': ['error', 'all'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'style/arrow-parens': ['error', 'as-needed'],
    'style/brace-style': ['error', '1tbs'],
    'style/comma-dangle': ['error', 'always-multiline'],
    'style/max-len': ['error', {
      code: 100,
      ignoreComments: true,
      ignoreStrings: true,
      ignoreUrls: true,
    }],

    // ── TypeScript Strict Safety ─────────────────────────────────────────────
    'ts/no-explicit-any': 'error',
    'ts/no-unsafe-argument': 'error',
    'ts/no-unsafe-assignment': 'error',
    'ts/no-unsafe-call': 'error',
    'ts/no-unsafe-function-type': 'error',
    'ts/no-unsafe-member-access': 'error',
    'ts/no-unsafe-return': 'error',
    'ts/restrict-template-expressions': ['error', { allowNumber: true }],
    'ts/strict-boolean-expressions': 'error',

    // ── TypeScript Best Practices ────────────────────────────────────────────
    'ts/ban-ts-comment': ['error', {
      'minimumDescriptionLength': 10,
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': true,
    }],
    'ts/explicit-function-return-type': ['error', { allowExpressions: true }],
    'ts/method-signature-style': ['error', 'property'],
    'ts/switch-exhaustiveness-check': 'error',
    'ts/unbound-method': ['error', { ignoreStatic: true }],

    // ── Async/Promise Rules ──────────────────────────────────────────────────
    'ts/await-thenable': 'error',
    'ts/no-floating-promises': ['error', { ignoreIIFE: true, ignoreVoid: true }],
    'ts/no-misused-promises': ['error', { checksConditionals: true }],

    // ── Plugin Rules ─────────────────────────────────────────────────────────
    'jsdoc/check-param-names': 'error',
    'jsdoc/require-returns-description': 'error',
    'node/prefer-global/process': 'error',
    'regexp/no-super-linear-backtracking': 'error',
    'regexp/no-unused-capturing-group': 'error',
    'unicorn/error-message': 'error',
    'unused-imports/no-unused-vars': ['error', {
      args: 'after-used',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      vars: 'all',
      varsIgnorePattern: '^_',
    }],
  },
},

// ─────────────────────────────────────────────────────────────────────────────
// Config Files - Disable Type-Aware Rules
// ─────────────────────────────────────────────────────────────────────────────
{
  files: [
    '*.cjs',
    '*.js',
    '*.mjs',
    '.*.cjs',
    '.*.js',
    '.*.mjs',
    '.claude/**/*.{js,mjs,cjs}',
    '**/*.config.cjs',
    '**/*.config.js',
    '**/*.config.mjs',
    'demos/**/*.{js,mjs,cjs,ts}',
    'shared/**/*.mjs',
  ],
  rules: typeAwareRulesOff,
},

// ─────────────────────────────────────────────────────────────────────────────
// Test Files - Relax Unsafe Rules
// ─────────────────────────────────────────────────────────────────────────────
{
  files: ['**/*.test.ts', '**/*.spec.ts'],
  rules: {
    // Allow unsafe assignment for test matchers (expect.objectContaining returns any)
    'ts/no-unsafe-assignment': 'off',
  },
},

// ─────────────────────────────────────────────────────────────────────────────
// Markdown Code Blocks - Disable Type-Aware Parsing
// ─────────────────────────────────────────────────────────────────────────────
{
  files: ['**/*.md/**/*.{js,ts,jsx,tsx}'],
  languageOptions: {
    parserOptions: {
      project: null,
      projectService: false,
    },
  },
  rules: {
    ...typeAwareRulesOff,
    'no-console': 'off',
    'no-new': 'off',
    'style/max-len': 'off',
    'ts/no-unnecessary-type-assertion': 'off',
    'ts/prefer-nullish-coalescing': 'off',
    'ts/restrict-plus-operands': 'off',
    'unused-imports/no-unused-vars': 'off',
  },
},

// ─────────────────────────────────────────────────────────────────────────────
// Markdown Files
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// YAML Files
// ─────────────────────────────────────────────────────────────────────────────
{
  files: ['**/*.{yml,yaml}'],
  rules: {
    'style/max-len': ['error', { code: 500 }],
  },
})
