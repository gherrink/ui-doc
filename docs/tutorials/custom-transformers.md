# Tutorial: Build custom tag transformers

Learn how to extend UI-Doc's functionality by creating your own custom tag transformers. This tutorial will guide you through building transformers that add new tags to UI-Doc's documentation syntax.

## What you'll learn

By the end of this tutorial, you'll know how to:

- Understand the tag transformer interface and lifecycle
- Create a simple custom tag transformer
- Register transformers with the comment block parser
- Build a complex transformer with validation
- Access parsed tag data in your transformer

## Prerequisites

This tutorial assumes you have:

- Completed the [Getting Started](../getting-started/vite.md) guide
- Familiarity with TypeScript and the `@ui-doc/core` package
- A basic UI-Doc setup with at least one source file

## Step 1: Create a simple author tag

Start by creating a transformer for an `@author` tag that adds author information to documentation blocks.

Create a new file `author-transformer.ts`:

```ts
import type { TagTransformer } from '@ui-doc/core'

export const authorTransformer: TagTransformer = {
  name: 'author',
  transform(block, spec) {
    // Add the author information to the block
    block.author = {
      key: spec.name,
      name: spec.description || spec.name,
    }

    return block
  },
}
```

This transformer:

- Has a `name` property matching the tag name (`@author`)
- Implements a `transform` function that modifies the block
- Uses `spec.name` for the author key and `spec.description` for the display name

### Checkpoint

At this point, you should have:

- A file named `author-transformer.ts` with the transformer code
- A transformer that accepts `@author author-key Author Name` syntax

## Step 2: Register the transformer

To use your custom transformer, register it with the `CommentBlockParser` before creating your UI-Doc instance.

Update your configuration file (e.g., `vite.config.ts`):

```ts
import { CommentBlockParser, createMarkdownDescriptionParser } from '@ui-doc/core'
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'
import { authorTransformer } from './author-transformer'

// Create a custom comment block parser
const commentBlockParser = new CommentBlockParser(createMarkdownDescriptionParser())

// Register your custom transformer
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

### Checkpoint

Your configuration should now:

- Import the necessary types from `@ui-doc/core`
- Create a custom `CommentBlockParser` instance
- Register your transformer before passing it to the plugin

## Step 3: Use the tag in a doc block

Now you can use the `@author` tag in your source files. Add it to a CSS file:

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
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
}
```

The `@author` tag follows the pattern: `@author {key} {display name}` where:

- `john-doe` becomes `spec.name` (the author key)
- `John Doe` becomes `spec.description` (the display name)

### Checkpoint

When you run your build or dev server:

- UI-Doc parses the `@author` tag without errors
- The block object contains the author information
- No validation errors appear in the console

## Step 4: Add validation to your transformer

Improve your transformer by adding validation to ensure required data is present.

Update `author-transformer.ts`:

```ts
import type { TagTransformer } from '@ui-doc/core'
import { TagTransformerError } from '@ui-doc/core'

export const authorTransformer: TagTransformer = {
  name: 'author',
  transform(block, spec) {
    // Validate that the author key is provided
    if (!spec.name || spec.name.trim() === '') {
      throw new TagTransformerError(
        'Missing author key. Use @author author-key Author Name',
        'author',
      )
    }

    // Add the author information to the block
    block.author = {
      key: spec.name.trim(),
      name: spec.description?.trim() || spec.name.trim(),
    }

    return block
  },
}
```

The transformer now:

- Validates that `spec.name` is provided and not empty
- Throws a `TagTransformerError` with a helpful message if validation fails
- Trims whitespace from the values
- Falls back to using the key as the name if no description is provided

### Checkpoint

Your transformer should now:

- Throw a clear error when `@author` has no key
- Trim whitespace from author values
- Accept `@author john-doe` (without a display name)

## Step 5: Build a complex tag with type support

Create a more advanced transformer that uses the `{type}` syntax. This `@badge` tag will add visual badges to documentation blocks.

Create `badge-transformer.ts`:

```ts
import type { TagTransformer } from '@ui-doc/core'
import { TagTransformerError } from '@ui-doc/core'

const VALID_VARIANTS = ['success', 'warning', 'error', 'info'] as const
type BadgeVariant = (typeof VALID_VARIANTS)[number]

interface Badge {
  variant: BadgeVariant
  text: string
}

export const badgeTransformer: TagTransformer = {
  name: 'badge',
  transform(block, spec) {
    // Validate variant (from type)
    const variant = spec.type?.trim() || 'info'
    if (!VALID_VARIANTS.includes(variant as BadgeVariant)) {
      throw new TagTransformerError(
        `Invalid badge variant '${variant}'. Must be one of: ${VALID_VARIANTS.join(', ')}`,
        'badge',
      )
    }

    // Validate text (from description)
    const text = spec.description?.trim()
    if (!text) {
      throw new TagTransformerError('Missing badge text. Use @badge {variant} Badge Text', 'badge')
    }

    // Initialize the badges array if needed
    if (!Array.isArray(block.badges)) {
      block.badges = []
    }

    // Add the badge
    block.badges.push({
      variant: variant as BadgeVariant,
      text,
    })

    return block
  },
}
```

This transformer demonstrates:

