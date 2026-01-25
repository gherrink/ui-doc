---
name: test-patterns
description: Vitest testing patterns and UI-Doc conventions for writing comprehensive, type-safe tests. Use when writing or reviewing tests.
---

# Test Patterns Skill

Write comprehensive Vitest tests following UI-Doc project conventions. This skill provides patterns for mocking, assertions, and test organization.

## Quick Reference

**Framework:** Vitest with TypeScript
**Test Location:** `packages/*/tests/*.test.ts`
**Run Tests:** `pnpm test` or `pnpm --filter @ui-doc/<package> test`

## Core Patterns

### Test Structure

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('componentName', () => { // Use camelCase starting lowercase
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('methodName', () => {
    it('should [expected behavior]', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Throw-Only Functions

Functions that only throw need explicit `never` return type:

```typescript
// Testing error throwing
function throwError(): never {
  throw new CustomError('message')
}

expect(throwError).toThrow(CustomError)
```

### Type-Safe Mocking

```typescript
// Function mock with type inference
const mockFn = vi.fn<ClassName['methodName']>()

// Mock with return value
const mockParse = vi.fn<Parser['parse']>().mockReturnValue([])

// Sequential return values
vi.fn<Reader['read']>()
  .mockReturnValueOnce(firstResult)
  .mockReturnValueOnce(secondResult)
```

### Module Mocking

```typescript
// Full module mock (hoisted)
vi.mock('@ui-doc/core', () => ({
  UIDoc: vi.fn(),
}))

// Spy on specific method
vi.spyOn(fs, 'readFile').mockResolvedValue('content')
```

## Naming Conventions

- **Files:** kebab-case matching source: `UIDoc.ts` → `ui-doc.test.ts`
- **Describe blocks:** Component/function name
- **Test titles:** `'should [action] when [condition]'`

## Assertions

```typescript
// Value equality
expect(result).toEqual(expected)
expect(result).toBe(exactValue)

// Mock verification
expect(mockFn).toHaveBeenCalledWith(arg1, arg2)
expect(mockFn).toHaveBeenCalledTimes(2)

// Object matching
expect(obj).toMatchObject({ key: 'value' })

// Type checking
expect(instance).toBeInstanceOf(ClassName)

// Async errors
await expect(asyncFn()).rejects.toThrow('error message')
```

See [vitest-patterns.md](./references/vitest-patterns.md) for comprehensive patterns.
See [ui-doc-conventions.md](./references/ui-doc-conventions.md) for project-specific conventions.
