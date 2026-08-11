/** @type {import('stylelint').Config} */
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-clean-order',
  ],
  // The lint:css globs ('packages/**/*.css', 'demos/**/*.css') match built
  // output too, so these exclusions are load-bearing - without them stylelint
  // lints dist/assets/ui-doc.min.css.
  ignoreFiles: [
    '**/dist/**',
    '**/node_modules/**',
  ],
  rules: {
    'at-rule-no-unknown': [true, { ignoreAtRules: ['extend'] }],
  },
}
