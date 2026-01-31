# Contributing to UI-Doc

Thank you for your interest in contributing to UI-Doc. This guide will help you get started with the development workflow.

Before contributing, please check the [issue tracker](https://github.com/gherrink/ui-doc/issues) to see if your idea or bug has already been discussed. For significant changes, please open an issue first to discuss your approach. Small fixes and typo corrections can go directly to a pull request.

## Development Environment

### Prerequisites

- Node.js v20 or higher
- pnpm 10.x (`npm install -g pnpm@10`)

### Setup

```bash
# Clone the repository
git clone https://github.com/gherrink/ui-doc.git
cd ui-doc

# Install dependencies
pnpm install

# Build all packages
pnpm workspace:build
```

The project uses Husky for pre-commit hooks that automatically lint and format your code.

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

| Command | Description |
|---------|-------------|
| `pnpm workspace:build` | Build all packages |
| `pnpm workspace:test` | Run all package tests |
| `pnpm --filter @ui-doc/core test` | Run tests for a specific package |
| `pnpm lint` | Run all linters (docs, js, css) |
| `pnpm fix` | Run all auto-fixes |
| `pnpm typecheck` | Type check all packages |

### Running the Demo

```bash
cd demos/ui-doc
pnpm dev
```

This starts a Vite dev server with live preview at `http://localhost:5173/ui-doc`.

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

ESLint and Prettier handle formatting automatically via pre-commit hooks.

### CSS

Stylelint enforces consistent property ordering and standard conventions.

### Documentation

- Markdown files must pass Markdownlint
- Use JSDoc comments for public APIs

## Testing

Tests use [Vitest](https://vitest.dev/) and are located in `packages/*/tests/`. Test files should match the pattern `*.test.ts` or `*.spec.ts`.

```bash
# Run all tests
pnpm workspace:test

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

| Pattern | Purpose | Example |
|---------|---------|---------|
| `feat/{description}` | New features | `feat/custom-transformers` |
| `fix/{description}` | Bug fixes | `fix/template-caching` |
| `hotfix/{pkg}-{desc}` | Critical fixes | `hotfix/core-memory-leak` |
| `chore/{description}` | Maintenance | `chore/upgrade-deps` |
| `docs/{description}` | Documentation | `docs/api-reference` |

For package-specific work, include the package name: `fix/core-parser-edge-case`.

See the [Branching Model Guide](./docs/contributing/branching-model.md) for detailed workflows including hotfix procedures and cross-package changes.

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
