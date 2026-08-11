# Label Guide

Allowed labels for the UI-Doc repository. **Only use labels listed here.** Never invent labels.

## Allowed Labels

### Type Labels

**Exactly one** type label is required per issue. No exceptions.

| Label              | Use For                            |
| ------------------ | ---------------------------------- |
| `type:bug`         | Bug reports, unexpected behavior   |
| `type:feature`     | New functionality                  |
| `type:enhancement` | Improvements to existing features  |
| `type:docs`        | Documentation issues               |
| `type:testing`     | Test coverage, test infrastructure |

**Issue type → type label mapping:**

| Issue Type      | Type Label     |
| --------------- | -------------- |
| Bug Report      | `type:bug`     |
| Feature Request | `type:feature` |
| Documentation   | `type:docs`    |

### Scope Labels

Add for each affected package. Multiple scope labels are allowed.

| Label                 | Package / Area                           |
| --------------------- | ---------------------------------------- |
| `scope:core`          | `@ui-doc/core` — parsing engine          |
| `scope:node`          | `@ui-doc/node` — file system operations  |
| `scope:html-renderer` | `@ui-doc/html-renderer` — HTML rendering |
| `scope:rollup`        | `@ui-doc/rollup` — Rollup plugin         |
| `scope:vite`          | `@ui-doc/vite` — Vite plugin             |
| `scope:demos`         | `demos/` — example configurations        |
| `scope:docs`          | `docs/` — consumer documentation         |

**Detection from file paths:**

| Path                      | Scope Label           |
| ------------------------- | --------------------- |
| `packages/core/`          | `scope:core`          |
| `packages/node/`          | `scope:node`          |
| `packages/html-renderer/` | `scope:html-renderer` |
| `packages/rollup/`        | `scope:rollup`        |
| `packages/vite/`          | `scope:vite`          |
| `demos/`                  | `scope:demos`         |
| `docs/`                   | `scope:docs`          |

### Priority Labels

Optional. Add **only** when priority is explicitly stated or clearly urgent.

| Label               | Criteria                                    |
| ------------------- | ------------------------------------------- |
| `priority:critical` | Blocks all usage, data loss, security issue |
| `priority:high`     | Major feature broken, no workaround         |
| `priority:medium`   | Feature broken but workaround exists        |
| `priority:low`      | Minor inconvenience, cosmetic               |

### Community Labels

Optional. Add **only** when specifically requested.

| Label              | Use For                              |
| ------------------ | ------------------------------------ |
| `good-first-issue` | Well-scoped, beginner-friendly tasks |
| `help-wanted`      | Open for community contributions     |

## Validation Rules

1. **Every issue MUST have exactly one `type:*` label** — no more, no less
2. **Every label MUST exist in the lists above** — never invent or guess label names
3. **Scope labels are derived from package detection** — do not add scope labels without evidence (file path, package mention, or user confirmation)
4. **Priority labels require justification** — only add if the user explicitly states priority or the issue is clearly critical (security, data loss)
5. **Do not use GitHub's default labels** — do not use `bug`, `enhancement`, `documentation`, `good first issue`, `help wanted`, `duplicate`, `invalid`, `question`, or `wontfix`. Always use the `type:*` / `scope:*` / `priority:*` equivalents
6. **Before creating the issue, verify every label** against the allowed lists above. If unsure whether a label exists, run `gh label list` to confirm
