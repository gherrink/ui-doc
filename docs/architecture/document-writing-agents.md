# Document Writing Agent Architecture

This document describes the architecture of the automated documentation generation system for UI-Doc, built using Claude Code's agent and skill framework.

## Overview

The document writing system uses a **single-agent architecture** with topic-based parallelism. Unlike the test-writing pipeline (which separates analysis from implementation), documentation benefits from a unified approach where one agent researches a topic thoroughly and then writes all related documents.

```text
┌─────────────────────────────────────────────────────────────────┐
│                     /write-docs command                         │
│                    (orchestration layer)                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Parse & Group                             │
│                                                                 │
│  • Parse arguments (single vs batch mode)                       │
│  • Validate document types                                      │
│  • Group work by topic (1 agent per topic)                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │ (parallel for   │   multiple      │
            ▼ topics)         ▼                 ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ Document Writer   │ │ Document Writer   │ │ Document Writer   │
│ Agent (Topic A)   │ │ Agent (Topic B)   │ │ Agent (Topic C)   │
│                   │ │                   │ │                   │
│ • Research topic  │ │ • Research topic  │ │ • Research topic  │
│ • Write all docs  │ │ • Write all docs  │ │ • Write all docs  │
│   for this topic  │ │   for this topic  │ │   for this topic  │
└─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘
          │                     │                     │
          └──────────────┬──────┴──────────────┬──────┘
                         │                     │
                         ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Verification                               │
│                                                                 │
│  • Verify files exist                                           │
│  • Run markdown lint (if available)                             │
│  • Report results to user                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Write-Docs Command

**Location:** `.claude/commands/write-docs.md`

The entry point for users. Orchestrates agent invocation based on arguments.

```bash
# Single document
/write-docs tutorial first-component

# Multiple types, one topic (1 agent)
/write-docs batch tutorial,how-to custom-templates

# Multiple topics (parallel agents)
/write-docs batch getting-started vite,rollup
```

**Responsibilities:**

- Parse arguments (single vs batch mode)
- Validate document types against allowed list
- Group work by topic for optimal parallelism
- Launch document-writer agent(s)
- Verify output files exist
- Report results with actionable next steps

### 2. Document Writer Agent

**Location:** `.claude/agents/document-writer.md`

Researches a topic and generates one or more documentation files.

| Property | Value |
|----------|-------|
| Model | Sonnet |
| Tools | Read, Write, Edit, Glob, Grep |
| Skills | documentation-guide |
| Input | Topic + list of document types with output paths |
| Output | Markdown documentation files |

**Workflow:**

```text
┌──────────────────────────────────────────────────────────────┐
│                    Document Writer Agent                      │
├──────────────────────────────────────────────────────────────┤
│  1. RESEARCH TOPIC (once)                                     │
│     • Read package READMEs                                    │
│     • Explore demos for examples                              │
│     • Check existing documentation                            │
│     • Note API patterns and conventions                       │
├──────────────────────────────────────────────────────────────┤
│  2. FOR EACH DOCUMENT TYPE:                                   │
│     • Load template from documentation-guide skill            │
│     • Fill in all sections with researched information        │
│     • Add accurate, complete code examples                    │
│     • Save to specified output path                           │
├──────────────────────────────────────────────────────────────┤
│  3. ADD CROSS-REFERENCES                                      │
│     • Link related documents written in this session          │
│     • Reference existing documentation where relevant         │
└──────────────────────────────────────────────────────────────┘
```

### 3. Documentation Guide Skill

**Location:** `.claude/skills/documentation-guide/`

A knowledge base providing templates, style guidelines, and API references.

```text
documentation-guide/
├── SKILL.md                        # Quick reference and workflow
└── references/
    ├── style-guide.md              # Terminology, voice, formatting
    ├── document-types.md           # Detailed specs per doc type
    ├── ui-doc-api-summary.md       # Quick API reference
    ├── example-patterns.md         # Patterns from demos
    └── templates/
        ├── getting-started.md      # Onboarding template
        ├── tutorial.md             # Step-by-step learning
        ├── how-to-guide.md         # Task-focused guide
        ├── api-reference.md        # Technical specification
        ├── conceptual-guide.md     # Concept explanation
        └── troubleshooting.md      # Problem resolution
