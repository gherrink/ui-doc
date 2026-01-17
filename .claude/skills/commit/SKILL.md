---
name: commit
description: Generate conventional commit messages for this project. Analyzes staged git changes and creates properly formatted commit messages with type and scope. Use when committing changes or running /commit.
allowed-tools:
  - Bash
  - Read
---

# Conventional Commits Skill

Generate git commit messages following the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## Quick Reference

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

**Project Scopes:** `core`, `node`, `html-renderer`, `rollup`, `vite`, `demos`, `release`

See [reference.md](./reference.md) for full specification and guidelines.
See [examples.md](./examples.md) for practical examples.

## Workflow

1. Run `git status` to get an overview of modified files
2. Run `git diff --cached` only if more details are needed to understand the changes
3. Determine appropriate type based on the nature of changes
4. Identify scope from affected package(s) or directory
5. Write concise description in imperative mood
6. Add body if explanation of what/why is needed
7. Always include `Co-Authored-By: Claude <noreply@anthropic.com>` footer
