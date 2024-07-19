export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['release', 'core', 'html-renderer', 'node', 'rollup', 'vite', 'demos']],
  }
}
