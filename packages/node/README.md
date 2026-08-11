# @ui-doc/node

Node.js file system implementation for UI-Doc. This package provides file system operations, file discovery with glob patterns, and asset loading from node_modules packages.

## Installation

```bash
npm install @ui-doc/node @ui-doc/core
```

```bash
pnpm add @ui-doc/node @ui-doc/core
```

```bash
yarn add @ui-doc/node @ui-doc/core
```

## Overview

`@ui-doc/node` implements the `FileSystem` interface from `@ui-doc/core`, providing:

- **File System Operations** - Read, write, copy files and directories
- **File Discovery** - Find files using glob patterns with picomatch
- **Asset Loading** - Resolve and load assets from node_modules packages

This package is typically used by build plugins (like `@ui-doc/rollup` or `@ui-doc/vite`) but can also be used directly for custom integrations.

## Usage

### Basic File System Operations

```js
import { createNodeFileSystem } from '@ui-doc/node'

const fileSystem = createNodeFileSystem()

// Read a file
const content = await fileSystem.fileRead('./path/to/file.css')

// Write a file
await fileSystem.fileWrite('./output/file.html', '<html>...</html>')

// Check if file exists
const exists = await fileSystem.fileExists('./path/to/file.css')

// Copy a file
await fileSystem.fileCopy('./source.css', './destination.css')

// Copy a directory recursively
await fileSystem.directoryCopy('./source-dir', './dest-dir')

// Ensure directory exists (creates if needed)
await fileSystem.ensureDirectoryExists('./output/examples')

// Path utilities
const basename = fileSystem.fileBasename('./path/to/file.css') // "file"
const dirname = fileSystem.fileDirname('./path/to/file.css') // "./path/to"
const resolved = fileSystem.resolve('./relative/path') // Absolute path
```

### File Discovery with Glob Patterns

The `NodeFileFinder` class searches for files matching glob patterns:

```js
import { createNodeFileSystem } from '@ui-doc/node'

const fileSystem = createNodeFileSystem()
const finder = fileSystem.createFileFinder([
  'src/**/*.css',
  'components/**/*.js',
  'styles/**/*.scss',
])

// Search for all matching files
await finder.search(async filePath => {
  // Process the file
  await fileSystem.fileRead(filePath)
})

// Check if a specific file matches the patterns
finder.matches('./src/components/Button.css') // true
```

### Loading Assets from node_modules

The `NodeAssetLoader` helps resolve and load assets from installed packages:

```js
import { createNodeFileSystem } from '@ui-doc/node'

const fileSystem = createNodeFileSystem()
const assetLoader = fileSystem.assetLoader()

// Check if a package exists
await assetLoader.packageExists('@highlightjs/cdn-assets')

// Get the path to a package
await assetLoader.packagePath('@ui-doc/html-renderer')

// Resolve a file within a package
await assetLoader.resolve('@ui-doc/html-renderer/ui-doc.min.css')

// Read an asset from a package
await assetLoader.read('@ui-doc/html-renderer/ui-doc.min.css')

// Copy an asset from a package to your output
await assetLoader.copy(
  '@ui-doc/html-renderer/ui-doc.min.css',
  './dist/ui-doc.css',
)
```

### Complete Example

Here's a complete example showing how to use `@ui-doc/node` with `@ui-doc/core`:

```js
import { UIDoc } from '@ui-doc/core'
import { HtmlRenderer, NodeParser, TemplateLoader } from '@ui-doc/html-renderer'
import { createNodeFileSystem } from '@ui-doc/node'

async function generateDocs() {
  const outputDir = './dist/docs'

  // Initialize file system
  const fileSystem = createNodeFileSystem()
  const assetLoader = fileSystem.assetLoader()

  // Create renderer
  const renderer = new HtmlRenderer(NodeParser.init())

  // Load templates
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

  // Create output directory
  await fileSystem.ensureDirectoryExists(outputDir)
  await fileSystem.ensureDirectoryExists(`${outputDir}/examples`)

  // Write documentation output
  await uidoc.output(async (file, content) => {
    await fileSystem.fileWrite(`${outputDir}/${file}`, content)
  })

  // Copy required assets
  await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.css', `${outputDir}/ui-doc.css`)
  await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.js', `${outputDir}/ui-doc.js`)
}

generateDocs()
```

## API Reference

### NodeFileSystem

The main class implementing the `FileSystem` interface.

#### Static Methods

##### `NodeFileSystem.init(): NodeFileSystem`

