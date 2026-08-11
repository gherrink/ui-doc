---
description: Create a GitHub issue. Supports explicit details or inference from conversation context.
argument-hint: [bug|feature|docs] [title] | --context
allowed-tools: Bash, Read
skills: github-issue
---

# Create Issue Command

Create a GitHub issue aligned with the project's issue templates and label system.

## Pipeline Overview

```
Arguments → Parse Mode → Determine Type → Read Template → Collect Fields → Select Labels → Preview → Create → Report
```

## Workflow

### Step 1: Parse Arguments

**Arguments provided:** $ARGUMENTS

Determine the mode based on argument format:

| Input             | Mode                                   | Example                                       |
| ----------------- | -------------------------------------- | --------------------------------------------- |
| (empty)           | Context — extract from conversation    | `/create-issue`                               |
| `--context`       | Context — explicit context extraction  | `/create-issue --context`                     |
| `bug "title"`     | Typed — bug report with title          | `/create-issue bug "Parser fails"`            |
| `feature "title"` | Typed — feature request with title     | `/create-issue feature "Add nested examples"` |
| `docs "title"`    | Typed — documentation issue with title | `/create-issue docs "Missing API reference"`  |
| `"title"`         | Interactive — ask for type             | `/create-issue "Fix empty blocks"`            |

### Step 2: Determine Issue Type & Details

**Context mode** (empty args or `--context`):

Analyze the conversation to identify:

- Issue type from keywords (error/crash/fails → bug, add/support/would be nice → feature, docs/unclear/typo → docs)
- Affected package(s) from file paths (`packages/core/`) or package mentions (`@ui-doc/core`)
- Technical details: error messages, code snippets, configuration
- Draft a title summarizing the issue

If the conversation lacks enough context to determine the type, switch to interactive mode and ask the user.

**Typed mode** (`bug`, `feature`, `docs` + title):

Use the provided type and title directly.

**Interactive mode** (title only, no type):

Ask the user which issue type to use with AskUserQuestion.

### Step 3: Read Template & Collect Fields

**MANDATORY:** Use the Read tool to read the matching `.github/ISSUE_TEMPLATE/` file. The template is the single source of truth for field names, field order, required/optional status, dropdown options, and placeholder text.

| Type            | Template File                                |
| --------------- | -------------------------------------------- |
| Bug Report      | `.github/ISSUE_TEMPLATE/bug_report.yml`      |
| Feature Request | `.github/ISSUE_TEMPLATE/feature_request.yml` |
| Documentation   | `.github/ISSUE_TEMPLATE/documentation.yml`   |

After reading the template, collect values for each field in the template's `body` array:

- `validations.required: true` fields **must** have content
- Optional fields with no content should be omitted entirely
- Dropdown fields must use one of the listed `options` values
- Preserve the field order from the template

**In context mode:** Extract field values from the conversation. For any required field that cannot be inferred, ask the user with AskUserQuestion.

**In typed/interactive mode:** Ask the user for each required field that wasn't provided, using AskUserQuestion or prompting inline.

### Step 4: Select & Validate Labels

**MANDATORY:** Read the label guide at `.claude/skills/github-issue/references/label-guide.md`. Only labels listed in that guide are allowed. Never invent labels or use GitHub's default labels (`bug`, `enhancement`, `documentation`, `good first issue`, `help wanted`, etc.).

**Label selection:**

1. **Type label (required)** — exactly one, derived from issue type:
   - Bug Report → `type:bug`
   - Feature Request → `type:feature`
   - Documentation → `type:docs`
2. **Scope labels (when applicable)** — add for each affected package, derived from file paths or package mentions. Do not add scope labels without evidence.
3. **Priority label (only when justified)** — add only if the user explicitly states priority or the issue is clearly critical (security, data loss)
4. **Community labels (only when requested)** — `good-first-issue`, `help-wanted`

**Validation — check before proceeding:**

- [ ] Exactly one `type:*` label is present
- [ ] Every label exists in the label guide
- [ ] No GitHub default labels are used
- [ ] Scope labels have evidence (file path, package mention, or user confirmation)
- [ ] Priority label has justification (if present)

If unsure whether a label exists, run `gh label list` to verify.

Ask the user to confirm the suggested labels or add more.

Optionally set:

- `--assignee "@me"` — if the user wants to self-assign
- `--milestone "name"` — if a milestone is relevant

### Step 5: Preview & Confirm

Show the user a preview of the issue before creating:

```
Title: [Bug]: Parser crashes on empty blocks
Labels: type:bug, scope:core
Assignee: (none)

Body:
## Package
@ui-doc/core

## Description
The parser throws an unhandled error when processing files with empty doc blocks.

## Steps to Reproduce
1. Create a CSS file with `/** */`
2. Run the build
3. See TypeError

## Expected Behavior
Empty blocks should be silently skipped.

## Actual Behavior
TypeError: Cannot read properties of undefined (reading 'tags')

## Environment
- Node.js version: 20.x
- pnpm version: 9.x

## Additional Context
Stack trace: ...
```

Ask the user: "Create this issue?" — let them confirm, edit, or cancel.

### Step 6: Create Issue

Execute with `gh issue create` using a HEREDOC for the body:

```bash
gh issue create \
  --title "[Bug]: Parser crashes on empty blocks" \
  --body "$(cat <<'EOF'
## Package
@ui-doc/core

## Description
...
EOF
)" \
  --label "type:bug,scope:core"
```

### Step 7: Report

Show the result:

```
Issue created successfully!

#123: [Bug]: Parser crashes on empty blocks
URL: https://github.com/.../issues/123
Labels: type:bug, scope:core
```

## Error Handling

| Error                         | Response                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| `gh` not authenticated        | Guide: run `gh auth login`                                                                    |
| Label not in allowed list     | Stop. Do not create the issue. Show the label guide and ask user to pick from allowed labels. |
| Label doesn't exist on GitHub | Run `gh label list` and show available labels                                                 |
| No `type:*` label selected    | Stop. Every issue requires exactly one type label.                                            |
| GitHub default label used     | Replace with correct `type:*` equivalent (e.g., `bug` → `type:bug`)                           |
| No conversation context       | Switch to interactive mode, ask user for details                                              |
| Permission denied             | Check repo access with `gh repo view`                                                         |
| Network error                 | Show error, suggest retrying                                                                  |

## Usage Examples

```
/create-issue bug "Parser fails on empty doc blocks"
/create-issue feature "Support nested examples in doc blocks"
/create-issue docs "Missing API reference for CommentBlockParser"
/create-issue --context
/create-issue
```
