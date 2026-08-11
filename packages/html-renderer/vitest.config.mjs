import { configTest } from '../../shared/vitest.config.mjs'

// The suites under tests/scripts/ cover scripts/, which runs in the browser, so
// they need a DOM. They opt in individually with a `// @vitest-environment jsdom`
// docblock rather than switching this project over, because everything else in
// this package tests the Node-side renderer and would only pay jsdom's ~300ms
// per-file setup for nothing.
//
// jsdom over happy-dom: happy-dom ignores the complex selector arguments in
// `:not(...)`, which is exactly what expand.ts uses to decide which elements
// regain `tabindex="0"`, and it reports an empty string for a computed
// `animation-name` where a browser reports `none`. Under happy-dom those tests
// would pin behaviour the browser does not have. jsdom implements neither
// IntersectionObserver nor ResizeObserver; tests/scripts/support/observers.ts
// supplies both, which the suites need to be able to drive by hand anyway.
export default configTest({ name: '@ui-doc/html-renderer' })
