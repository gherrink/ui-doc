# Branching Model

UI-Doc uses a **Modified GitHub Flow** branching strategy. This provides structure for organized development while maintaining low overhead.

## Branch Types

### Permanent Branches

| Branch | Purpose | Auto-Release |
|--------|---------|--------------|
| `master` | Production-ready code | Stable versions (x.y.z) |
| `next` | Pre-release staging (future) | Beta versions (x.y.z-beta.n) |

The `master` branch always contains production-ready code. Merging to `master` triggers an automated release.

### Short-Lived Branches

Create these branches from `master` and merge back via pull request:

| Pattern | Purpose | Example |
|---------|---------|---------|
| `feat/{description}` | New features | `feat/custom-transformers` |
| `fix/{description}` | Bug fixes | `fix/template-caching` |
| `hotfix/{pkg}-{desc}` | Critical production fixes | `hotfix/core-memory-leak` |
| `chore/{description}` | Maintenance tasks | `chore/upgrade-deps` |
| `docs/{description}` | Documentation updates | `docs/api-reference` |

### Long-Lived Maintenance Branches

For maintaining older major versions after a breaking release:

| Pattern | Purpose | Example |
|---------|---------|---------|
| `release/{pkg}-v{major}` | Major version maintenance | `release/core-v0` |

These branches are created when needed, not proactively.

## Naming Conventions

### Branch Names

- Use lowercase with hyphens: `feat/custom-transformers`
- Keep descriptions concise but meaningful
- For package-specific work, include the package name: `fix/core-parser-edge-case`
- For cross-package changes, use a general description: `feat/unified-logging`

### Examples

```text
feat/custom-transformers      # New feature across packages
feat/core-async-parsing       # Package-specific feature
fix/template-caching          # General bug fix
fix/rollup-watch-mode         # Package-specific fix
hotfix/core-memory-leak       # Critical production fix
chore/upgrade-vitest          # Dependency update
docs/api-reference            # Documentation work
```

## Workflows

### Standard Feature Flow

For typical feature development and bug fixes:

```text
master ──●──────────●── (auto-release on merge)
          \        /
           feat/x ●●●  (conventional commits)
```

**Steps:**

1. Create a branch from `master`:

   ```bash
   git checkout master
   git pull origin master
   git checkout -b feat/my-feature
   ```

2. Make changes with conventional commits:

   ```bash
   git commit -m "feat(core): add custom transformer support"
   git commit -m "test(core): add transformer edge case tests"
   ```

3. Push and create a pull request:

   ```bash
   git push -u origin feat/my-feature
   ```

4. After review and CI passes, merge to `master`

5. Automated release publishes new versions

### Hotfix Flow

For critical bugs that need immediate release:

```text
master ──●────────●── (immediate release)
          \      /
      hotfix/critical ● (minimal fix)
```

**Steps:**

1. Create a hotfix branch from `master`:

   ```bash
   git checkout master
   git pull origin master
   git checkout -b hotfix/core-critical-bug
   ```

2. Apply the minimal fix with a `fix` commit:

   ```bash
   git commit -m "fix(core): resolve critical parsing failure"
   ```

3. Create a pull request with high priority

4. After expedited review, merge to `master`

5. Automated release publishes the patch

**Guidelines for hotfixes:**

- Keep changes minimal and focused
- Only fix the critical issue
- Avoid refactoring or unrelated improvements
- Consider the fix carefully despite urgency

### Pre-release Flow

For testing changes before stable release (future workflow):

```text
master ────●──────────────────●── (stable)
            \                /
next ────────●────●────────●──── (beta releases)
```

When the `next` branch is active:

1. Feature branches merge to `next` first
2. Each merge to `next` triggers a beta release (x.y.z-beta.n)
3. After testing, `next` merges to `master` for stable release

## Cross-Package Changes

The UI-Doc monorepo has a dependency hierarchy:

```text
@ui-doc/core → @ui-doc/node → @ui-doc/html-renderer → @ui-doc/rollup → @ui-doc/vite
```

### Breaking Changes

When making breaking changes:

1. **Single package**: Use conventional commits with `!` or `BREAKING CHANGE`:

   ```bash
   git commit -m "feat(core)!: change parser API signature"
   ```

2. **Multiple packages**: Group related breaking changes in one PR:

   ```bash
   git commit -m "feat(core)!: change context structure

   BREAKING CHANGE: UIDocContext interface restructured.
   Affects downstream packages: node, html-renderer, rollup, vite."
   ```

3. **Cascading updates**: When core changes require downstream updates, include them in the same PR to keep packages compatible.

### Feature Flags

For large features spanning multiple packages:

1. Implement behind a feature flag if possible
2. Release incrementally to each package
3. Enable by default once stable across all packages

## Major Version Migration

When releasing a new major version with breaking changes:

1. **Before release**: Ensure `master` contains the breaking changes

2. **Create maintenance branch** (if supporting old version):

   ```bash
   git checkout master
   git checkout -b release/core-v0
   git push -u origin release/core-v0
   ```

3. **After release**: The new major version is on `master`

4. **Backporting fixes**: Cherry-pick critical fixes to maintenance branches

   ```bash
   git checkout release/core-v0
   git cherry-pick <commit-hash>
   git push origin release/core-v0
   ```

## Best Practices

### Do

- Keep branches short-lived (days, not weeks)
- Use descriptive branch names
- Rebase on `master` before creating PR if significantly behind
- Delete branches after merging

### Avoid

- Long-running feature branches
- Merging `master` into feature branches (rebase instead)
- Creating branches for trivial single-commit changes
- Multiple unrelated changes in one branch

## Related Documentation

- [Contributing Guide](../../CONTRIBUTING.md) - Development workflow and standards
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message format
