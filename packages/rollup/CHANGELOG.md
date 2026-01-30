# @ui-doc/rollup ChangeLog

## v0.3.2

_2026-01-30_

### Bugfixes

- rollup,vite: enable CJS/ESM interop for dynamic imports (1cdf4de)
- core,html-renderer,node,rollup,vite,demos: resolve TypeScript type errors in test files (f6fb947)
- core,html-renderer,rollup,vite: resolve type errors across all packages (94eea25)
- core,html-renderer,node,rollup,vite: replace tsconfig symlinks with real files (52b7031)

### Updates

- rollup: add test script (b8248c1)
- core,html-renderer,node,rollup,vite: expand test coverage across all packages (a19bdc5)
- core,html-renderer,node,rollup,vite: improve README documentation across all packages (0bd44bb)
- core,node,html-renderer,rollup,vite: improve package scripts (ae91411)
- rollup: improve type safety and code quality (e26fd37)

## v0.3.1

_2024-10-03_

### Bugfixes

- core,html-renderer,node,rollup,vite: version is always one number behind (852e7d4)
- html-renderer,rollup: when using option templatePath the resolved path contained undefined (91574a5)

### Updates

- rollup,vite: internal links (2ff349d)

## v0.3.0

_2024-09-20_

### Bugfixes

- rollup: watched files with error on startup (0dc8456)

### Features

- rollup: improved asset from input api (63fac07)
- rollup,vite: more customizable asset definition (344f577)

### Updates

- rollup: changed asset copy message (b5e6d6b)

## v0.2.1

_2024-09-09_

### Bugfixes

- node,rollup,vite: package dependency declaration (330c74b)

## v0.2.0

_2024-09-09_

### Bugfixes

- rollup: asset url generation (c2dffe8)

### Features

- core,rollup,vite: block parser errors handling and displaying (5ef35ea)
- rollup,vite: `customStyle` setting (34ab09e)
- rollup: static assets integration (86942b3)

## v0.1.1

_2024-07-19_

### Bugfixes

- html-renderer,node,rollup,vite,demos: workspace dependencies (6961c13)

## v0.1.0

_2024-07-19_

### Bugfixes

- rollup: changed invalid highlightTheme option type (9bf229f)
- rollup: missing styleguide js output (b3f566d)

### Features

- rollup: asset loading/resolving changed (e1c0992)
- rollup: plugin api function for styleguide asset (dbc8091)
- core,html-renderer,rollup: central url resolving (9498cae)
- rollup: improved asset file detection and copy to styleguide output (eedfe50)
- core,html-renderer,rollup: variable asset generation (d49311f)
- rollup: plugin api and output dir option (0242041)
- rollup: styleguide options changeable by user (a22f6f9)
- rollup: passe options to styleguide instance (e815e3c)
- rollup: generation information output (dec6595)
- rollup: style asset include depend on option (2f133a4)
- core,rollup,node: asynchrone file loading (6c63bf3)
- rollup,demos: implemented integration (d849cb9)
- rollup: init (13369ab)

### Updates

- rollup: init (3eba11c)
- rollup: styleguide instance creation moved (0baa21c)
- rollup: removed unnecessary dependencies (cdba183)
- rollup: variable plugin version depending on package.json (264b280)
- rollup,html-renderer,node: watch command (34b444c)
