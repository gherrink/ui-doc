# Documentation Style Guide

Writing conventions and standards for UI-Doc documentation.

## Voice and Tone

### Be Direct and Helpful

Write concisely. Get to the point quickly. Every sentence should add value.

**Good:**

> Add the plugin to your Vite config and specify your source files.

**Avoid:**

> In this section, we will discuss how you might want to consider adding the plugin to your Vite configuration file, which will allow you to specify which source files should be processed.

### Use Second Person

Address the reader as "you" for instructions and guidance.

**Good:**

> You can customize the output directory using the `output.dir` option.

**Avoid:**

> The user can customize the output directory using the `output.dir` option.
> One can customize the output directory using the `output.dir` option.

### Use Active Voice

Active voice is clearer and more direct.

**Good:**

> UI-Doc parses your CSS files and extracts documentation.

**Avoid:**

> Your CSS files are parsed by UI-Doc and documentation is extracted.

### Be Confident

State facts directly. Avoid hedging language unless uncertainty is genuinely warranted.

**Good:**

> This configuration generates documentation in `dist/docs/`.

**Avoid:**

> This configuration should probably generate documentation in `dist/docs/`.

## Terminology

Use consistent terminology throughout all documentation.

| Use         | Don't Use                                    |
| ----------- | -------------------------------------------- |
| doc block   | comment block, documentation block, docblock |
| tag         | annotation, decorator                        |
| page        | route, view                                  |
| section     | panel, block, area                           |
| example     | preview, demo, sample                        |
| source file | input file                                   |
| UI-Doc      | UIDoc, ui-doc, uidoc (except in code)        |

### Package Names

Always use the full npm package name in prose:

- `@ui-doc/core`
- `@ui-doc/vite`
- `@ui-doc/rollup`
- `@ui-doc/html-renderer`
- `@ui-doc/node`

## Formatting

### Headers

Use sentence case for headers (capitalize first word only):

**Good:**

> ## Getting started with Vite

**Avoid:**

> ## Getting Started With Vite

### Code Blocks

Always specify the language for syntax highlighting:

````markdown
```js
import uidoc from '@ui-doc/vite'
```
````

For configuration files, use the appropriate language:

- JavaScript configs: `js`
- TypeScript configs: `ts`
- CSS files: `css`
- HTML examples: `html`
- Shell commands: `bash`

### Inline Code

Use backticks for:

- File names: `vite.config.js`
- Package names: `@ui-doc/vite`
- Option names: `output.dir`
- Tag names: `@example`
- Variable names: `baseUri`
- Commands: `pnpm build`

### Lists

Use unordered lists for items without sequence:

- Option A
- Option B
- Option C

Use ordered lists for sequential steps:

1. Install the package
2. Configure the plugin
3. Run the dev server

### Tables

Use tables for structured reference information:

| Option     | Type       | Default    | Description                    |
| ---------- | ---------- | ---------- | ------------------------------ |
| source     | `string[]` | Required   | Glob patterns for source files |
| output.dir | `string`   | `'ui-doc'` | Output directory               |

### Admonitions

Use blockquotes with bold labels for important notes:

> **Note:** This feature requires Vite 5.0 or later.

> **Warning:** This will overwrite existing files.

> **Tip:** Use relative paths for portable documentation.

## Code Examples

### Be Complete

Include all necessary imports and setup:

**Good:**

```js
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
    }),
  ],
})
```

**Avoid:**

```js
uidoc({
  source: ['src/**/*.css'],
})
```

### Use Realistic Content

Use realistic, meaningful values in examples:

**Good:**

```css
/**
 * Primary button for form submissions and main actions.
 *
 * @location components.button.primary Primary Button
 * @example
 * <button class="btn btn-primary">Save Changes</button>
 */
```

**Avoid:**

```css
/**
 * Foo bar baz
 *
 * @location foo.bar Foo
 * @example
 * <div class="foo">Test</div>
 */
```

### Show Expected Output

When helpful, show what the user should expect:

```bash
$ pnpm dev

  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  UI-Doc:  http://localhost:5173/ui-doc/
```

## Cross-References

### Internal Links

Link to related documentation within the project:

> See [Tag Reference](./reference-tags.md) for all available tags.

### External Links

For external resources, include the full URL:

> Visit the [Vite documentation](https://vite.dev/config/) for configuration options.

### Package READMEs

Reference package READMEs for detailed API information:

> See the [@ui-doc/core documentation](../packages/core/README.md) for the complete API reference.

## Document Structure

### Always Include

Every document should have:

1. **Title** - Clear, descriptive H1 header
2. **Introduction** - What this document covers and who it's for
3. **Prerequisites** (if applicable) - What the reader needs before starting
4. **Main Content** - The body of the document
5. **Next Steps** or **Related** - Where to go from here

### Section Length

Keep sections focused:

- Aim for 2-4 paragraphs per section
- Use subsections for longer topics
- If a section exceeds 500 words, consider splitting it

## Writing Checklist

Before finalizing documentation:

- [ ] Terminology matches the glossary
- [ ] Code examples are complete and tested
- [ ] Headers use sentence case
- [ ] Links are valid and helpful
- [ ] Voice is direct and uses "you"
- [ ] No unnecessary words or hedging
