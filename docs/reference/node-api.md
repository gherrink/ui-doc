# Node API reference

Technical reference for the `@ui-doc/node` package, covering file system operations, file discovery with glob patterns, and asset loading from node_modules packages.

## Overview

The `@ui-doc/node` package implements the `FileSystem` interface from `@ui-doc/core` for Node.js environments. It provides file system operations, file discovery using picomatch glob patterns, and asset resolution from installed npm packages. This package is typically used by build plugins like `@ui-doc/rollup` or `@ui-doc/vite`, but can also be used directly for custom integrations.

## Installation

```bash
npm install @ui-doc/node @ui-doc/core
```

**Requirements:**

- Node.js 20.19, 22.12, or 24 and later

## NodeFileSystem class

The main class implementing the `FileSystem` interface. NodeFileSystem uses a singleton pattern to ensure consistent file system access.

### Factory function

The recommended way to create a NodeFileSystem instance:

```js
import { createNodeFileSystem } from '@ui-doc/node'

const fileSystem = createNodeFileSystem()
```

### Static methods

#### init

Creates or returns the singleton instance of NodeFileSystem.

```text
NodeFileSystem.init(): NodeFileSystem
```

**Example:**

```js
import { NodeFileSystem } from '@ui-doc/node'

const fileSystem = NodeFileSystem.init()
```

### Instance methods

#### createFileFinder

Creates a file finder for the given glob patterns.

```text
fileSystem.createFileFinder(globs: string[]): NodeFileFinder
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `globs` | Yes | `string[]` | Array of glob patterns using picomatch syntax |

**Returns:** `NodeFileFinder` instance configured with the provided patterns.

**Example:**

```js
const finder = fileSystem.createFileFinder([
  'src/**/*.css',
  'components/**/*.js',
  '!**/*.test.js',
])
```

#### assetLoader

Returns the asset loader instance for resolving and loading files from node_modules.

```text
fileSystem.assetLoader(): NodeAssetLoader
```

**Returns:** `NodeAssetLoader` instance (created on first call, cached for subsequent calls).

**Example:**

```js
const assetLoader = fileSystem.assetLoader()
await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.css', './dist/ui-doc.css')
```

#### resolve

Resolves a relative or absolute file path to an absolute path.

```text
fileSystem.resolve(file: string): string
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `file` | Yes | `string` | Path to resolve |

**Returns:** Absolute path as a string.

**Example:**

```js
const absolutePath = fileSystem.resolve('./relative/path/file.css')
// Returns: '/absolute/path/to/relative/path/file.css'
```

#### fileRead

Reads a file and returns its content as a string.

```text
await fileSystem.fileRead(file: string): Promise<string>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `file` | Yes | `string` | Path to the file to read |

**Returns:** Promise resolving to file content as UTF-8 string.

**Example:**

```js
const content = await fileSystem.fileRead('./src/buttons.css')
```

#### fileWrite

Writes content to a file. Creates the file if it doesn't exist.

```text
await fileSystem.fileWrite(file: string, content: string): Promise<boolean>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `file` | Yes | `string` | Path to the file to write |
| `content` | Yes | `string` | Content to write to the file |

**Returns:** Promise resolving to `true` on success, `false` on failure.

**Example:**

```js
const success = await fileSystem.fileWrite('./dist/index.html', '<html>...</html>')
```

#### fileCopy

Copies a file from one location to another.

```text
await fileSystem.fileCopy(from: string, to: string): Promise<boolean>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `from` | Yes | `string` | Source file path |
| `to` | Yes | `string` | Destination file path |

**Returns:** Promise resolving to `true` on success, `false` on failure.

**Example:**

```js
await fileSystem.fileCopy('./source.css', './destination.css')
```

#### fileExists

Checks if a file exists and is accessible.

```text
await fileSystem.fileExists(file: string): Promise<boolean>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `file` | Yes | `string` | Path to check |

**Returns:** Promise resolving to `true` if file exists, `false` otherwise.

**Example:**

```js
if (await fileSystem.fileExists('./config.json')) {
  // File exists
}
```

#### fileBasename

Returns the filename without extension.

```text
fileSystem.fileBasename(file: string): string
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `file` | Yes | `string` | File path |

**Returns:** Filename without extension.

**Example:**

```js
const basename = fileSystem.fileBasename('./path/to/file.css')
// Returns: 'file'
```

#### fileDirname

Returns the directory path portion of a file path.

```text
fileSystem.fileDirname(file: string): string
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `file` | Yes | `string` | File path |

**Returns:** Directory path.

**Example:**

```js
const dirname = fileSystem.fileDirname('./path/to/file.css')
// Returns: './path/to'
```

#### ensureDirectoryExists

Creates a directory and all parent directories if they don't exist.

```text
await fileSystem.ensureDirectoryExists(dir: string): Promise<boolean>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `dir` | Yes | `string` | Directory path to create |

**Returns:** Promise resolving to `true` (always succeeds or throws).

**Example:**

```js
await fileSystem.ensureDirectoryExists('./dist/docs/examples')
// Creates all directories in the path if they don't exist
```

#### isDirectory

Checks if a path points to a directory.

```text
await fileSystem.isDirectory(dir: string): Promise<boolean>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `dir` | Yes | `string` | Path to check |

