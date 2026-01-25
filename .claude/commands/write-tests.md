---
description: Generate comprehensive tests for a source file. Analyzes code, creates spec, writes tests, verifies.
argument-hint: <source-file-path>
allowed-tools: Task, Read, Bash, Write
---

# Write Tests Command

Generate comprehensive Vitest tests for a source file using a two-agent pipeline that separates analysis from implementation.

## Pipeline Overview

```
Source File → [Test Spec Agent] → Specification → [Test Writer Agent] → Test File
                                                          ↓
                                                   PostToolUse Hook → ESLint --fix
                                                          ↓
                                                   Lint Verification → Test Run → Report
```

## Workflow

### Step 1: Validate Input

Verify the source file exists and determine the target test file path:

- Source: `packages/<pkg>/src/FileName.ts`
- Test: `packages/<pkg>/tests/file-name.test.ts`

### Step 2: Generate Test Specification

Launch the **test-spec** agent to analyze the source file:

```
Analyze the source file at: $ARGUMENTS

Generate a comprehensive test specification following your output format.
Include all public API, edge cases, error conditions, and mock requirements.
Check for existing tests at the corresponding test path and note what's already covered.
```

The spec agent will:
- Read and analyze the source code
- Identify all testable scenarios
- Document mock requirements
- Output a structured Markdown specification

### Step 3: Write Tests from Specification

Launch the **test-writer** agent with ONLY the specification (not source code):

```
Write Vitest tests based on this specification:

[Insert specification from Step 2]

Write the tests to the file path specified in the spec.
If tests already exist, preserve them and add new scenarios.
Follow all UI-Doc testing conventions from your test-patterns skill.
```

The writer agent will:
- Parse the specification
- Create type-safe mocks
- Write idiomatic Vitest tests
- Output to the correct test file path

### Step 4: Lint Test File

Run linting with auto-fix, then verify no errors remain:

```bash
pnpm fix:js packages/<pkg>/tests/<test-file>.test.ts
pnpm lint:js packages/<pkg>/tests/<test-file>.test.ts
```

**Note:** The PostToolUse hook will automatically run ESLint on test files after Write/Edit operations. This explicit step catches any remaining issues.

If lint errors persist:
1. Review the error messages (rule IDs help identify the fix)
2. Edit the test file to fix the issues
3. Re-run lint verification

### Step 5: Run Tests and Verify

Execute the tests to verify they compile and pass:

```bash
pnpm --filter @ui-doc/<package> test
```

### Step 6: Report Results

**If tests pass:**
```
✅ Tests generated successfully!

File: packages/<pkg>/tests/file-name.test.ts
Scenarios covered: [count]
Lint: ✓ Passed
Tests: ✓ All passing
```

**If lint fails:**
```
⚠️ Tests have lint errors

File: packages/<pkg>/tests/file-name.test.ts
Lint errors:
[ESLint error output with rule IDs]

Options:
1. Ask me to fix the lint errors
2. Run `pnpm fix:js` to auto-fix what's possible
```

**If tests fail:**
```
❌ Some tests failed

File: packages/<pkg>/tests/file-name.test.ts
Lint: ✓ Passed
Tests: ✗ Failed

Errors:
[Full Vitest error output]

Options:
1. Ask me to fix the failing tests
2. Modify the specification and regenerate
3. Accept partial results and manually adjust
```

## Error Handling

- **File not found**: Ask user to verify the path
- **Spec generation fails**: Show error, ask for clarification
- **Lint errors**: Show ESLint errors with rule IDs, auto-fix where possible
- **Tests don't compile**: Show TypeScript errors, offer to fix
- **Tests fail**: Show full error output, let user decide next steps

## Usage Examples

```
/write-tests packages/core/src/UIDoc.ts
/write-tests packages/node/src/NodeFileFinder.ts
/write-tests packages/html-renderer/src/HTMLRenderer.ts
```

## Notes

- The test writer NEVER sees source code, only the specification
- This ensures focused, behavior-driven tests
- Existing tests are preserved when adding new scenarios
- The user has full control over error resolution