```

**Coverage:**

- Six document type templates
- Terminology guidelines ("doc block" not "comment block")
- Code example standards
- Cross-referencing conventions
- Output directory structure

## Data Flow

### Input Processing

The command parses arguments to determine execution mode:

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Argument Parsing                         │
├─────────────────────────────────────────────────────────────────┤
│  "tutorial first-component"                                     │
│       → Single mode                                             │
│       → 1 agent, 1 type, 1 topic                                │
├─────────────────────────────────────────────────────────────────┤
│  "batch tutorial,how-to custom-templates"                       │
│       → Batch mode, single topic                                │
│       → 1 agent, 2 types, 1 topic                               │
├─────────────────────────────────────────────────────────────────┤
│  "batch getting-started vite,rollup,node"                       │
│       → Batch mode, multiple topics                             │
│       → 3 agents (parallel), 1 type each, 3 topics              │
├─────────────────────────────────────────────────────────────────┤
│  "batch tutorial,how-to vite,rollup"                            │
│       → Batch mode, multiple types AND topics                   │
│       → 2 agents (parallel), 2 types each, 2 topics             │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Input Format

Each agent receives a structured prompt:

```markdown
Topic: custom-templates
Documents:
- tutorial → docs/tutorials/custom-templates.md
- how-to → docs/how-to/custom-templates.md

Research this topic thoroughly, then write all requested documents.
Follow your documentation-guide skill templates and style guidelines.
Add cross-references between related documents.
```

### Output Directory Structure

| Document Type | Output Path |
|---------------|-------------|
| getting-started | `docs/getting-started/{topic}.md` |
| tutorial | `docs/tutorials/{topic}.md` |
| how-to | `docs/how-to/{topic}.md` |
| api-reference | `docs/reference/{topic}.md` |
| conceptual | `docs/concepts/{topic}.md` |
| troubleshooting | `docs/troubleshooting/{topic}.md` |

## Design Decisions

### Why Single-Agent (No Spec Phase)?

Unlike test writing, documentation doesn't benefit from separating analysis from implementation:

| Consideration | Test Writing | Documentation |
|---------------|--------------|---------------|
| Source code visibility | Writer shouldn't see (focus on behavior) | Writer should see (accurate examples) |
| Intermediate artifact | Spec enables behavior focus | Spec would add latency without benefit |
| Template complexity | High (mock patterns, assertions) | Moderate (already in skill) |
| Research reuse | N/A (each test file independent) | High (same topic → multiple doc types) |

### Why Group by Topic?

Grouping work by topic (not by document type) provides several benefits:

1. **Research Efficiency:** Agent reads READMEs, demos, and source code once
2. **Consistency:** Same examples, terminology, and explanations across related docs
3. **Natural Cross-References:** Agent knows all docs it's writing, can link them
4. **Optimal Parallelism:** Different topics have no dependencies

Alternative (grouping by type) would be inefficient:

```text
❌ Bad: "tutorial agent" and "how-to agent" both research "vite"
✅ Good: "vite agent" researches once, writes both tutorial and how-to
```

### Why a Skill for Templates?

1. **Automatic Loading:** The `skills:` field loads templates without explicit prompting
2. **Maintainability:** Update templates in one place, all agents benefit
3. **Reusability:** Same skill works for command invocation or direct agent use
4. **Documentation:** Templates serve as both instructions and reference

### Why Parallel Topic Execution?

Topics are independent — docs about "vite" don't depend on docs about "rollup":

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Vite Agent  │     │Rollup Agent │     │ Node Agent  │
│             │     │             │     │             │
│ Research    │     │ Research    │     │ Research    │
│ vite pkg    │     │ rollup pkg  │     │ node pkg    │
│     ↓       │     │     ↓       │     │     ↓       │
│ Write docs  │     │ Write docs  │     │ Write docs  │
└─────────────┘     └─────────────┘     └─────────────┘
      ║                   ║                   ║
      ╚═══════════════════╩═══════════════════╝
                    (parallel)
```

