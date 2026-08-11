---
name: github-issue
description: Create GitHub issues with proper formatting, labels, and metadata. Supports bug reports, feature requests, and documentation issues.
allowed-tools:
  - Bash
  - Read
---

# GitHub Issue Skill

Create well-structured GitHub issues that align with the project's issue templates and label system.

## Quick Reference

**Issue types:** Bug Report, Feature Request, Documentation (matching `.github/ISSUE_TEMPLATE/`)

**Labels:** See [label-guide.md](./references/label-guide.md) for the full label system

**Title prefixes:** `[Bug]:`, `[Feature]:`, `[Docs]:`

**Command:** `gh issue create --title "..." --body "$(cat <<'EOF' ... EOF)" --label "type:bug,scope:core"`

## Issue Types & Templates

**IMPORTANT:** Always read the matching `.github/ISSUE_TEMPLATE/*.yml` file before constructing the issue body. The template is the single source of truth for field names, field order, required/optional status, dropdown options, and placeholder text. Do NOT rely on memory — read the template every time.

| Type            | Template File                                | Title Prefix  | Default Label  |
| --------------- | -------------------------------------------- | ------------- | -------------- |
| Bug Report      | `.github/ISSUE_TEMPLATE/bug_report.yml`      | `[Bug]: `     | `type:bug`     |
| Feature Request | `.github/ISSUE_TEMPLATE/feature_request.yml` | `[Feature]: ` | `type:feature` |
| Documentation   | `.github/ISSUE_TEMPLATE/documentation.yml`   | `[Docs]: `    | `type:docs`    |

### Building the Body from a Template

1. **Read** the template YAML file for the chosen issue type
2. **Extract** each `body` entry — these define the sections in order
3. **Map** each entry to a markdown section in the issue body:
   - `type: dropdown` → `## {label}` with one of the listed `options` as value
   - `type: textarea` → `## {label}` with the content as value
   - `type: input` → `## {label}` with the content as value
4. **Respect** `validations.required: true` — these fields must have content
5. **Omit** optional sections (`required: false`) that have no content — do not include empty sections
6. **Preserve** the field order from the template

## Context Extraction

When inferring issue details from conversation context:

**Type detection:**

- Bug indicators: "error", "crash", "fails", "broken", "unexpected", stack traces, error messages
- Feature indicators: "would be nice", "add support", "missing feature", "could we", "should support"
- Documentation indicators: "docs", "unclear", "confusing", "missing example", "typo", "outdated"

**Package detection:**

- File paths: `packages/core/` → `@ui-doc/core`
- Direct mentions: `@ui-doc/node`, `html-renderer`
- Import paths: `from '@ui-doc/rollup'`

**Scope mapping:**

| Path / Mention            | Package                 | Scope Label           |
| ------------------------- | ----------------------- | --------------------- |
| `packages/core/`          | `@ui-doc/core`          | `scope:core`          |
| `packages/node/`          | `@ui-doc/node`          | `scope:node`          |
| `packages/html-renderer/` | `@ui-doc/html-renderer` | `scope:html-renderer` |
| `packages/rollup/`        | `@ui-doc/rollup`        | `scope:rollup`        |
| `packages/vite/`          | `@ui-doc/vite`          | `scope:vite`          |
| `demos/`                  | Demos                   | `scope:demos`         |
| `docs/`                   | Documentation           | `scope:docs`          |

## Workflow

1. **Determine issue type** — from arguments, or infer from conversation keywords
2. **Read the matching template** — use the Read tool on `.github/ISSUE_TEMPLATE/{bug_report,feature_request,documentation}.yml` to get the authoritative field structure. This step is **mandatory** — never skip it.
3. **Collect details** — for each field in the template body, extract the value from conversation context or prompt the user. Ensure all `required: true` fields have content.
4. **Select and validate labels** — see [label-guide.md](./references/label-guide.md) for the full allowed list and validation rules. Every label must exist in the guide. Never invent labels or use GitHub defaults (`bug`, `enhancement`, etc.).
5. **Build the body** — construct markdown sections matching the template fields in order (see "Building the Body from a Template" above)
6. **Preview** — show title, labels, and body to the user for confirmation
7. **Create the issue** — execute `gh issue create` with HEREDOC body
8. **Report** — show issue number, URL, and labels

## gh CLI Reference

```bash
# Create issue
gh issue create \
  --title "[Bug]: Parser crashes on empty blocks" \
  --body "$(cat <<'EOF'
...body...
EOF
)" \
  --label "type:bug,scope:core" \
  --assignee "@me" \
  --milestone "v1.0"

# Verify labels exist
gh label list

# Find milestones
gh milestone list

# Find projects
gh project list
```
