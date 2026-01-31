---
description: Create consumer documentation for UI-Doc. Supports single docs or batch generation across topics.
argument-hint: <type> <topic> | batch <types> <topics>
allowed-tools: Task, Read, Bash
---

# Write Documentation Command

Generate consumer documentation for the UI-Doc library using the document-writer agent for efficient, parallel documentation generation.

## Pipeline Overview

```
Arguments → Parse Mode → Group by Topic → [Document Writer Agent(s)] → Verify → Report
                              ↓
              Single topic: 1 agent handles all types
              Multiple topics: Parallel agents (1 per topic)
```

## Workflow

### Step 1: Parse Arguments

**Arguments provided:** $ARGUMENTS

Determine the mode based on argument format:

| Format | Mode | Example |
|--------|------|---------|
| `<type> <topic>` | Single | `tutorial first-component` |
| `batch <types> <topics>` | Batch | `batch tutorial,how-to vite,rollup` |

**Document types** (comma-separated in batch mode):
- `getting-started` - First-time onboarding
- `tutorial` - Step-by-step learning
- `how-to` - Task-focused guide
- `api-reference` - Technical specification
- `conceptual` - Concept explanation
- `troubleshooting` - Problem resolution
- `contributing` - Contributor guidance

### Step 2: Validate Document Types

Check that all specified types are valid. If invalid, show error and list valid types.

### Step 3: Determine Output Paths

Map document types to output directories:

| Type | Output Path |
|------|-------------|
| `getting-started` | `docs/getting-started/{topic}.md` |
| `tutorial` | `docs/tutorials/{topic}.md` |
| `how-to` | `docs/how-to/{topic}.md` |
| `api-reference` | `docs/reference/{topic}.md` |
| `conceptual` | `docs/concepts/{topic}.md` |
| `troubleshooting` | `docs/troubleshooting/{topic}.md` |
| `contributing` | `docs/contributing/{topic}.md` |

### Step 4: Group Work by Topic

Each unique topic gets ONE agent that handles all its document types.

**Why group by topic?**
- Agent researches the topic once (reads packages, demos, existing docs)
- Consistent terminology and examples across related documents
- Natural cross-references between docs on the same topic

Examples:
```
# Input: batch tutorial,how-to custom-templates
# Grouping: 1 agent → topic "custom-templates" → types [tutorial, how-to]

# Input: batch getting-started vite,rollup
# Grouping: 2 agents (parallel)
#   Agent 1 → topic "vite" → types [getting-started]
#   Agent 2 → topic "rollup" → types [getting-started]

# Input: batch tutorial,how-to vite,rollup
# Grouping: 2 agents (parallel)
#   Agent 1 → topic "vite" → types [tutorial, how-to]
#   Agent 2 → topic "rollup" → types [tutorial, how-to]
```

### Step 5: Launch Document Writer Agent(s)

**For single topic** (single or batch with one topic):

Launch ONE document-writer agent:

```
Topic: {topic}
Documents:
{for each type}
- {type} → docs/{type-directory}/{topic}.md
{end for}

Research this topic thoroughly, then write all requested documents.
Follow your documentation-guide skill templates and style guidelines.
Add cross-references between related documents.
```

**For multiple topics** (batch mode):

Launch document-writer agents IN PARALLEL using the Task tool with multiple invocations:

```
# Agent for topic 1
Topic: {topic1}
Documents:
- {type} → docs/{type-directory}/{topic1}.md
...

# Agent for topic 2 (parallel)
Topic: {topic2}
Documents:
- {type} → docs/{type-directory}/{topic2}.md
...
```

### Step 6: Verify Output

After agents complete, verify the documentation files exist:

```bash
ls -la docs/tutorials/{topic}.md docs/how-to/{topic}.md  # etc.
```

If available, run markdown lint:
```bash
pnpm lint:docs  # if this command exists
```

### Step 7: Report Results

**Success:**
```
✅ Documentation generated successfully!

Files created:
- docs/tutorials/custom-templates.md
- docs/how-to/custom-templates.md

Cross-references added between related documents.
```

**Partial success:**
```
⚠️ Some documentation could not be generated

Created:
- docs/tutorials/vite.md

Failed:
- docs/how-to/vite.md (error details)

Options:
1. Ask me to retry the failed documents
2. Create them manually using /write-docs how-to vite
```

**Error:**
```
❌ Documentation generation failed

Error: {error details}

Options:
1. Check that the topic exists in the codebase
2. Try a single document: /write-docs tutorial {topic}
```

## Usage Examples

### Single Document
```
/write-docs tutorial first-component
/write-docs conceptual doc-blocks
/write-docs getting-started vite
```

### Multiple Types, One Topic (1 agent)
```
/write-docs batch tutorial,how-to custom-templates
```
Creates:
- `docs/tutorials/custom-templates.md`
- `docs/how-to/custom-templates.md`

### One Type, Multiple Topics (parallel agents)
```
/write-docs batch getting-started vite,rollup,node
```
Creates (in parallel):
- `docs/getting-started/vite.md`
- `docs/getting-started/rollup.md`
- `docs/getting-started/node.md`

### Multiple Types AND Topics (parallel agents, each handles all types)
```
/write-docs batch tutorial,how-to vite,rollup
```
Creates (2 parallel agents):
- Agent 1: `docs/tutorials/vite.md`, `docs/how-to/vite.md`
- Agent 2: `docs/tutorials/rollup.md`, `docs/how-to/rollup.md`

## Error Handling

| Error | Response |
|-------|----------|
| Invalid document type | Show valid types, ask user to correct |
| Topic not found in codebase | Ask user to verify topic or provide context |
| Agent fails | Show error details, offer retry or manual creation |
| File already exists | Agent will update/overwrite (behavior can be customized) |

## Notes

- Agents run with the `documentation-guide` skill loaded for templates
- Each agent researches its topic independently (optimal for parallelism)
- Cross-references are added within each agent's scope
- Existing documentation files are overwritten (no merge behavior)