**Returns:** Promise resolving to `true` if path is a directory, `false` otherwise.

**Example:**

```js
if (await fileSystem.isDirectory('./src')) {
  // Path is a directory
}
```

#### directoryCopy

Recursively copies a directory and all its contents.

```text
await fileSystem.directoryCopy(from: string, to: string): Promise<boolean>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `from` | Yes | `string` | Source directory path |
| `to` | Yes | `string` | Destination directory path |

**Returns:** Promise resolving to `true` if all files were copied successfully, `false` otherwise.

**Example:**

```js
await fileSystem.directoryCopy('./templates', './dist/templates')
```

## NodeFileFinder class

Discovers files matching glob patterns using picomatch. Typically created via `fileSystem.createFileFinder()` rather than instantiated directly.

### Constructor

```js
import { NodeFileFinder } from '@ui-doc/node'

const finder = new NodeFileFinder(['src/**/*.css', 'components/**/*.js'])
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `globs` | No | `string[]` | Array of glob patterns. Default: `[]` |

### Properties

#### globs

```text
readonly globs: string[]
```

The resolved absolute glob patterns.

**Example:**

```js
const finder = fileSystem.createFileFinder(['src/**/*.css'])
console.log(finder.globs)
// Output: ['/absolute/path/to/src/**/*.css']
```

### Methods

#### search

Searches for all files matching the glob patterns and calls the callback for each match.

```text
await finder.search(onFound: (file: string) => Promise<void> | void): Promise<void>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `onFound` | Yes | `(file: string) => Promise<void> \| void` | Callback called for each matching file with absolute path |

**Example:**

```js
const finder = fileSystem.createFileFinder(['src/**/*.css'])

await finder.search(async file => {
  const content = await fileSystem.fileRead(file)
  console.log(`Processing ${file}`)
})
```

#### matches

Checks if a file path matches any of the glob patterns.

```text
finder.matches(file: string): boolean
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `file` | Yes | `string` | File path to test |

**Returns:** `true` if the file matches any pattern, `false` otherwise.

**Example:**

```js
const finder = fileSystem.createFileFinder(['src/**/*.css'])

if (finder.matches('./src/components/Button.css')) {
  // File matches the pattern
}
```

## NodeAssetLoader class

Loads assets from node_modules packages using Node.js module resolution. Typically accessed via `fileSystem.assetLoader()` rather than instantiated directly.

### Constructor

```js
import { NodeAssetLoader } from '@ui-doc/node'

const assetLoader = new NodeAssetLoader(fileSystem)
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `fileSystem` | Yes | `FileSystem` | File system instance to use for operations |

### Methods

#### packageExists

Checks if a package is installed in node_modules.

```text
await assetLoader.packageExists(packageName: string): Promise<boolean>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `packageName` | Yes | `string` | npm package name |

**Returns:** Promise resolving to `true` if package exists, `false` otherwise.

**Example:**

```js
if (await assetLoader.packageExists('@ui-doc/html-renderer')) {
  // Package is installed
}
```

#### packagePath

Returns the absolute path to an installed package directory.

```text
await assetLoader.packagePath(packageName: string): Promise<string | undefined>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `packageName` | Yes | `string` | npm package name |

**Returns:** Promise resolving to absolute path, or `undefined` if package not found.

**Example:**

```js
const path = await assetLoader.packagePath('@ui-doc/html-renderer')
// Returns: '/absolute/path/to/node_modules/@ui-doc/html-renderer'
```

#### resolve

Resolves a file path or module specifier to an absolute path using Node.js module resolution.

```text
await assetLoader.resolve(file: string): Promise<string | undefined>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `file` | Yes | `string` | Package path (e.g., `@package/name/file.css`) or module specifier |

**Returns:** Promise resolving to absolute path, or `undefined` if file cannot be resolved.

**Example:**

```js
const cssPath = await assetLoader.resolve('@ui-doc/html-renderer/ui-doc.min.css')
// Returns: '/absolute/path/to/node_modules/@ui-doc/html-renderer/ui-doc.min.css'
```

#### read

Reads a file from a package and returns its content.

```text
await assetLoader.read(file: string): Promise<string>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `file` | Yes | `string` | Package path (e.g., `@package/name/file.css`) |

**Returns:** Promise resolving to file content as UTF-8 string.

**Throws:** Error if the file cannot be resolved.

**Example:**

```js
const css = await assetLoader.read('@ui-doc/html-renderer/ui-doc.min.css')
```

#### copy

Copies an asset from a package to a destination path.

```text
await assetLoader.copy(from: string, to: string): Promise<void>
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `from` | Yes | `string` | Package path (e.g., `@package/name/file.css`) |
| `to` | Yes | `string` | Destination file path |

**Throws:** Error if the source file cannot be resolved.

**Example:**

