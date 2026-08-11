# UI-Doc Testing Conventions

Project-specific testing patterns and conventions for the UI-Doc monorepo.

## File Organization

### Directory Structure

```
packages/<package-name>/
├── src/
│   ├── ComponentName.ts
│   └── ComponentName.types.ts
└── tests/
    └── component-name.test.ts
```

### Naming Convention

| Source File             | Test File                      |
| ----------------------- | ------------------------------ |
| `UIDoc.ts`              | `ui-doc.test.ts`               |
| `CommentBlockParser.ts` | `comment-block-parser.test.ts` |
| `HTMLRenderer.ts`       | `html-renderer.test.ts`        |
| `index.ts`              | `index.test.ts`                |

## Import Patterns

### Standard Imports

```typescript
// Import types separately
import type { BlockParser } from '../src/BlockParser.types'

import type { Renderer } from '../src/Renderer.types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Import implementation for testing
import { UIDoc } from '../src/UIDoc'
```

### Type-Only Imports for Mocks

```typescript
import type { Dirent } from 'node:fs'
// Use type imports for interfaces used in mock typing
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ViteDevServer } from 'vite'
```

## Mock Patterns

### Interface Mocking Pattern

When mocking interfaces from the project:

```typescript
import type { BlockParser } from '../src/BlockParser.types'
import type { Renderer } from '../src/Renderer.types'

// Create typed mocks
const mockBlockParser: BlockParser = {
  parse: vi.fn<BlockParser['parse']>().mockReturnValue([]),
  registerTagTransformer: vi.fn<BlockParser['registerTagTransformer']>(),
}

const mockRenderer: Renderer = {
  generate: vi.fn<Renderer['generate']>(),
}
```

### Mock Result Interface Pattern

For complex test setups, define a result interface:

```typescript
interface TestSetupResult {
  blockParser: BlockParser
  renderer: { generate: ReturnType<typeof vi.fn<Renderer['generate']>> }
  uidoc: UIDoc
}

function createTestSetup(): TestSetupResult {
  const blockParserParse = vi.fn<BlockParser['parse']>().mockReturnValue([])
  const blockParserRegister = vi.fn<BlockParser['registerTagTransformer']>()
  const rendererGenerate = vi.fn<Renderer['generate']>()

  const blockParser: BlockParser = {
    parse: blockParserParse,
    registerTagTransformer: blockParserRegister,
  }

  const renderer: Renderer = {
    generate: rendererGenerate,
  }

  const uidoc = new UIDoc({ blockParser, renderer })

  return { blockParser, renderer: { generate: rendererGenerate }, uidoc }
}
```

### File System Mocking

For `@ui-doc/node` tests:

```typescript
import type { Dirent } from 'node:fs'
import * as fs from 'node:fs/promises'

vi.spyOn(fs, 'readdir').mockResolvedValue([
  { isDirectory: () => true, isFile: () => false, name: 'subdir' } as Dirent,
  { isDirectory: () => false, isFile: () => true, name: 'file.css' } as Dirent,
])

vi.spyOn(fs, 'readFile').mockResolvedValue('file content')
```

### Plugin API Mocking

For `@ui-doc/rollup` and `@ui-doc/vite` tests:

```typescript
const mockApi = {
  version: '1.0.0',
  uidoc: mockUidoc,
  options: {
    prefix: { uri: 'ui-doc/', path: 'ui-doc/' },
    assets: [] as Array<Record<string, unknown>>,
    staticAssets: undefined,
  },
  fileSystem: mockFileSystem,
  isAssetFromInput: vi.fn().mockReturnValue(false),
  uidocAsset: vi.fn(),
  addAssetFromInput: vi.fn(),
}
```

## Testing Stateful Behavior

UI-Doc often has stateful operations. Test state transitions:

