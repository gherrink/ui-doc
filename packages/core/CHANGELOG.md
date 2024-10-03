# @ui-doc/core ChangeLog

## v0.3.1

_2024-10-03_

### Bugfixes

- core,html-renderer,node,rollup,vite: version is always one number behind (852e7d4)
- core: titleLevel is starting with 3 instead of 2 (4062276)

### Updates

- core: tag result images (99060a4)
- core: types closer to into project (01c4411)

## v0.3.0

_2024-09-20_

### Bugfixes

- core: delete of required but not defined parent context entries (3a56bf7)
- core: resetting of deleted entries (c56a076)

### Features

- core,node: filesystem path resolving (9796ba8)

### Updates

- core: fix resetting of parent entries (d2c688a)
- core: `resolveUrl` generate function into generalized `resolve` (0634f9e)

## v0.2.0

_2024-09-09_

### Bugfixes

- core: css parse error handling (6b5c30c)

### Features

- core,html-renderer: icon tag (5941543)
- core,html-renderer: possibility to add css variables over tags (019400a)
- core,rollup,vite: block parser errors handling and displaying (5ef35ea)
- core: more detailed tag transformer error (0310e9a)
- core,html-renderer: space tag (6e5bece)
- core,html-renderer: color tag (7a65218)
- core: color utilities (2868145)
- core,html-renderer: simplified url generation and usage (6049267)

### Updates

- core: block parser error handling (450c0b1)

## v0.1.0

_2024-07-19_

### Bugfixes

- core: pages where not removed from context when entries where (d3b9a42)
- core: context title generation (ab343b4)

### Features

- core,vite: simplified event names (9b81692)
- core: menu order depend on user input (47b62a9)
- core: possibility to replace generate function (1be6f9b)
- core,html-renderer,rollup: central url resolving (9498cae)
- core: improved page/example storing and accessing (344893e)
- core,html-renderer,rollup: variable asset generation (d49311f)
- core: more listeners and generators (3c34fb6)
- core: regex based html validation for example tags (26d0eb2)
- core: option for generate and texts (8cd016d)
- core: create index page (027eb99)
- core,html-renderer: improved error stack trace (56ee0ee)
- core,html-renderer: footer text (817ac70)
- core: improved error generation (971ebfe)
- core,rollup,node: asynchrone file loading (6c63bf3)
- core: source update and delete functionality (9678254)
- core: titleLevel generation (e253e4d)
- core: description parsing with markdown (ffff596)
- core: styleguide event emitting and listening to block parser (ba2f018)
- core: block parser event emitting (c0fe4aa)
- core: adds title to example tag from block if not set (c10133c)
- core: functionality to parse source into context (716845d)
- core: simplifies block key generation (e5091da)
- core: basic implementation for finding and parsing files (03be55c)
- core: adds order tag (8aee153)
- core: update BlockParser to handle empty blocks and report errors (dd78083)
- core: basic structure with tag transformers (c261050)

### Updates

- core: init (13b7ced)
- core: rename comment BlockParser to CommentBlockParser (9c2ea73)
- core: add missing interface functions (34f3b3a)
- core: fix parser error testing (ac61d51)
- core: types into files (5f183d7)
- core: simplified the api (a7f7b52)
- core,node: refactors file dependencies into separate node package (c52e603)
