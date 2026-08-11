# Test Writing Sub-Agent Architecture

This document describes the architecture of the automated test generation system for UI-Doc, built using Claude Code's agent and skill framework.

## Overview

The test writing system uses a **pipeline architecture** that separates concerns between analysis and implementation. The core principle: the test writer agent receives only behavioral specifications, never implementation code — ensuring tests focus on _what_ code should do, not _how_ it does it.

```text
┌─────────────────────────────────────────────────────────────────┐
│                     /write-tests command                         │
│                    (orchestration layer)                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Test Spec Agent                              │
│                                                                  │
│  Input:  Source file path                                        │
│  Tools:  Read, Grep, Glob                                        │
│  Output: Structured Markdown specification                       │
│                                                                  │
│  • Analyzes source code                                          │
│  • Identifies public API surface                                 │
│  • Documents test scenarios and edge cases                       │
│  • Specifies mock requirements                                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ (Specification only - no source code)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Test Writer Agent                             │
│                                                                  │
│  Input:  Test specification (Markdown)                           │
│  Tools:  Read, Write, Edit                                       │
│  Skills: vitest-guide                                           │
│  Output: Vitest test file                                        │
│                                                                  │
│  • Transforms spec into test code                                │
│  • Creates type-safe mocks                                       │
│  • Follows UI-Doc conventions                                    │
│  • Never sees implementation code                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Verification                                │
│                                                                  │
│  • Runs: pnpm --filter @ui-doc/<pkg> test                        │
│  • Reports results to user                                       │
│  • User decides on error resolution                              │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Write-Tests Command

**Location:** `.claude/commands/write-tests.md`

The entry point for users. Orchestrates the entire pipeline.

```bash
/write-tests packages/core/src/UIDoc.ts
```

**Responsibilities:**

- Validate input file exists
- Launch test-spec agent with source path
- Pass specification to test-writer agent
- Run tests and report results
- Handle errors with user control

### 2. Test Spec Agent

**Location:** `.claude/agents/test-spec.md`

Analyzes source code and produces structured test specifications.

| Property | Value                  |
| -------- | ---------------------- |
| Model    | Sonnet                 |
| Tools    | Read, Grep, Glob       |
| Input    | Source file path       |
| Output   | Markdown specification |

**Output Format:**

```markdown
# Test Specification: [FileName]

## Overview

[What the code does]

## Module Information

- File, test path, package

## Dependencies to Mock

[Interfaces and methods requiring mocks]

## Public API

[Functions, classes, methods with signatures]

## Test Scenarios

[Detailed scenarios with exact inputs/outputs]

## Error Conditions

[Error triggers and expected behavior]

## Mock Verification Requirements

[Expected mock call assertions]
```

### 3. Test Writer Agent

**Location:** `.claude/agents/test-writer.md`

Transforms specifications into Vitest test files.

| Property | Value              |
| -------- | ------------------ |
| Model    | Sonnet             |
| Tools    | Read, Write, Edit  |
| Skills   | vitest-guide       |
| Input    | Test specification |
| Output   | `.test.ts` file    |

**Key Constraint:** This agent NEVER receives source code — only the specification. This ensures:

- Tests focus on behavior, not implementation
- Tests remain valid when internals change
- Better test design through abstraction

### 4. Test Patterns Skill

**Location:** `.claude/skills/vitest-guide/`

A knowledge base providing Vitest patterns and UI-Doc conventions.

```text
vitest-guide/
├── SKILL.md                    # Quick reference and core patterns
└── references/
    ├── vivitest-guide.md      # Comprehensive Vitest documentation
    └── ui-doc-conventions.md   # Project-specific conventions
