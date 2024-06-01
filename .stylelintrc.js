/** @type {import('stylelint').Config} */
module.exports = {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-clean-order",
    "stylelint-prettier/recommended",
  ],
  "plugins": ["stylelint-prettier"],
  rules: {
    'at-rule-no-unknown': [true, {
      ignoreAtRules: [ 'extend' ],
    }],
  }
}
