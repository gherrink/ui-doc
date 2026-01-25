# Getting Started Template

Use this template for first-time user onboarding documentation.

---

# Getting Started with UI-Doc [for Vite/Rollup/Node]

[1-2 sentence introduction: what UI-Doc does and what the reader will accomplish]

## Prerequisites

Before you begin, make sure you have:

- Node.js [version] or later
- [Build tool] installed and configured
- [Any other requirements]

## What you'll build

In this guide, you'll:

1. [First outcome]
2. [Second outcome]
3. [Third outcome - typically "view your documentation"]

## Installation

Install UI-Doc and its dependencies:

```bash
# npm
npm install --save-dev [packages]

# yarn
yarn add --dev [packages]

# pnpm
pnpm install --save-dev [packages]
```

## Basic setup

[Brief explanation of what this configuration does]

```text
// [config file name]
[Minimal working configuration]
```

## Write your first doc block

Create a CSS file (or add to an existing one) with a documentation block:

```css
/* src/styles.css */
/**
 * [Description of what this documents]
 *
 * @page [key] [Title]
 */

/**
 * [Component description]
 *
 * @location [page.section] [Section Title]
 * @example
 * [HTML example]
 */
.[class-name] {
  /* styles */
}
```

### Understanding the doc block

- `@page` creates a documentation page with the given title
- `@location` places content on a page and creates a section
- `@example` shows a live preview with the code below it

## View your documentation

Start the development server:

```bash
[start command]
```

Open your browser to [URL]. You should see:

- [What the reader should see]
- [Navigation or other elements]
- [The example they just created]

## Next steps

Now that you have UI-Doc running:

- [Link to tutorial] - Learn to document a complete component
- [Link to tag reference] - See all available documentation tags
- [Link to how-to guides] - Solve specific problems

---

## Template usage notes

**Keep it short:** This guide should take under 10 minutes to complete.

**One example only:** Don't show multiple ways to do the same thing.

**Verify commands:** Ensure all commands work with the current version.

**End with success:** The reader must have something working at the end.
