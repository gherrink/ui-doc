# How to create custom tag transformers

Extend UI-Doc's documentation syntax with custom tags by creating your own tag transformers.

## Overview

Tag transformers allow you to define custom tags that extend UI-Doc's built-in documentation features. By creating a transformer, you can add new data to documentation blocks that matches your specific needs.

**Use this guide when you want to:**

- Add custom metadata to documentation blocks (authors, version info, status badges)
- Create domain-specific tags for your project
- Extend UI-Doc without modifying core functionality
- Integrate external data sources into your documentation

## Prerequisites

Before starting, ensure you have:

- A working UI-Doc setup with `@ui-doc/vite` or `@ui-doc/rollup`
- Basic TypeScript knowledge
- Understanding of UI-Doc's doc block syntax (see [Getting Started](../getting-started/vite.md))

## Solution

### Step 1: Create your transformer file

Create a new file for your custom transformer. For this example, we'll create an `@author` tag that adds author information to documentation blocks.

```ts
// author-transformer.ts
import type { TagTransformer } from '@ui-doc/core'

export const authorTransformer: TagTransformer = {
  name: 'author',
  transform(block, spec) {
    block.author = {
      key: spec.name,
      name: spec.description || spec.name,
    }

    return block
  },
}
```

The transformer interface requires:

- `name` - The tag name (without the `@` symbol)
- `transform` - A function that modifies the block based on parsed tag data

### Step 2: Understand the spec object

The `spec` parameter contains parsed tag information from the comment-parser library:

```ts
// For a tag like: @author john-doe John Doe
spec = {
  tag: 'author', // The tag name
  name: 'john-doe', // First value after tag
  type: '', // Value in braces {type}
  description: 'John Doe', // Remaining text
}
```

Access these properties to extract tag data:

- `spec.name` - Primary identifier (required for most tags)
- `spec.description` - Description text after the name
- `spec.type` - Type annotation in braces `{type}`

### Step 3: Register the transformer

Create a custom `CommentBlockParser` instance and register your transformer before passing it to UI-Doc.

**For Vite:**

```ts
import { CommentBlockParser, createMarkdownDescriptionParser } from '@ui-doc/core'
import uidoc from '@ui-doc/vite'
// vite.config.ts
import { defineConfig } from 'vite'
import { authorTransformer } from './author-transformer'

const commentBlockParser = new CommentBlockParser(
  createMarkdownDescriptionParser(),
)

commentBlockParser.registerTagTransformer(authorTransformer)

export default defineConfig({
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      blockParser: commentBlockParser,
    }),
  ],
})
```

**For Rollup:**

```js
import { CommentBlockParser, createMarkdownDescriptionParser } from '@ui-doc/core'
// rollup.config.js
import uidoc from '@ui-doc/rollup'
import { authorTransformer } from './author-transformer'

const commentBlockParser = new CommentBlockParser(
  createMarkdownDescriptionParser(),
)

commentBlockParser.registerTagTransformer(authorTransformer)

export default {
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      blockParser: commentBlockParser,
    }),
  ],
}
```

### Step 4: Use your custom tag

Add the custom tag to your doc blocks:

```css
/**
 * Primary button component with brand styling.
 *
 * @location components.button.primary Primary Button
 * @author john-doe John Doe
 * @example
 * <button class="btn btn-primary">Save Changes</button>
 */
.btn-primary {
  background: var(--color-primary);
  color: white;
}
```

### Result

When UI-Doc parses this block, your transformer adds the author data:

```text
// Resulting block object
{
  key: 'components.button.primary',
  title: 'Primary Button',
  location: 'components.button.primary',
  author: {
    key: 'john-doe',
    name: 'John Doe',
  },
  example: { /* ... */ },
  // ... other properties
}
```

## Variations

### Add validation to your transformer

Ensure required data is present and throw helpful errors when validation fails:

```ts
import type { TagTransformer } from '@ui-doc/core'
import { TagTransformerError } from '@ui-doc/core'

export const authorTransformer: TagTransformer = {
  name: 'author',
  transform(block, spec) {
    if (!spec.name || spec.name.trim() === '') {
      throw new TagTransformerError(
        'Missing author key. Use @author author-key Author Name',
        'author',
      )
    }

    block.author = {
      key: spec.name.trim(),
      name: spec.description?.trim() || spec.name.trim(),
    }

    return block
  },
}
```

`TagTransformerError` provides clear error messages during parsing with line numbers and context.

### Support multiple tag instances