Creates or returns the singleton instance of `NodeFileSystem`.

```js
import { NodeFileSystem } from '@ui-doc/node'

NodeFileSystem.init()
```

#### Instance Methods

##### `createFileFinder(globs: string[]): NodeFileFinder`

Creates a file finder for the given glob patterns.

##### `assetLoader(): NodeAssetLoader`

Returns the asset loader instance.

##### `resolve(file: string): string`

Resolves a file path to an absolute path.

##### `fileRead(file: string): Promise<string>`

Reads a file and returns its content as a string.

##### `fileWrite(file: string, content: string): Promise<boolean>`

Writes content to a file. Returns `true` on success, `false` on failure.

##### `fileCopy(from: string, to: string): Promise<boolean>`

Copies a file. Returns `true` on success, `false` on failure.

##### `fileExists(file: string): Promise<boolean>`

Checks if a file exists.

##### `fileBasename(file: string): string`

Returns the filename without extension.

##### `fileDirname(file: string): string`

Returns the directory path.

##### `ensureDirectoryExists(dir: string): Promise<boolean>`

Creates a directory and all parent directories if they don't exist.

##### `isDirectory(dir: string): Promise<boolean>`

Checks if a path is a directory.

##### `directoryCopy(from: string, to: string): Promise<boolean>`

Recursively copies a directory. Returns `true` if all files were copied successfully.

### NodeFileFinder

Discovers files matching glob patterns.

#### Constructor

```text
import { NodeFileFinder } from '@ui-doc/node'

new NodeFileFinder(['src/**/*.css', 'components/**/*.js'])
```

#### Properties

##### `globs: readonly string[]`

The resolved glob patterns.

#### Methods

##### `search(onFound: (file: string) => Promise<void> | void): Promise<void>`

Searches for all files matching the glob patterns and calls `onFound` for each match.

##### `matches(file: string): boolean`

Checks if a file path matches any of the glob patterns.

### NodeAssetLoader

Loads assets from node_modules packages.

#### Constructor

The `NodeAssetLoader` is typically accessed via `fileSystem.assetLoader()` rather than instantiated directly.

#### Methods

##### `packageExists(packageName: string): Promise<boolean>`

Checks if a package is installed.

##### `packagePath(packageName: string): Promise<string | undefined>`

Returns the absolute path to a package, or `undefined` if not found.

##### `resolve(file: string): Promise<string | undefined>`

Resolves a file path (package or module specifier) to an absolute path.

##### `read(file: string): Promise<string>`

Reads a file from a package and returns its content. Throws an error if the file cannot be resolved.

##### `copy(from: string, to: string): Promise<void>`

Copies an asset from a package to a destination path. Throws an error if the source cannot be resolved.

## Helper Functions

### `createNodeFileSystem(): NodeFileSystem`

Convenience function that calls `NodeFileSystem.init()`.

```js
import { createNodeFileSystem } from '@ui-doc/node'

createNodeFileSystem()
```

## Glob Pattern Examples

The file finder supports picomatch glob patterns:

```text
// Match all CSS files in src directory (non-recursive)
['src/*.css']

// Match all CSS files recursively
['src/**/*.css']

// Match multiple file types
['src/**/*.{css,scss,sass}']

// Match files in multiple directories
['src/**/*.css', 'components/**/*.css', 'styles/**/*.css']

// Exclude patterns using negative globs
['src/**/*.css', '!src/**/*.test.css']
```

## TypeScript Support

This package is written in TypeScript and includes type definitions. All exports are fully typed.

```ts
import type { AssetLoader, FileFinder, FileSystem } from '@ui-doc/core'
import { createNodeFileSystem } from '@ui-doc/node'

const fileSystem: FileSystem = createNodeFileSystem()
const finder: FileFinder = fileSystem.createFileFinder(['**/*.css'])
const assetLoader: AssetLoader = fileSystem.assetLoader()
```

## Requirements

- Node.js 20.19, 22.12, or 24 and later

## License

MIT

## Related Packages

- [@ui-doc/core](../core) - Core parsing and context generation
- [@ui-doc/html-renderer](../html-renderer) - HTML output renderer
- [@ui-doc/rollup](../rollup) - Rollup plugin integration
- [@ui-doc/vite](../vite) - Vite plugin integration

## Links

- [GitHub Repository](https://github.com/gherrink/ui-doc)
- [Issue Tracker](https://github.com/gherrink/ui-doc/issues)
- [Changelog](./CHANGELOG.md)
