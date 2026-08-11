# Release Process

UI-Doc uses automated releases powered by [@dot/versioner](https://github.com/nicobrinkkemper/versioner). Each package in the monorepo is versioned independently based on conventional commits.

## How Releases Work

### Automated Pipeline

When code is merged to `master`, GitHub Actions automatically:

1. Runs lint and test checks
2. Analyzes conventional commits since the last release for each package
3. Bumps versions based on commit types
4. Generates CHANGELOG entries
5. Creates release commits and git tags
6. Publishes to npm with OIDC provenance

Release commits follow the format `chore(release): <package-name> v<version>` and are automatically excluded from triggering subsequent releases.

### Version Bumping

Versions are determined by conventional commit types:

| Commit Type                         | Version Bump  | Example          |
| ----------------------------------- | ------------- | ---------------- |
| `fix(core):`                        | Patch (0.0.x) | Bug fixes        |
| `feat(core):`                       | Minor (0.x.0) | New features     |
| `feat(core)!:` or `BREAKING CHANGE` | Major (x.0.0) | Breaking changes |

Commits without a package scope (like `docs:` or `chore:`) do not trigger releases.

### Release Order

Packages are released serially in dependency order to ensure consistency:

```text
@ui-doc/core → @ui-doc/node → @ui-doc/html-renderer → @ui-doc/rollup → @ui-doc/vite
```

This prevents issues where a downstream package might reference an unpublished upstream version.

## Workspace Dependencies

### Dependency Format

UI-Doc uses pnpm workspace dependencies with explicit version constraints:

```json
{
  "dependencies": {
    "@ui-doc/core": "workspace:^0.4.0"
  },
  "peerDependencies": {
    "@ui-doc/html-renderer": "workspace:^1.1.0"
  }
}
```

The `workspace:` prefix tells pnpm to resolve locally during development. When published, it's replaced with the actual version constraint (e.g., `^0.4.0`).

### When to Update Constraints

Update workspace dependency constraints **in the same PR** that introduces:

- Breaking API changes that downstream packages depend on
- New features that downstream packages need to use
- Bug fixes that downstream packages require

This keeps packages compatible and ensures consumers get the correct minimum versions.

### How to Update Constraints

1. Identify which downstream packages depend on your changes
2. Update the version constraint in their `package.json`:

   ```json
   {
     "dependencies": {
       "@ui-doc/core": "workspace:^0.5.0"
     }
   }
   ```

3. Include these changes in your PR

### Example: Breaking Change in Core

When making a breaking change to `@ui-doc/core`:

1. Make your breaking changes to core
2. Update downstream packages to work with the new API
3. Update version constraints in packages that depend on core:

   ```bash
   # packages/node/package.json
   "@ui-doc/core": "workspace:^0.5.0"

   # packages/rollup/package.json
   "@ui-doc/core": "workspace:^0.5.0"
   ```

4. Commit everything in one PR:

   ```bash
   git commit -m "feat(core)!: change parser API signature

   BREAKING CHANGE: ParserOptions interface restructured.
   Updated node and rollup packages for compatibility."
   ```

5. When merged, the release pipeline handles version bumps and publishing

## Manual Procedures

### Dry-Run Release

Test the release process locally without publishing:

```bash
pnpm release:dry
```

This runs lint and tests, then shows what versions would be bumped and what changelog entries would be generated. No git commits or npm publishes occur.

### Single Package Dry-Run

Test release for a specific package:

```bash
pnpm --filter @ui-doc/core release:dry
```

### Testing Before Push

Before pushing changes that affect releases:

1. Ensure all tests pass:

   ```bash
   pnpm test
   ```

2. Check for lint issues:

   ```bash
   pnpm lint
   ```

3. Run a dry-run release:

   ```bash
   pnpm release:dry
   ```

4. Review the proposed version bumps and changelog entries

### Local Full Release

For maintainers with npm publish access, you can run a full release locally:

```bash
pnpm release
```

This is rarely needed since GitHub Actions handles automated releases.

## Troubleshooting

### No Release Triggered

**Symptoms:** Commits merged to master but no release occurred.

**Possible causes:**

1. Commits don't include a package scope (`docs:`, `chore:` without scope)
2. The head commit is a release commit (starts with `chore(release):`)
3. CI checks failed before the release step

**Solutions:**

- Ensure commits that should trigger releases have proper scope: `feat(core):`, `fix(node):`
- Check GitHub Actions logs for failures
- Re-run the workflow if it was a transient failure

### Workspace Dependency Resolution Errors

**Symptoms:** `pnpm install` fails with workspace resolution errors after pulling.

**Possible causes:**

- Local packages don't match version constraints
- Version constraints were updated but packages weren't rebuilt

**Solutions:**

1. Rebuild all packages:

   ```bash
   pnpm workspace:build
   ```

2. If issues persist, clean and reinstall:

   ```bash
   pnpm clean
   rm -rf node_modules
   pnpm install
   pnpm workspace:build
   ```

### Failed npm Publish

**Symptoms:** Release commit created but package not published.

**Possible causes:**

- npm authentication issues (OIDC token problems)
- Package already exists at that version
- Network issues during publish

**Solutions:**

1. Check GitHub Actions logs for the specific error
2. For OIDC issues, verify the workflow has `id-token: write` permission
3. For "already exists" errors, the package may have been partially published—check npm registry
4. For transient failures, manually trigger the workflow or publish locally:

   ```bash
   cd packages/<package-name>
   npm publish --access public
   ```

   Publishing from CI uses GitHub OIDC (npm Trusted Publisher) and needs no
   token. Publishing locally is the only path that requires credentials —
   authenticate via your own `~/.npmrc`. The repository deliberately ships no
   `.npmrc` of its own.

### Version Mismatch Between Packages

**Symptoms:** A downstream package references a version that doesn't exist.

**Possible causes:**

- Workspace constraints updated before upstream package was released
- Release pipeline interrupted between package releases

**Solutions:**

1. Check current published versions:

   ```bash
   npm view @ui-doc/core version
   npm view @ui-doc/node version
   ```

2. Update workspace constraints to match published versions
3. Wait for or trigger upstream package release first

## Related Documentation

- [Contributing Guide](../../CONTRIBUTING.md) - Development workflow
- [Branching Model](./branching-model.md) - Branch naming and merge strategies
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message format
- [pnpm Workspace Release Workflow](https://pnpm.io/workspaces#release-workflow) - Workspace protocol in published packages
