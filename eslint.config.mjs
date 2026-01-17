import antfu from '@antfu/eslint-config'

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
  ignores: [
    '**/dist/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/perf/**',
    '**/tmp/**',
    '**/_tmp/**',
    '**/cache/**',
  ],
},
// JS/TS rules (max line 100 per .editorconfig)
{
  files: ['**/*.{js,ts,mjs,cjs,jsx,tsx}'],
  rules: {
    'style/arrow-parens': ['error', 'as-needed'],
    'style/brace-style': ['error', '1tbs'],
    'style/comma-dangle': ['error', 'always-multiline'],
    'style/max-len': 'off',
    'curly': ['error', 'all'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Disable stricter TypeScript rules to match previous config
    'ts/no-explicit-any': 'off',
    'ts/explicit-function-return-type': 'off',
    'ts/strict-boolean-expressions': 'off',
    'ts/no-unsafe-argument': 'off',
    'ts/no-unsafe-assignment': 'off',
    'ts/no-unsafe-call': 'off',
    'ts/no-unsafe-member-access': 'off',
    'ts/no-unsafe-return': 'off',
    'ts/no-unsafe-function-type': 'off',
    'ts/method-signature-style': 'off',
    'ts/ban-ts-comment': 'off',
    'ts/switch-exhaustiveness-check': 'off',
    'ts/unbound-method': 'off',
    'ts/no-misused-promises': 'off',
    'ts/restrict-template-expressions': 'off',
    'ts/no-floating-promises': 'off',
    'ts/await-thenable': 'off',

    // Disable node rules
    'node/prefer-global/process': 'off',

    // Disable import rules not available
    'import/no-relative-packages': 'off',

    // Disable stricter regexp rules
    'regexp/no-unused-capturing-group': 'off',
    'regexp/no-super-linear-backtracking': 'off',

    // Disable jsdoc rules
    'jsdoc/check-param-names': 'off',
    'jsdoc/require-returns-description': 'off',

    // Disable unicorn rules
    'unicorn/error-message': 'off',

    // Allow unused catch block variables
    'unused-imports/no-unused-vars': ['error', {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_',
      caughtErrors: 'none',
    }],
  },
},
// Markdown code blocks - disable type-aware parsing
{
  files: ['**/*.md/**/*.{js,ts,jsx,tsx}'],
  languageOptions: {
    parserOptions: {
      project: null,
      projectService: false,
    },
  },
  rules: {
    'ts/await-thenable': 'off',
    'ts/no-floating-promises': 'off',
    'ts/no-misused-promises': 'off',
    'ts/no-unnecessary-type-assertion': 'off',
    'ts/no-unsafe-argument': 'off',
    'ts/no-unsafe-assignment': 'off',
    'ts/no-unsafe-call': 'off',
    'ts/no-unsafe-member-access': 'off',
    'ts/no-unsafe-return': 'off',
    'ts/restrict-plus-operands': 'off',
    'ts/restrict-template-expressions': 'off',
    'ts/unbound-method': 'off',
    'ts/prefer-nullish-coalescing': 'off',
    'style/max-len': 'off',
  },
},
// Markdown rules (max line 170 per .editorconfig)
{
  files: ['**/*.md'],
  rules: {
    'style/max-len': 'off', // Handled by markdownlint
  },
},
// YAML rules (max line 500 per .editorconfig)
{
  files: ['**/*.{yml,yaml}'],
  rules: {
    'style/max-len': ['error', { code: 500 }],
  },
})
