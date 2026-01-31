# Conventional Commits Reference

## Format Structure

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

| Type | Description | SemVer Impact |
|------|-------------|---------------|
| feat | New feature | MINOR |
| fix | Bug fix | PATCH |
| docs | Documentation only | - |
| style | Formatting, no code change | - |
| refactor | Code restructuring | - |
| perf | Performance improvement | - |
| test | Adding/fixing tests | - |
| build | Build system changes | - |
| ci | CI configuration | - |
| chore | Maintenance tasks | - |

## Project Scopes

| Scope | Directory |
|-------|-----------|
| `core` | `packages/core/` |
| `node` | `packages/node/` |
| `html-renderer` | `packages/html-renderer/` |
| `rollup` | `packages/rollup/` |
| `vite` | `packages/vite/` |
| `demos` | `demos/` |
| `release` | Version bumps (any package) |

**Note:** Changes to `docs/` use the `docs:` commit type without a scope.

### Examples

```
feat(core): add custom tag transformer     # packages/core/ changes
fix(node,vite): correct path resolution    # multiple package changes
docs: update installation guide            # docs/ changes (type, not scope)
```

## Combined Scopes

For changes affecting multiple packages, combine scopes with commas:

```
fix(core,node): correct shared type definitions
feat(rollup,vite): add source map support
```

## Breaking Changes

Two ways to indicate breaking changes:

1. **Add `!` before the colon:**

   ```
   feat(core)!: redesign parser API
   refactor(node)!: change file finder signature
   ```

2. **Use BREAKING CHANGE footer:**

   ```
   feat(core): redesign parser API

   BREAKING CHANGE: Parser.parse() now returns Promise<Result>
   ```

Both trigger a MAJOR version bump.

## Guidelines

1. **Use imperative mood** - "add" not "added" or "adds"
2. **Keep description under 50 characters** - Be concise
3. **Don't end description with period** - It's a title, not a sentence
4. **Body explains what and why** - Not how (code shows how)
5. **Wrap body at 72 characters** - Standard git convention
6. **Separate body from description** - Use blank line
7. **Always include Co-Authored-By footer** - Required for attribution

## Footer Format

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

Additional footers can include:

- `Fixes #123` - Links to issue
- `Refs #456` - References related issue
- `BREAKING CHANGE: description` - Breaking change details