## Comparison: Test vs Documentation Pipelines

| Aspect | Test Writing | Documentation |
|--------|--------------|---------------|
| **Architecture** | Two-agent pipeline | Single-agent |
| **Phases** | Spec → Write | Research → Write |
| **Parallelism** | Per-file | Per-topic |
| **Source visibility** | Writer isolated from source | Writer sees source |
| **Skill** | vitest-guide (patterns) | documentation-guide (templates) |
| **Output** | `.test.ts` files | `.md` files |

## Extension Points

### Adding Document Review

```text
.claude/agents/
└── doc-reviewer.md    # Reviews docs for accuracy and style
```

### Adding API Doc Generation

```text
.claude/agents/
└── api-doc-generator.md  # Generates API docs from TypeScript
```

### Adding Doc Coverage Analysis

```text
.claude/agents/
└── doc-coverage.md    # Identifies undocumented features
```

## File Structure

```text
.claude/
├── commands/
│   └── write-docs.md                   # /write-docs entry point
├── skills/
│   └── documentation-guide/
│       ├── SKILL.md                    # Quick reference
│       └── references/
│           ├── style-guide.md          # Terminology, voice
│           ├── document-types.md       # Type specifications
│           ├── ui-doc-api-summary.md   # API reference
│           ├── example-patterns.md     # Demo patterns
│           └── templates/              # Document templates
│               ├── getting-started.md
│               ├── tutorial.md
│               ├── how-to-guide.md
│               ├── api-reference.md
│               ├── conceptual-guide.md
│               └── troubleshooting.md
└── agents/
    └── document-writer.md              # Topic → Documentation
```

## Usage Examples

### Basic Usage

```bash
# Generate a single tutorial
/write-docs tutorial first-component
```

### Batch Generation

```bash
# Multiple doc types for one topic (1 agent)
/write-docs batch tutorial,how-to custom-templates

# One doc type for multiple topics (parallel agents)
/write-docs batch getting-started vite,rollup,node

# Multiple types AND topics (parallel agents, each handles all types)
/write-docs batch tutorial,how-to vite,rollup
```

### Pipeline Execution

1. **User invokes command:**

   ```bash
   /write-docs batch tutorial,how-to custom-templates
   ```

2. **Command parses arguments:**
   - Mode: batch
   - Types: [tutorial, how-to]
   - Topics: [custom-templates]
   - Agents needed: 1

3. **Agent researches topic:**
   - Reads package READMEs for template APIs
   - Explores demos for real examples
   - Notes existing documentation

4. **Agent writes documents:**
   - Loads tutorial template → writes `docs/tutorials/custom-templates.md`
   - Loads how-to template → writes `docs/how-to/custom-templates.md`
   - Adds cross-references between them

5. **Verification:**

   ```text
   ✅ Documentation generated successfully!

   Files created:
   - docs/tutorials/custom-templates.md
   - docs/how-to/custom-templates.md

   Cross-references added between related documents.
   ```

### Error Handling

```text
⚠️ Some documentation could not be generated

Created:
- docs/tutorials/vite.md

Failed:
- docs/how-to/vite.md (insufficient information about advanced usage)

Options:
1. Ask me to retry the failed documents
2. Create them manually using /write-docs how-to vite
```

## Best Practices

### When Defining Topics

- Use consistent naming across documentation
- Match topic names to package/feature names
- Keep topics focused (one concept per topic)

### When Writing Documentation

- Research thoroughly before writing anything
- Use exact API names and signatures
- Include complete, runnable code examples
- Cross-reference related documentation
- Follow style guide terminology

### When Reviewing Output

- Verify code examples actually work
- Check that all template sections are filled
- Confirm cross-references are accurate
- Test any instructions by following them

## Related Documentation

- [Test Writing Agent Architecture](./test-writing-agents.md)
- [Documentation Guide Skill](../../.claude/skills/documentation-guide/SKILL.md)
- [Claude Code Agent Framework](https://docs.anthropic.com/claude-code)
