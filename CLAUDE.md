# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UI-Doc is a TypeScript monorepo that generates interactive UI documentation from JSDoc-style comment blocks. It parses doc blocks from source files (CSS, JS, TS) and renders them as live component documentation with examples.

## Commands

### Build & Test

```bash
pnpm workspace:build          # Build all packages
pnpm workspace:test           # Run all package tests
pnpm --filter @ui-doc/core test  # Run tests for a specific package
```

### Linting & Formatting

```bash
pnpm lint                     # Run all linters (docs, json, package, js, css)
pnpm fix:js                   # Fix JS/TS lint issues
pnpm fix:css                  # Fix CSS lint issues
pnpm prettier                 # Format all files
```

### Release

```bash
pnpm release:dry              # Dry-run release (lint, test, version check)
pnpm release                  # Full release with publishing
```

## Architecture

### Package Dependency Flow

```text
@ui-doc/core                    # Parse doc blocks → context objects
    ↓
@ui-doc/node                    # File system operations (depends on core)
    ↓
@ui-doc/html-renderer           # Render context → HTML (depends on core)
    ↓
@ui-doc/rollup                  # Rollup plugin (depends on core + node)
    ↓
@ui-doc/vite                    # Vite plugin (wraps rollup)
```

### Processing Pipeline

1. **Core** parses JSDoc comment blocks from source text using `CommentBlockParser`
2. Blocks are transformed into UI-Doc context objects via tag transformers
3. **Node** handles file discovery and reading via glob patterns
4. **HTML Renderer** converts context to HTML pages with styling
5. Build plugins (**Rollup/Vite**) integrate the pipeline and output documentation

### Key Abstractions

- `UIDoc` (core): Main class orchestrating parsing and output
- `CommentBlockParser` (core): Extracts and parses comment blocks, supports custom tag transformers
- `Renderer` interface (core): Contract for output rendering
- `HTMLRenderer` (html-renderer): Default renderer implementation

## Commit Convention

Uses conventional commits with required scopes:

- `release`, `core`, `html-renderer`, `node`, `rollup`, `vite`, `demos`

Example: `feat(core): add new tag transformer`

## Testing

Tests are in `packages/*/tests/` directories using Jest with ts-jest. Test files match pattern `*.test.ts` or `*.spec.ts`.
