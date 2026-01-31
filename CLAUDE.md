# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UI-Doc is a TypeScript monorepo that generates interactive UI documentation from JSDoc-style comment blocks. It parses doc blocks from source files (CSS, JS, TS) and renders them as live component documentation with examples.

## Folder Structure

```text
packages/           # Publishable npm packages (@ui-doc/*)
  ├── core/         # Parsing engine and context generation
  ├── node/         # File system operations for Node.js
  ├── html-renderer/# HTML template rendering
  ├── rollup/       # Rollup plugin integration
  └── vite/         # Vite plugin (wraps rollup)
demos/              # Example configurations (Vite, Rollup, Node scripts)
docs/               # Consumer documentation
```

## Commands

### Build & Test

```bash
pnpm workspace:build              # Build all packages
pnpm workspace:test               # Run all package tests
pnpm --filter @ui-doc/core test   # Run tests for a specific package
pnpm typecheck                    # Type check all packages
```

### Linting & Formatting

```bash
pnpm lint                     # Run all linters (docs, js, css)
pnpm fix                      # Run all auto-fixes (docs, js, css)
pnpm fix:js                   # Fix JS/TS lint issues only
pnpm fix:css                  # Fix CSS lint issues only
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

## Testing

Tests are in `packages/*/tests/` directories using Vitest. Test files match pattern `*.test.ts` or `*.spec.ts`.

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Use the `/commit` skill for generating properly formatted commit messages.

Valid scopes: `core`, `node`, `html-renderer`, `rollup`, `vite`, `demos`, `release`. Use `docs:` type for `docs/` changes.

## Claude Code Tools

This project includes custom Claude Code configurations in `.claude/`:

### Reference Skills

Loaded automatically when relevant:

- `vitest-guide` - Vitest patterns and UI-Doc testing conventions
- `documentation-guide` - Consumer documentation templates and style

### Subagents

Specialized agents for complex tasks:

- `test-spec` - Analyzes source code and generates structured test specifications
- `test-writer` - Writes Vitest tests from specifications (uses `vitest-guide` skill)
- `document-writer` - Creates consumer documentation from templates (uses `documentation-guide` skill)
- `js-review-expert` - Reviews JS/TS code for best practices, readability, and maintainability