Create transformers that allow multiple instances of the same tag in one block:

```ts
import type { TagTransformer } from '@ui-doc/core'
import { TagTransformerError } from '@ui-doc/core'

const VALID_VARIANTS = ['success', 'warning', 'error', 'info'] as const

export const badgeTransformer: TagTransformer = {
  name: 'badge',
  transform(block, spec) {
    // Validate variant from {type}
    const variant = spec.type?.trim() || 'info'
    if (!VALID_VARIANTS.includes(variant)) {
      throw new TagTransformerError(
        `Invalid badge variant '${variant}'. Must be one of: ${VALID_VARIANTS.join(', ')}`,
        'badge',
      )
    }

    // Validate text from description
    const text = spec.description?.trim()
    if (!text) {
      throw new TagTransformerError(
        'Missing badge text. Use @badge {variant} Badge Text',
        'badge',
      )
    }

    // Initialize badges array if needed
    if (!Array.isArray(block.badges)) {
      block.badges = []
    }

    // Add the badge
    block.badges.push({
      variant,
      text,
    })

    return block
  },
}
```

Usage:

```css
/**
 * Alert component for important messages.
 *
 * @location components.alert Alert
 * @badge {success} Stable
 * @badge {info} Accessible
 * @example
 * <div class="alert">Message</div>
 */
.alert { /* ... */ }
```

### Use utility functions for common patterns

UI-Doc provides utility functions for common transformer patterns:

```ts
import type { TagTransformer } from '@ui-doc/core'
import { createTagTransformerError, identifier } from '@ui-doc/core'

export const statusTransformer: TagTransformer = {
  name: 'status',
  transform(block, spec) {
    // identifier() extracts key and name, throwing errors if name is missing
    const { key, name } = identifier(spec)

    block.status = {
      key, // Lowercase version of spec.name
      name, // spec.description or spec.name
    }

    return block
  },
}
```

Available utilities:

- `identifier(spec)` - Extract key/name pair with validation
- `code(spec)` - Parse code content from spec.description
- `createTagTransformerError(message, spec)` - Create errors with line numbers
- `trimDescription(text)` - Remove leading `-` or `|` from descriptions

### Access complex type data

Parse complex type annotations from the `{type}` field:

```ts
export const linkTransformer: TagTransformer = {
  name: 'link',
  transform(block, spec) {
    // For @link {external|docs} url-key Documentation
    const [linkType, category] = spec.type.split('|')

    if (!Array.isArray(block.links)) {
      block.links = []
    }

    block.links.push({
      type: linkType?.trim() || 'internal',
      category: category?.trim(),
      key: spec.name,
      text: spec.description || spec.name,
    })

    return block
  },
}
```

Usage:

```css
/**
 * @location components.modal Modal
 * @link {external|docs} https://example.com See full documentation
 * @link {internal|api} /api/modal API Reference
 */
```

## Troubleshooting

### Transformer not found error

If you see `Undefined tag type 'tagname'`, ensure:

- You registered the transformer before creating the UI-Doc instance
- The transformer's `name` property matches the tag (without `@`)
- You passed the custom `blockParser` to the UI-Doc plugin

```ts
// Correct order
const parser = new CommentBlockParser(createMarkdownDescriptionParser())
parser.registerTagTransformer(myTransformer) // Register first
uidoc({ blockParser: parser }) // Then pass to plugin
```

### Block data not appearing in output

Custom transformer data is added to the block but not automatically rendered. To display custom data:

1. Access it via the `context-entry` event
2. Use a custom renderer or template
3. Add generate functions to format the data

```ts
// Example: Log custom data via events
uidoc.on('context-entry', ({ entry }) => {
  if (entry.author) {
    console.log(`Author: ${entry.author.name}`)
  }
})
```

### TagTransformerError not showing helpful details

Always throw `TagTransformerError` (not generic `Error`) for best error messages:

```ts
// Good - includes line numbers and context
throw new TagTransformerError('Missing required field', 'tagname')

// Avoid - generic error without context
throw new Error('Missing required field')
```

## Related guides

- [Tutorial: Build custom tag transformers](../tutorials/custom-transformers.md) - Step-by-step learning guide
- [API Reference: TagTransformer](../reference/core-api.md#tagtransformer) - Complete API specification
- [How-To: Extend the Block Type](../how-to/extend-block-type.md) - Add TypeScript types for custom properties
- [Core package README](../../packages/core/README.md#custom-tags) - Additional transformer examples