- Using `spec.type` for the variant (from braces)
- Supporting multiple badges on one block
- Type-safe validation with TypeScript
- Providing helpful error messages

### Checkpoint

Your badge transformer should:

- Accept syntax like `@badge {success} New Feature`
- Validate that the variant is one of the allowed values
- Support multiple `@badge` tags in a single block
- Store badges in a `badges` array on the block

## Step 6: Use multiple instances of the tag

Test your badge transformer by using it multiple times in a doc block:

```css
/**
 * Alert component for displaying important messages.
 *
 * @location components.alert Alert
 * @author jane-smith Jane Smith
 * @badge {success} Stable
 * @badge {info} Accessible
 * @example
 * <div class="alert alert-success">
 *   <strong>Success!</strong> Your changes have been saved.
 * </div>
 */
.alert {
  padding: 1rem;
  border-radius: 0.25rem;
  border: 1px solid;
}
```

### Checkpoint

When parsed, the block should contain:

- An `author` object with Jane Smith's information
- A `badges` array with two badge objects
- Both transformers working together without conflicts

## Step 7: Verify the result

Register your badge transformer and verify both custom tags work:

```ts
import { CommentBlockParser, createMarkdownDescriptionParser } from '@ui-doc/core'
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'
import { authorTransformer } from './author-transformer'
import { badgeTransformer } from './badge-transformer'

const commentBlockParser = new CommentBlockParser(createMarkdownDescriptionParser())

// Register both transformers
commentBlockParser.registerTagTransformer(authorTransformer)
commentBlockParser.registerTagTransformer(badgeTransformer)

export default defineConfig({
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      blockParser: commentBlockParser,
    }),
  ],
})
```

Run your dev server:

```bash
pnpm dev
```

Check the console for any errors. If your transformers are working correctly, you should see:

- No parsing errors
- Documentation generated successfully
- Custom tag data available in the parsed blocks

## Summary

In this tutorial, you learned how to:

- Create custom tag transformers using the `TagTransformer` interface
- Register transformers with the `CommentBlockParser`
- Validate tag data and throw helpful error messages
- Use the `spec` object to access tag name, type, and description
- Build transformers that support multiple instances on one block

## Complete code

Here's the complete code from this tutorial:

<details>
<summary>author-transformer.ts</summary>

```ts
import type { TagTransformer } from '@ui-doc/core'
import { TagTransformerError } from '@ui-doc/core'

export const authorTransformer: TagTransformer = {
  name: 'author',
  transform(block, spec) {
    // Validate that the author key is provided
    if (!spec.name || spec.name.trim() === '') {
      throw new TagTransformerError(
        'Missing author key. Use @author author-key Author Name',
        'author',
      )
    }

    // Add the author information to the block
    block.author = {
      key: spec.name.trim(),
      name: spec.description?.trim() || spec.name.trim(),
    }

    return block
  },
}
```

</details>

<details>
<summary>badge-transformer.ts</summary>

```ts
import type { TagTransformer } from '@ui-doc/core'
import { TagTransformerError } from '@ui-doc/core'

const VALID_VARIANTS = ['success', 'warning', 'error', 'info'] as const
type BadgeVariant = (typeof VALID_VARIANTS)[number]

interface Badge {
  variant: BadgeVariant
  text: string
}

export const badgeTransformer: TagTransformer = {
  name: 'badge',
  transform(block, spec) {
    // Validate variant (from type)
    const variant = spec.type?.trim() || 'info'
    if (!VALID_VARIANTS.includes(variant as BadgeVariant)) {
      throw new TagTransformerError(
        `Invalid badge variant '${variant}'. Must be one of: ${VALID_VARIANTS.join(', ')}`,
        'badge',
      )
    }

    // Validate text (from description)
    const text = spec.description?.trim()
    if (!text) {
      throw new TagTransformerError('Missing badge text. Use @badge {variant} Badge Text', 'badge')
    }

    // Initialize the badges array if needed
    if (!Array.isArray(block.badges)) {
      block.badges = []
    }

    // Add the badge
    block.badges.push({
      variant: variant as BadgeVariant,
      text,
    })

    return block
  },
}
```

</details>

<details>
<summary>vite.config.ts</summary>

```ts
import { CommentBlockParser, createMarkdownDescriptionParser } from '@ui-doc/core'
import uidoc from '@ui-doc/vite'
import { defineConfig } from 'vite'
import { authorTransformer } from './author-transformer'
import { badgeTransformer } from './badge-transformer'

const commentBlockParser = new CommentBlockParser(createMarkdownDescriptionParser())

// Register both transformers
commentBlockParser.registerTagTransformer(authorTransformer)
commentBlockParser.registerTagTransformer(badgeTransformer)

export default defineConfig({
  plugins: [
    uidoc({
      source: ['src/**/*.css'],
      blockParser: commentBlockParser,
    }),
  ],
})
```

</details>

## Next steps

Continue learning with:

- [API Reference: Tag Transformers](../reference/tag-transformers.md) - Complete tag transformer API details
- [How-To: Extend the Block Type](../how-to/extend-block-type.md) - Add TypeScript types for custom tags
- [Conceptual Guide: Parser Architecture](../concepts/parser-architecture.md) - Understand how parsing works