```

**Coverage:**

- Mock patterns (`vi.fn`, `vi.mock`, `vi.spyOn`)
- Type-safe mock typing
- Assertion patterns
- Async testing
- File organization conventions
- Package-specific patterns

## Data Flow

### Specification Format

The specification acts as the **contract** between the spec agent and writer agent:

```text
┌─────────────────┐         ┌─────────────────┐
│   Spec Agent    │         │  Writer Agent   │
│                 │         │                 │
│  Reads:         │         │  Reads:         │
│  - Source code  │    →    │  - Spec only    │
│  - Existing     │  Spec   │  - vitest-guide│
│    tests        │         │    skill        │
│                 │         │                 │
│  Produces:      │         │  Produces:      │
│  - Markdown     │         │  - .test.ts     │
│    spec         │         │    file         │
└─────────────────┘         └─────────────────┘
```

### Information Boundaries

| Information        | Spec Agent     | Writer Agent |
| ------------------ | -------------- | ------------ |
| Source code        | ✅ Full access | ❌ No access |
| Test specification | ✅ Produces    | ✅ Consumes  |
| Existing tests     | ✅ Reference   | ✅ Preserve  |
| Testing patterns   | ❌ Not needed  | ✅ Via skill |

## Design Decisions

### Why Separate Agents?

1. **Focused Context:** Each agent has a smaller, more relevant context window
2. **Better Tests:** Writer focuses on behavior description, not implementation details
3. **Maintainability:** Tests don't break when internals change
4. **Reusability:** Spec format could feed other tools (documentation, coverage analysis)

### Why a Skill for Patterns?

1. **Automatic Loading:** The `skills:` field loads patterns without explicit prompting
2. **Maintainability:** Update patterns in one place, all agents benefit
3. **Discoverability:** Other agents/commands can reference the same skill
4. **Documentation:** Patterns serve as both instructions and reference docs

### Why Manual Error Resolution?

1. **User Control:** Automated fixes might introduce incorrect assumptions
2. **Learning Opportunity:** Users see exactly what failed and why
3. **Flexibility:** User can choose to fix, regenerate, or accept partial results
4. **Safety:** No risk of test-fixing loops that mask real issues

## Extension Points

### Adding Coverage Analysis

```text
.claude/agents/
└── test-coverage.md    # Analyzes coverage, suggests missing tests
```

### Adding Mutation Testing

```text
.claude/agents/
└── mutation-tester.md  # Validates test quality via mutations
```

### Adding Test Review

```text
.claude/agents/
└── test-reviewer.md    # Reviews tests for quality and completeness
```

## File Structure

```text
.claude/
├── commands/
│   └── write-tests.md              # /write-tests entry point
├── skills/
│   └── vitest-guide/
│       ├── SKILL.md                # Core patterns
│       └── references/
│           ├── vivitest-guide.md  # Vitest reference
│           └── ui-doc-conventions.md # Project conventions
└── agents/
    ├── test-spec.md                # Source → Specification
    └── test-writer.md              # Specification → Tests
```

## Usage Examples

### Basic Usage

```bash
# Generate tests for a single file
/write-tests packages/core/src/UIDoc.ts
```

### Pipeline Execution

1. **User invokes command:**

   ```bash
   /write-tests packages/core/src/CommentBlockParser.ts
   ```

2. **Spec agent analyzes code:**
   - Reads `CommentBlockParser.ts`
   - Identifies `parse()`, `registerTagTransformer()` methods
   - Documents 15 test scenarios
   - Outputs structured Markdown

3. **Writer agent creates tests:**
   - Receives specification (not source)
   - Creates `comment-block-parser.test.ts`
   - Implements all 15 scenarios with proper mocks

4. **Verification:**

   ```bash
   pnpm --filter @ui-doc/core test
   # ✅ 15 tests passing
   ```

### Error Handling

```text
❌ 2 tests failed

Errors:
FAIL packages/core/tests/comment-block-parser.test.ts
  ✕ should parse nested sections (AssertionError)
    Expected: { sections: [...] }
    Received: { sections: undefined }

Options:
1. Ask me to fix the failing tests
2. Modify the specification and regenerate
3. Accept partial results and manually adjust
```

## Best Practices

### When Writing Specifications

- Include **exact** input values, not descriptions
- Include **exact** expected outputs
- Document ALL edge cases
- Specify mock verification requirements
- Note async behavior explicitly

### When Writing Tests

- Use `vi.fn<Type['method']>()` for type safety
- Clear mocks in `beforeEach`
- One concept per test
- Follow Arrange-Act-Assert pattern
- Preserve existing tests when adding new ones

## Related Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Claude Code Agent Framework](https://docs.anthropic.com/claude-code)
- [UI-Doc Testing Conventions](../../.claude/skills/vitest-guide/references/ui-doc-conventions.md)
