# Contributing to UI-Doc

Thank you for your interest in contributing to UI-Doc. This guide will help you get started with the development workflow.

Before contributing, please check the [issue tracker](https://github.com/gherrink/ui-doc/issues) to see if your idea or bug has already been discussed. For significant changes, please open an issue first to discuss your approach. Small fixes and typo corrections can go directly to a pull request.

## Development Environment

### Prerequisites

- [mise](https://mise.jdx.dev/getting-started.html), which manages the toolchain for this repository

The toolchain is pinned in `mise.toml` (Node 24, pnpm 11); TypeScript is 7.x. The exact pnpm version
lives in the `packageManager` field of `package.json`; pnpm self-manages to it.

If you would rather not use mise, install Node 24 and pnpm 11 yourself.

### Setup

```bash
# Clone the repository
git clone https://github.com/gherrink/ui-doc.git
cd ui-doc

# Install the pinned toolchain
mise trust && mise install

# Install dependencies
pnpm install

# Build all packages
pnpm workspace:build
```

The project uses Husky for pre-commit hooks that automatically lint and format your code.
They run lint-staged and commitlint from your local `node_modules`, so no network
access is needed.

## Development Workflow

### Package Structure

UI-Doc is a TypeScript monorepo with packages in the `packages/` directory:

```text
@ui-doc/core           → Parsing engine and context generation
    ↓
@ui-doc/node           → File system operations for Node.js
    ↓
@ui-doc/html-renderer  → HTML template rendering
    ↓
@ui-doc/rollup         → Rollup plugin integration
    ↓
@ui-doc/vite           → Vite plugin (wraps rollup)
```

### Common Commands

| Command                           | Description                      |
| --------------------------------- | -------------------------------- |
| `pnpm workspace:build`            | Build all packages               |
| `pnpm test`                       | Run all package tests            |
| `pnpm --filter @ui-doc/core test` | Run tests for a specific package |
| `pnpm lint`                       | Run all linters and format check |
| `pnpm fix`                        | Run all auto-fixes               |
| `pnpm typecheck`                  | Type check all packages          |

### Running the Demo

```bash
pnpm --filter ui-doc-demos vite
```

This starts a Vite dev server with live preview at `http://localhost:5173/ui-doc`.

Other demo entry points: `rollup`, `node-cli`, and the `showcase:*` builds. See
`demos/package.json` for the full list.

## Code Standards

### TypeScript

- Strict mode enabled, no `any` types allowed
- Explicit return types for functions
- Use explicit types over inference for public APIs

### Style

- 2-space indentation
- Single quotes
- No semicolons
- 100 character max line length (code only; comments, strings, and URLs are exempt)

oxfmt formats automatically via pre-commit hooks, and `pnpm lint:format` checks
it. Prettier is not used in this repository.

### Linting

| Tool                           | Scope                                            |
| ------------------------------ | ------------------------------------------------ |
| `oxlint` (+ `oxlint-tsgolint`) | JS/TS, including type-aware rules                |
| `biome`                        | JSON and JSONC only — oxlint does not parse them |
| `stylelint`                    | CSS                                              |
| `markdownlint-cli2`            | Markdown prose                                   |
| `oxfmt`                        | Formatting for JS/TS, JSON, YAML and Markdown    |

Type-aware linting comes from `oxlint-tsgolint`, which carries its own
typescript-go build and does not use the repository's `typescript` package.

Two ESLint plugins are loaded through oxlint's `jsPlugins` bridge, because
oxlint has no `regexp` plugin and its built-in `jsdoc` plugin has no
`check-param-names`: `eslint-plugin-regexp`, and `eslint-plugin-jsdoc` under
the `jsdoc-js` alias to avoid colliding with the built-in. That bridge is alpha
and outside oxc's semver.

YAML, TOML, and code inside Markdown fences are formatted but no longer
_linted_. That is the deliberate cost of leaving ESLint; see the TypeScript
note below.

### CSS

Stylelint enforces consistent property ordering and standard conventions.

### Documentation

- Markdown files must pass Markdownlint
- Use JSDoc comments for public APIs

## Testing

Tests use [Vitest](https://vitest.dev/) and are located in `packages/*/tests/`. Test files should match the pattern `*.test.ts` or `*.spec.ts`.

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @ui-doc/core test

# Run tests in watch mode
pnpm --filter @ui-doc/core test -- --watch
```

Write tests for new features and bug fixes.

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```text
type(scope): description
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Scopes

- `core` - @ui-doc/core package
- `node` - @ui-doc/node package
- `html-renderer` - @ui-doc/html-renderer package
- `rollup` - @ui-doc/rollup package
- `vite` - @ui-doc/vite package
- `demos` - Demo applications
- `release` - Release-related changes

Use `docs:` type (no scope) for changes to the `docs/` directory.

### Examples

```text
feat(core): add custom tag transformer support
fix(html-renderer): resolve template caching issue
docs: add troubleshooting guide for Vite integration
refactor(rollup): simplify asset handling logic
test(node): add file discovery edge cases
```

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes and commit using conventional commits
4. Push to your fork: `git push origin feat/my-feature`
5. Open a pull request against `master`

### Pull Request Guidelines

- Keep changes focused on a single concern
- Include tests for new functionality
- Update documentation if behavior changes
- Ensure all checks pass (lint, test, typecheck)

CI runs automatically on pull requests. Releases are automated after merge to the main branch.

## Branching Model

UI-Doc uses a Modified GitHub Flow. The `master` branch always contains production-ready code, and merging to it triggers an automated release.

### Branch Naming

| Pattern               | Purpose        | Example                    |
| --------------------- | -------------- | -------------------------- |
| `feat/{description}`  | New features   | `feat/custom-transformers` |
| `fix/{description}`   | Bug fixes      | `fix/template-caching`     |
| `hotfix/{pkg}-{desc}` | Critical fixes | `hotfix/core-memory-leak`  |
| `chore/{description}` | Maintenance    | `chore/upgrade-deps`       |
| `docs/{description}`  | Documentation  | `docs/api-reference`       |

For package-specific work, include the package name: `fix/core-parser-edge-case`.

See the [Branching Model Guide](./docs/contributing/branching-model.md) for detailed workflows including hotfix procedures and cross-package changes.

## Release Process

Releases are fully automated via GitHub Actions. When code is merged to `master`:

1. Each package is analyzed for conventional commits since its last release
2. Versions are bumped based on commit types (fix → patch, feat → minor, breaking → major)
3. CHANGELOGs are generated and packages are published to npm

Packages are versioned independently—a `feat(core):` commit only releases `@ui-doc/core`, not downstream packages.

### Key Points

- Use proper commit scopes (`core`, `node`, `html-renderer`, `rollup`, `vite`) to trigger releases
- Commits without package scopes (`docs:`, `chore:`) don't trigger releases
- When making breaking changes, update workspace dependency constraints in the same PR

See the [Release Process Guide](./docs/contributing/release-process.md) for workspace dependency management, manual procedures, and troubleshooting.

## Dependency Notes

Things that are easy to trip over and hard to infer from the code.

### TypeScript 7 has no compiler API

TypeScript 7 is the native port and ships no JavaScript compiler API — its
`exports` map exposes only `lib/version.cjs` and a few `unstable/*` entries,
and `require('typescript')` yields an object with two keys. Anything that
drove the compiler programmatically had to go before the upgrade could happen:

- `@rollup/plugin-typescript` called `ts.createProgram`, `ts.createWatchProgram`
  and `ts.sys`. The build now transpiles with swc and emits declarations with a
  separate `tsc --emitDeclarationOnly` pass.
- `typescript-eslint` capped its peer at `<6.1.0` and declined to support
  TypeScript 7 until the API stabilises in 7.1. The linter is now `oxlint` with
  `oxlint-tsgolint`, which carries its own typescript-go build and never
  touches the compiler API.

Two consequences to keep in mind when editing tsconfigs:

- **`@types/*` is no longer auto-included.** `types: ["node"]` in
  `tsconfig.base.json` is load-bearing; without it four of the five packages
  stop resolving `console`, `node:fs/promises` and `node:path`. `typeRoots`
  does not substitute for it.
- **`moduleResolution: "node"` (node10) and `esModuleInterop: false` are
  removed**, reported as `error TS5108`.

### marked is ESM-only

`@ui-doc/core` depends on marked 18, which dropped its CommonJS build in v16.
`dist/index.cjs` therefore reaches it through Node's `require(esm)`, which
exists on exactly the Node versions in the package's `engines`. CI executes
that path on every build (the "Verify CommonJS entry" step) — keep it.
Consumers resolving `@ui-doc/core` through a strict CommonJS-only transform,
such as Jest's default, will not be able to load it.

### picomatch is bundled into @ui-doc/rollup

`configTs` derives Rollup's `external` list from `dependencies` plus
`peerDependencies`. picomatch is a _devDependency_ of `@ui-doc/rollup`, so it
is inlined into the published bundle, while `@ui-doc/node` declares it as a
dependency and keeps it external. That is deliberate — promoting it would flip
it from bundled to external and change the published contract — but it has two
consequences worth knowing:

- The bundled copy is invisible to a consumer's `pnpm audit`, and cannot be
  patched by a consumer's dependency update.
- Refreshing picomatch touches no file inside `packages/rollup/`, so the
  versioner will not cut a release for it. The new copy ships with whatever
  `feat`/`fix` lands there next.

### Reformatting and git blame

`.git-blame-ignore-revs` lists commits that only moved code. GitHub honours it
automatically; locally, run this once per clone:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## Project Structure

```text
packages/
├── core/           # Parsing engine (@ui-doc/core)
├── node/           # File system operations (@ui-doc/node)
├── html-renderer/  # HTML template rendering (@ui-doc/html-renderer)
├── rollup/         # Rollup plugin (@ui-doc/rollup)
└── vite/           # Vite plugin (@ui-doc/vite)

demos/              # Example configurations
docs/               # Consumer documentation
```

## Getting Help

- [Issue Tracker](https://github.com/gherrink/ui-doc/issues) - Report bugs or request features
- [Documentation](./docs) - Consumer guides and API reference

## License

By contributing to UI-Doc, you agree that your contributions will be licensed under the [MIT License](./LICENSE.md).
