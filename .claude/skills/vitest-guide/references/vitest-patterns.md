# Vitest Patterns Reference

Comprehensive patterns for writing Vitest tests in TypeScript.

## Test Organization

### Basic Structure

```typescript
import type { SomeType } from '../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('moduleName', () => {
  // Use camelCase starting lowercase
  // Setup/teardown
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Group related tests
  describe('methodName', () => {
    it('should handle the happy path', () => {
      // test
    })

    it('should handle edge case X', () => {
      // test
    })

    it('should throw when invalid input', () => {
      // test
    })
  })
})
```

### Nested Describe Blocks

Use nested `describe` blocks to organize tests by feature or method:

```typescript
describe('parser', () => {
  // Use camelCase starting lowercase
  describe('parse', () => {
    describe('when input is valid', () => {
      it('should return parsed result', () => {})
    })

    describe('when input is invalid', () => {
      it('should throw ParseError', () => {})
    })
  })

  describe('validate', () => {
    it('should return true for valid input', () => {})
  })
})
```

## Mocking Strategies

### Function Mocks with vi.fn()

```typescript
// Basic mock
const mockFn = vi.fn()

// Type-safe mock (recommended)
const mockParse = vi.fn<Parser['parse']>()

// With return value
const mockRead = vi.fn<Reader['read']>().mockReturnValue('content')

// With implementation
const mockCalculate = vi.fn<Calculator['calc']>().mockImplementation((a, b) => a + b)

// Sequential return values (for testing state changes)
const mockFetch = vi
  .fn<Fetcher['fetch']>()
  .mockReturnValueOnce({ status: 'pending' })
  .mockReturnValueOnce({ status: 'complete' })
  .mockReturnValueOnce({ status: 'archived' })
```

### Spying with vi.spyOn()

```typescript
import * as fs from 'node:fs/promises'

// Spy on module method
vi.spyOn(fs, 'readFile').mockResolvedValue('file content')

// Spy with implementation
vi.spyOn(console, 'log').mockImplementation(() => {})

// Spy on object method
const obj = { method: () => 'original' }
vi.spyOn(obj, 'method').mockReturnValue('mocked')
```

### Module Mocking with vi.mock()

```typescript
// Mock entire module (hoisted to top)
vi.mock('@ui-doc/core', () => ({
  UIDoc: vi.fn().mockImplementation(() => ({
    parse: vi.fn(),
    render: vi.fn(),
  })),
  CONSTANT: 'mocked-value',
}))

// Mock with factory function
vi.mock('./utils', () => {
  return {
    formatDate: vi.fn().mockReturnValue('2024-01-01'),
    parseDate: vi.fn().mockReturnValue(new Date()),
  }
})
```

### Mock Objects for Interfaces

```typescript
interface FileSystem {
  read: (path: string) => Promise<string>
  write: (path: string, content: string) => Promise<void>
  exists: (path: string) => Promise<boolean>
}

// Create mock implementing interface
const mockFileSystem: FileSystem = {
  read: vi.fn<FileSystem['read']>().mockResolvedValue(''),
  write: vi.fn<FileSystem['write']>().mockResolvedValue(undefined),
  exists: vi.fn<FileSystem['exists']>().mockResolvedValue(true),
}
```

### Mocking File System Operations

```typescript
import type { Dirent } from 'node:fs'

vi.spyOn(fs, 'readdir').mockResolvedValue([
  { isDirectory: () => true, isFile: () => false, name: 'subdir' } as Dirent,
  { isDirectory: () => false, isFile: () => true, name: 'file.ts' } as Dirent,
])
```

## Assertions

### Value Assertions

```typescript
// Exact equality (same reference)
expect(result).toBe(expected)

// Deep equality (same value)
expect(result).toEqual({ key: 'value' })

// Partial matching
expect(result).toMatchObject({ key: 'value' })

// Truthiness
expect(result).toBeTruthy()
expect(result).toBeFalsy()
expect(result).toBeNull()
expect(result).toBeUndefined()
expect(result).toBeDefined()

// Numbers
expect(result).toBeGreaterThan(5)
expect(result).toBeLessThanOrEqual(10)
expect(result).toBeCloseTo(0.3, 5) // floating point

// Strings
expect(result).toMatch(/pattern/)
expect(result).toContain('substring')

// Arrays
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(array).toEqual(expect.arrayContaining([1, 2]))
```

