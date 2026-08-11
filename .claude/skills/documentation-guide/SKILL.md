---
name: documentation-guide
description: Create documentation for UI-Doc consumers. Supports tutorials, guides, API references, and troubleshooting docs. Use when writing, improving, or planning user documentation, or when asked to "document", "write docs", or "create a guide".
allowed-tools:
  - Write
  - Edit
  - Read
  - Glob
  - Grep
---

# Document Writer Skill

Create high-quality consumer documentation for the UI-Doc library. This skill provides templates, style guidelines, and API references to generate consistent, helpful documentation.

## Quick Reference

**Output Location:** `docs/{type}/` subdirectories at project root
**Document Types:** Getting Started, Tutorial, How-To Guide, API Reference, Conceptual Guide, Troubleshooting

| Type             | Purpose                  | When to Use                        |
| ---------------- | ------------------------ | ---------------------------------- |
| Getting Started  | First-time onboarding    | New users installing UI-Doc        |
| Tutorial         | Step-by-step learning    | Teaching a complete workflow       |
| How-To Guide     | Task-oriented solutions  | Solving a specific problem         |
| API Reference    | Technical specification  | Documenting tags, options, APIs    |
| Conceptual Guide | Core concept explanation | Explaining architecture/philosophy |
| Troubleshooting  | Problem resolution       | Common issues and fixes            |
| Contributing     | Contributor guidance     | Project contribution workflows     |

## Workflow

### 1. Determine Document Type

Ask the user or infer from context what type of documentation is needed. If unclear, ask:

- Is this for new users learning the basics? → **Getting Started**
- Is this teaching a complete workflow from start to finish? → **Tutorial**
- Is this solving a specific task or problem? → **How-To Guide**
- Is this documenting technical details (tags, options, APIs)? → **API Reference**
- Is this explaining a concept or architecture? → **Conceptual Guide**
- Is this addressing errors or common issues? → **Troubleshooting**
- Is this about contributing to the project itself? → **Contributing**

### 2. Research the Topic

Before writing, gather accurate information:

- Read relevant package READMEs in `packages/*/README.md`
- Check existing demos in `demos/` for real examples
- Verify code examples work with current API
- Note any prerequisites or dependencies

### 3. Use the Appropriate Template

Load the template from `references/templates/` matching the document type:

- `getting-started.md` - For onboarding guides
- `tutorial.md` - For step-by-step tutorials
- `how-to-guide.md` - For task-focused guides
- `api-reference.md` - For technical documentation
- `conceptual-guide.md` - For concept explanations
- `troubleshooting.md` - For issue resolution
- `contributing.md` - For contributor workflows

### 4. Write Following Style Guidelines

Apply conventions from `references/style-guide.md`:

- Use "doc block" (not "comment block")
- Write in second person ("you") for instructions
- Keep sentences concise and direct
- Include working code examples
- Add cross-references to related documentation

### 5. Output to Correct Location

Save documentation files to the appropriate `docs/` subdirectory:

- `docs/getting-started/vite.md`
- `docs/tutorials/first-component.md`
- `docs/how-to/custom-templates.md`
- `docs/troubleshooting/common-issues.md`

## File Naming Conventions

| Type             | Directory          | Filename       | Example                           |
| ---------------- | ------------------ | -------------- | --------------------------------- |
| Getting Started  | `getting-started/` | `{topic}.md`   | `getting-started/vite.md`         |
| Tutorial         | `tutorials/`       | `{topic}.md`   | `tutorials/first-component.md`    |
| How-To Guide     | `how-to/`          | `{task}.md`    | `how-to/custom-templates.md`      |
| API Reference    | `reference/`       | `{subject}.md` | `reference/tags.md`               |
| Conceptual Guide | `concepts/`        | `{topic}.md`   | `concepts/doc-blocks.md`          |
| Troubleshooting  | `troubleshooting/` | `{area}.md`    | `troubleshooting/assets.md`       |
| Contributing     | `contributing/`    | `{topic}.md`   | `contributing/branching-model.md` |

## Code Example Standards

All code examples must:

1. Be complete and runnable (not snippets that require guessing)
2. Use realistic variable names and content
3. Match the current API (verify against package READMEs)
4. Include necessary imports
5. Follow project conventions (ES modules, modern JavaScript)

Example of a good doc block:

```css
/**
 * Primary action button with brand colors.
 *
 * @location components.button.primary Primary Button
 * @example
 * <button class="btn btn-primary">Save Changes</button>
 */
.btn-primary {
  background: var(--color-primary);
  color: white;
}
```

## Reference Materials

- [Style Guide](./references/style-guide.md) - Writing conventions and terminology
- [Document Types](./references/document-types.md) - Detailed specifications per type
- [UI-Doc API Summary](./references/ui-doc-api-summary.md) - Quick API reference
- [Example Patterns](./references/example-patterns.md) - Real patterns from demos

## Quality Checklist

Before completing documentation:

- [ ] Follows appropriate template structure
- [ ] Uses correct terminology from style guide
- [ ] All code examples are accurate and complete
- [ ] Prerequisites are clearly stated
- [ ] Cross-references to related docs included
- [ ] File named according to convention
- [ ] Saved to appropriate `docs/{type}/` subdirectory