```typescript
it('should track source file changes', () => {
  const { uidoc } = createTestSetup()

  // Initial state
  uidoc.sourceCreate('file.css', 'content1')
  const entriesFirst = uidoc.entries()
  expect(Object.keys(entriesFirst)).toEqual(['foo', 'foo.bar'])

  // State after update
  uidoc.sourceUpdate('file.css', 'content2')
  const entriesSecond = uidoc.entries()
  expect(Object.keys(entriesSecond)).toEqual(['foo'])

  // State after delete
  uidoc.sourceDelete('file.css')
  const entriesThird = uidoc.entries()
  expect(Object.keys(entriesThird)).toEqual([])
})
```

## Testing Comment Block Parsing

For `@ui-doc/core` parser tests:

```typescript
describe('commentBlockParser', () => {
  it('should parse doc block with custom tag', () => {
    const input = `
/**
 * @customTag value
 * @title Example
 */
`
    const blocks = parser.parse(input)

    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toMatchObject({
      customTag: 'value',
      title: 'Example',
    })
  })
})
```

### Multiline Test Input

Use template literals for multiline test data:

```typescript
const cssInput = `
/**
 * @page Components
 * @section Buttons
 * @title Primary Button
 * @example
 * <button class="btn-primary">Click me</button>
 */
.btn-primary {
  background: blue;
}
`
```

## Testing Async Operations

### File Operations

```typescript
it('should find all matching files recursively', async () => {
  const fileFinder = new NodeFileFinder(['/test/**/*.css'])
  const onFoundMock = vi.fn()

  await fileFinder.search(onFoundMock)

  expect(onFoundMock).toHaveBeenCalledWith('/test/styles.css')
  expect(onFoundMock).toHaveBeenCalledWith('/test/components/button.css')
})
```

### Plugin Hooks

```typescript
it('should handle buildStart hook', async () => {
  const plugin = createPlugin(options)

  await plugin.buildStart?.call(context)

  expect(mockUidoc.sourceCreate).toHaveBeenCalled()
})
```

## Error Testing

### Sync Errors

```typescript
it('should throw for invalid input', () => {
  expect(() => parser.parse(null)).toThrow('Input must be a string')
})
```

### Async Errors

```typescript
it('should reject when file not found', async () => {
  vi.spyOn(fs, 'readFile').mockRejectedValue(new Error('ENOENT'))

  await expect(reader.read('/missing.css')).rejects.toThrow('ENOENT')
})
```

### Error with Specific Type

```typescript
it('should throw ParseError for malformed input', () => {
  expect(() => parser.parse(malformedInput)).toThrow(ParseError)
})
```

## Test Data Patterns

### Inline Data (Preferred)

```typescript
it('should parse entry with all fields', () => {
  const result = parser.parse(input)

  expect(result.foo).toEqual({
    id: 'foo',
    order: 0,
    sections: [
      {
        id: 'section1',
        title: 'Section 1',
        examples: [],
      },
    ],
    title: 'Foo',
    titleLevel: 1,
  })
})
```

### Helper Functions for Complex Data

```typescript
function createDocBlock(overrides = {}): DocBlock {
  return {
    page: 'default',
    section: 'main',
    title: 'Test',
    example: '<div>test</div>',
    ...overrides,
  }
}
```

## Package-Specific Patterns

### @ui-doc/core

- Test `CommentBlockParser` with various doc block formats
- Test `UIDoc` class state management (create/update/delete sources)
- Test tag transformers with custom tags

### @ui-doc/node

- Mock `fs` module for file operations
- Test glob pattern matching
- Test file discovery callbacks

### @ui-doc/html-renderer

- Test HTML output generation
- Test template rendering
- Test asset handling

### @ui-doc/rollup

- Mock Rollup plugin context
- Test build hooks (buildStart, transform, generateBundle)
- Test options resolution

### @ui-doc/vite

- Wrap rollup plugin tests
- Test Vite-specific hooks (configureServer)
- Test dev server integration

## Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @ui-doc/core test

# Watch mode
pnpm --filter @ui-doc/core test -- --watch

# With coverage
pnpm --filter @ui-doc/core test -- --coverage
```