### Mock Assertions

```typescript
// Called
expect(mockFn).toHaveBeenCalled()
expect(mockFn).not.toHaveBeenCalled()

// Call count
expect(mockFn).toHaveBeenCalledTimes(2)

// Arguments
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
expect(mockFn).toHaveBeenLastCalledWith('final', 'args')
expect(mockFn).toHaveBeenNthCalledWith(1, 'first', 'call')

// Return value verification
expect(mockFn).toHaveReturnedWith(expectedValue)
```

### Error Assertions

```typescript
// Sync errors
expect(() => throwingFn()).toThrow()
expect(() => throwingFn()).toThrow('error message')
expect(() => throwingFn()).toThrow(CustomError)

// Async errors
await expect(asyncThrowingFn()).rejects.toThrow()
await expect(asyncThrowingFn()).rejects.toThrow('error message')
await expect(asyncThrowingFn()).rejects.toBeInstanceOf(CustomError)
```

### Type Assertions

```typescript
// Instance checking
expect(result).toBeInstanceOf(ClassName)

// Type narrowing in tests
expect(typeof result).toBe('string')
expect(Array.isArray(result)).toBe(true)
```

## Async Testing

### Promises

```typescript
it('should resolve with data', async () => {
  const result = await fetchData()
  expect(result).toEqual({ data: 'value' })
})

it('should reject with error', async () => {
  await expect(fetchInvalidData()).rejects.toThrow('Not found')
})
```

### Mock Async Functions

```typescript
// Resolved value
const mockFetch = vi.fn<Fetcher['fetch']>().mockResolvedValue({ data: [] })

// Rejected value
const mockFetch = vi.fn<Fetcher['fetch']>().mockRejectedValue(new Error('Network error'))

// Sequential async values
const mockFetch = vi
  .fn<Fetcher['fetch']>()
  .mockResolvedValueOnce({ status: 'loading' })
  .mockResolvedValueOnce({ status: 'done' })
```

## Test Helpers

### Helper Functions

```typescript
// Create test data
function createTestUser(overrides = {}): User {
  return {
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  }
}

// Setup helper
function setupParser(): { parser: Parser; mockRenderer: MockRenderer } {
  const mockRenderer = { render: vi.fn() }
  const parser = new Parser(mockRenderer)
  return { parser, mockRenderer }
}
```

### Parameterized Tests

```typescript
it.each([
  ['input1', 'expected1'],
  ['input2', 'expected2'],
  ['input3', 'expected3'],
])('should transform %s to %s', (input, expected) => {
  expect(transform(input)).toBe(expected)
})

it.each([
  { input: 1, expected: 2 },
  { input: 2, expected: 4 },
])('should double $input to $expected', ({ input, expected }) => {
  expect(double(input)).toBe(expected)
})
```

## Setup and Teardown

```typescript
describe('Feature', () => {
  let instance: MyClass

  beforeAll(() => {
    // Run once before all tests
  })

  afterAll(() => {
    // Run once after all tests
  })

  beforeEach(() => {
    // Run before each test
    vi.clearAllMocks()
    instance = new MyClass()
  })

  afterEach(() => {
    // Run after each test
    instance.cleanup()
  })
})
```

## Best Practices

1. **Clear mocks between tests** - Use `vi.clearAllMocks()` in `beforeEach`
2. **Type your mocks** - Use `vi.fn<Type['method']>()` for type safety
3. **Test behavior, not implementation** - Focus on inputs/outputs
4. **One assertion focus per test** - Test one concept at a time
5. **Descriptive test names** - `'should [action] when [condition]'`
6. **Arrange-Act-Assert** - Structure tests clearly
7. **Avoid test interdependence** - Each test should be isolated
