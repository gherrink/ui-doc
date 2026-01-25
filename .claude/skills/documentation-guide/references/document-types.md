# Document Types

Detailed specifications for each type of documentation.

## Decision Flowchart

Use this flowchart to choose the right document type:

```
Is the reader new to UI-Doc?
├─ Yes → Is this their first time setting up?
│        ├─ Yes → Getting Started
│        └─ No → Are they learning a complete workflow?
│                ├─ Yes → Tutorial
│                └─ No → Go to "Is this task-focused?"
│
└─ No → Is this task-focused?
        ├─ Yes → How-To Guide
        └─ No → Is this technical reference?
                ├─ Yes → API Reference
                └─ No → Is this explaining a concept?
                        ├─ Yes → Conceptual Guide
                        └─ No → Troubleshooting
```

---

## Getting Started

**Purpose:** Help new users install and run UI-Doc for the first time.

**Audience:** Developers who have never used UI-Doc before.

**Outcome:** Reader has a working UI-Doc setup and understands the basic workflow.

### Required Sections

1. **Prerequisites** - What the reader needs (Node.js version, build tool)
2. **What You'll Build** - Brief description of the end result
3. **Installation** - Exact commands to install packages
4. **Basic Setup** - Minimal configuration to get started
5. **Write Your First Doc Block** - Create one working example
6. **View Your Documentation** - How to see the results
7. **Next Steps** - Links to tutorials and advanced topics

### Guidelines

- Keep it under 10 minutes to complete
- Show the minimum viable configuration
- Use one simple, realistic example
- Avoid advanced features or customization
- End with a working, viewable result

### Anti-Patterns

- Don't explain every option available
- Don't show multiple ways to do the same thing
- Don't include troubleshooting (link to it instead)
- Don't assume familiarity with similar tools

---

## Tutorial

**Purpose:** Teach a complete workflow or skill through guided practice.

**Audience:** Users who have basic UI-Doc knowledge and want to learn more.

**Outcome:** Reader has learned a skill they can apply to their own projects.

### Required Sections

1. **What You'll Learn** - List of skills covered
2. **Prerequisites** - Required knowledge and setup
3. **Steps** - Numbered, sequential instructions
4. **Summary** - Recap of what was covered
5. **Next Steps** - Where to go from here

### Guidelines

- Each step builds on the previous
- Show complete code at each stage
- Explain *why* as well as *how*
- Include checkpoints ("Your file should now look like...")
- Keep to 15-30 minutes of active work

### Anti-Patterns

- Don't skip steps or assume knowledge
- Don't branch into optional topics
- Don't cover multiple unrelated features
- Don't leave the reader with broken code

---

## How-To Guide

**Purpose:** Show how to accomplish a specific task.

**Audience:** Users who know what they want to do but need instructions.

**Outcome:** Reader has solved their specific problem.

### Required Sections

1. **Overview** - What this guide accomplishes
2. **Prerequisites** - What the reader needs
3. **Solution** - Step-by-step instructions
4. **Variations** (optional) - Alternative approaches
5. **Related Guides** - Links to similar topics

### Guidelines

- Start with the problem, not the solution
- Be task-focused: "How to X"
- Provide complete, working code
- Keep it focused on one task
- Can assume existing UI-Doc knowledge

### Anti-Patterns

- Don't teach concepts (link to conceptual guides)
- Don't explain unrelated features
- Don't include lengthy background
- Don't assume a specific project structure

### Example Topics

- How to add custom templates
- How to include custom styles in examples
- How to configure syntax highlighting themes
- How to organize documentation by component

---

## API Reference

**Purpose:** Document technical details precisely and completely.

**Audience:** Users looking up specific details.

**Outcome:** Reader finds the exact information they need.

### Required Sections

1. **Overview** - What this reference covers
2. **Reference Content** - Tables, signatures, parameters
3. **Examples** - Usage examples for each item

### Guidelines

- Be exhaustive within scope
- Use consistent formatting (tables preferred)
- Include type information
- Show at least one example per item
- Keep descriptions concise

### Anti-Patterns

- Don't include tutorials or conceptual content
- Don't skip items for brevity
- Don't use inconsistent formatting
- Don't assume context

### Content Types

**For Tags:**
| Tag | Role | Syntax | Description |
|-----|------|--------|-------------|
| @example | display | `@example\n<html>` | Shows live preview and code |

**For Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| source | `string[]` | Required | Glob patterns for source files |

**For Functions/Methods:**
```
methodName(param1: Type, param2: Type): ReturnType
```

---

## Conceptual Guide

**Purpose:** Explain ideas, architecture, and design decisions.

**Audience:** Users who want to understand how UI-Doc works.

**Outcome:** Reader understands a concept and can apply it.

### Required Sections

1. **What Is X?** - Definition and context
2. **How It Works** - Explanation of mechanics
3. **Why It Matters** - Practical implications
4. **Examples** - Concrete illustrations
5. **Related Concepts** - Links to related topics

### Guidelines

- Start with the "what" before the "how"
- Use diagrams when helpful
- Connect to practical applications
- Build from simple to complex

### Anti-Patterns

- Don't include step-by-step instructions
- Don't assume the reader already understands
- Don't go too deep into implementation details
- Don't skip practical examples

### Example Topics

- Understanding doc blocks
- How UI-Doc processes source files
- The rendering pipeline
- Template customization architecture

---

## Troubleshooting

**Purpose:** Help users diagnose and fix problems.

**Audience:** Users encountering errors or unexpected behavior.

**Outcome:** Reader has resolved their issue.

### Required Sections

1. **Problem** - Clear description of the issue
2. **Symptoms** - How the problem manifests
3. **Causes** - Why this happens
4. **Solutions** - How to fix it
5. **Prevention** (optional) - How to avoid in future

### Guidelines

- Lead with the symptom (what the user sees)
- Include error messages verbatim
- Provide multiple solutions if applicable
- Order solutions from most to least likely
- Test all solutions before documenting

### Anti-Patterns

- Don't bury the solution in explanation
- Don't assume the user understands the cause
- Don't provide untested solutions
- Don't skip common issues

### Format Example

```markdown
## Documentation not showing in dev server

### Symptoms
- Browser shows 404 when accessing `/ui-doc/`
- No UI-Doc output in terminal

### Causes
1. `output.baseUri` set to `'.'` in dev mode
2. Source patterns don't match any files

### Solutions

**If baseUri is misconfigured:**
```js
uidoc({
  output: {
    baseUri: command === 'serve' ? undefined : '.',
  },
})
```

**If source patterns are wrong:**
Check that your glob patterns match existing files...
```
