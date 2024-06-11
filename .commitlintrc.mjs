export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['core', 'html-renderer', 'node', 'rollup', 'demos']],
  }
}
