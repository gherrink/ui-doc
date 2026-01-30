# @ui-doc/vite ChangeLog

## v0.3.2

_2026-01-30_

### Bugfixes

- rollup,vite: enable CJS/ESM interop for dynamic imports (1cdf4de)
- core,html-renderer,node,rollup,vite,demos: resolve TypeScript type errors in test files (f6fb947)
- core,html-renderer,rollup,vite: resolve type errors across all packages (94eea25)
- core,html-renderer,node,rollup,vite: replace tsconfig symlinks with real files (52b7031)

### Updates

- core,html-renderer,node,rollup,vite: expand test coverage across all packages (a19bdc5)
- core,html-renderer,node,rollup,vite: improve README documentation across all packages (0bd44bb)
- core,node,html-renderer,rollup,vite: improve package scripts (ae91411)
- vite: improve type safety and code quality (78d8b9a)

## v0.3.1

_2024-10-03_

### Bugfixes

- vite: missing example stylesheets on build when using import in script (55a011c)
- core,html-renderer,node,rollup,vite: version is always one number behind (852e7d4)

### Updates

- rollup,vite: internal links (2ff349d)

## v0.3.0

_2024-09-20_

### Features

- vite: include imported assets and css when using asset from input (1b4530f)
- rollup,vite: more customizable asset definition (344f577)

## v0.2.1

_2024-09-09_

### Bugfixes

- node,rollup,vite: package dependency declaration (330c74b)

## v0.2.0

_2024-09-09_

### Bugfixes

- vite: static asset files with params are not loaded (596e1df)

### Features

- core,rollup,vite: block parser errors handling and displaying (5ef35ea)
- rollup,vite: `customStyle` setting (34ab09e)
- vite: better error reporting on plugin create (944a4c6)
- vite: serve static asset files (7faae6c)

## v0.1.1

_2024-07-19_

### Bugfixes

- html-renderer,node,rollup,vite,demos: workspace dependencies (6961c13)

## v0.1.0

_2024-07-19_

### Features

- core,vite: simplified event names (9b81692)
- vite: reload pages on styleguide changes (53ccf4d)
- vite: local url output (474d62c)
- vite: dev server endpoint for styleguide (3d56dee)
- vite,demos: vite init (7c96809)

### Updates

- vite: init (d2ce45f)
- vite: styleguide context event listener into listening event from server (72bd47a)