```js
await assetLoader.copy(
  '@ui-doc/html-renderer/ui-doc.min.css',
  './dist/ui-doc.css',
)

await assetLoader.copy(
  '@highlightjs/cdn-assets/highlight.min.js',
  './dist/highlight.js',
)
```

## Complete example

This example demonstrates using all major components of `@ui-doc/node` together with `@ui-doc/core` and `@ui-doc/html-renderer`:

```js
import { UIDoc } from '@ui-doc/core'
import { HtmlRenderer, NodeParser, TemplateLoader } from '@ui-doc/html-renderer'
import { createNodeFileSystem } from '@ui-doc/node'

async function generateDocs() {
  const outputDir = './dist/docs'

  // Initialize file system
  const fileSystem = createNodeFileSystem()
  const assetLoader = fileSystem.assetLoader()

  // Create HTML renderer
  const renderer = new HtmlRenderer(NodeParser.init())

  // Load templates from package
  const templatePath = await assetLoader.packagePath(TemplateLoader.TEMPLATES_PACKAGE)
  if (templatePath) {
    await TemplateLoader.load({ fileSystem, renderer, templatePath })
  }

  // Initialize UI-Doc
  const uidoc = new UIDoc({ renderer })

  // Find and parse source files
  const finder = fileSystem.createFileFinder(['src/**/*.css', 'src/**/*.js'])
  await finder.search(async file => {
    const content = await fileSystem.fileRead(file)
    uidoc.sourceCreate(file, content)
  })

  // Create output directories
  await fileSystem.ensureDirectoryExists(outputDir)
  await fileSystem.ensureDirectoryExists(`${outputDir}/examples`)

  // Write documentation output
  await uidoc.output(async (file, content) => {
    await fileSystem.fileWrite(`${outputDir}/${file}`, content)
  })

  // Copy required assets
  await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.css', `${outputDir}/ui-doc.css`)
  await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.js', `${outputDir}/ui-doc.js`)
  await assetLoader.copy(
    '@highlightjs/cdn-assets/styles/default.min.css',
    `${outputDir}/highlight.css`,
  )
  await assetLoader.copy(
    '@highlightjs/cdn-assets/highlight.min.js',
    `${outputDir}/highlight.js`,
  )
}

generateDocs()
```

## Glob pattern syntax

NodeFileFinder uses picomatch for glob pattern matching. Here are common patterns:

| Pattern | Description | Example Matches |
|---------|-------------|-----------------|
| `src/*.css` | Files in directory (non-recursive) | `src/styles.css`, `src/theme.css` |
| `src/**/*.css` | Files in directory and subdirectories | `src/styles.css`, `src/components/button.css` |
| `**/*.{css,scss}` | Multiple file extensions | `file.css`, `dir/file.scss` |
| `src/**/*.css` | Multiple directories | Searches in `src/`, `styles/`, `theme/` |
| `!**/*.test.css` | Exclude pattern | Excludes files ending in `.test.css` |

**Example:**

```js
const finder = fileSystem.createFileFinder([
  'src/**/*.css',
  'components/**/*.css',
  '!**/*.test.css',
  '!**/*.spec.css',
])
```

## Complete reference table

### NodeFileSystem methods

| Method | Returns | Description |
|--------|---------|-------------|
| `createFileFinder(globs)` | `NodeFileFinder` | Create file finder with glob patterns |
| `assetLoader()` | `NodeAssetLoader` | Get asset loader instance |
| `resolve(file)` | `string` | Resolve path to absolute |
| `fileRead(file)` | `Promise<string>` | Read file content |
| `fileWrite(file, content)` | `Promise<boolean>` | Write content to file |
| `fileCopy(from, to)` | `Promise<boolean>` | Copy file |
| `fileExists(file)` | `Promise<boolean>` | Check if file exists |
| `fileBasename(file)` | `string` | Get filename without extension |
| `fileDirname(file)` | `string` | Get directory path |
| `ensureDirectoryExists(dir)` | `Promise<boolean>` | Create directory if needed |
| `isDirectory(dir)` | `Promise<boolean>` | Check if path is directory |
| `directoryCopy(from, to)` | `Promise<boolean>` | Copy directory recursively |

### NodeFileFinder methods

| Method | Returns | Description |
|--------|---------|-------------|
| `search(onFound)` | `Promise<void>` | Find all matching files |
| `matches(file)` | `boolean` | Check if file matches patterns |

### NodeAssetLoader methods

| Method | Returns | Description |
|--------|---------|-------------|
| `packageExists(packageName)` | `Promise<boolean>` | Check if package is installed |
| `packagePath(packageName)` | `Promise<string \| undefined>` | Get package directory path |
| `resolve(file)` | `Promise<string \| undefined>` | Resolve module/package file path |
| `read(file)` | `Promise<string>` | Read file from package |
| `copy(from, to)` | `Promise<void>` | Copy asset from package |

## See also

- [Core API Reference](./core-api.md) - Core UIDoc class and parser
- [Getting Started with Vite](../getting-started/vite.md) - Quick setup using Vite plugin
- [Getting Started with Rollup](../getting-started/rollup.md) - Quick setup using Rollup plugin
