# Understanding the event system

UI-Doc provides a flexible event system that allows you to hook into the documentation generation lifecycle. This enables customization, monitoring, and extension of UI-Doc's behavior without modifying its core logic.

## What is the event system?

The event system is a publish-subscribe pattern that emits events at key points during documentation generation. You can register listeners to respond to these events and modify the documentation context, add custom processing, or integrate with external tools.

UI-Doc extends the `EventEmitterBase` class, which provides a type-safe event emitter implementation. This means you get full TypeScript support with autocomplete for event names and typed event payloads.

## How the event system works

UI-Doc emits events throughout its processing lifecycle, from source file parsing to final output generation. Each event carries specific data relevant to that stage, allowing your listeners to inspect or modify the documentation being generated.

### Event registration

You register event listeners using the `on` method and remove them with the `off` method:

```ts
import { UIDoc } from '@ui-doc/core'

const uidoc = new UIDoc({ renderer })

// Register a listener
function onContextEntry({ entry, key, type }) {
  console.log(`Entry ${key} was ${type}d`)
}

uidoc.on('context-entry', onContextEntry)

// Later, remove the listener if needed
uidoc.off('context-entry', onContextEntry)
```

The `on` method returns the UIDoc instance, allowing you to chain multiple listeners:

```ts
uidoc.on('source', handleSource).on('context-entry', handleEntry).on('page', handlePage)
```

### Event types

UI-Doc emits five core events during documentation generation:

| Event           | When                                                   | Use Case                                            |
| --------------- | ------------------------------------------------------ | --------------------------------------------------- |
| `source`        | Before a source file is created, updated, or deleted   | Track which files are being processed               |
| `context-entry` | Before a context entry is created, updated, or deleted | Modify documentation entries, add custom properties |
| `page`          | Before a page is rendered                              | Change page layout, add metadata                    |
| `example`       | Before an example is rendered                          | Customize example presentation                      |
| `output`        | Before the complete documentation is written           | Add additional files, post-process output           |

## Event lifecycle

The following diagram shows when events are emitted during documentation generation:

```text
Source File Processing:
  1. sourceCreate(file, content)
     ├─> emit 'source' (type: 'create')
     ├─> parse blocks
     └─> for each block:
         └─> emit 'context-entry' (type: 'create' or 'update')

  2. sourceUpdate(file, content)
     ├─> emit 'source' (type: 'update')
     ├─> parse blocks
     ├─> for each updated/new block:
     │   └─> emit 'context-entry' (type: 'update')
     └─> for each deleted block:
         └─> emit 'context-entry' (type: 'delete')

  3. sourceDelete(file)
     ├─> emit 'source' (type: 'delete')
     └─> for each block:
         └─> emit 'context-entry' (type: 'delete')

Output Generation:
  4. output(callback)
     ├─> emit 'output'
     ├─> for each page:
     │   ├─> emit 'page'
     │   └─> render page
     └─> for each example:
         ├─> emit 'example'
         └─> render example
```

### Source processing

When you call `sourceCreate`, `sourceUpdate`, or `sourceDelete`, UI-Doc first emits a `source` event, then processes the doc blocks in that file. For each block, it emits a `context-entry` event before adding, updating, or removing the entry from the documentation context.

### Context entry lifecycle

The `context-entry` event is the most versatile hook. It fires whenever a documentation entry changes and provides detailed information about what changed:

```ts
uidoc.on('context-entry', ({ entry, key, type, changes }) => {
  // type is 'create', 'update', or 'delete'
  if (type === 'delete') {
    // Entry is being removed
    console.log(`Removing ${key}`)
  } else {
    // changes.updated contains before/after values
    // changes.deleted contains removed properties
    console.log(`Changed properties:`, changes.updated)
    console.log(`Removed properties:`, changes.deleted)
  }
})
```

### Output generation

During output generation, UI-Doc emits events in this order:

1. **output** - First event, providing access to the write function
2. **page** - For each page being rendered
3. **example** - For each example being rendered

The `output` event is special because it provides a `write` function and a `promises` array. You can add your own promises to this array to write additional files:

```ts
uidoc.on('output', ({ promises, write }) => {
  // Add a custom file to the output
  promises.push(write('custom-data.json', JSON.stringify(customData)))
})
```

## Event system in practice

Here are practical examples of using the event system for common customization tasks.

### Modifying entry properties

You can modify documentation entries before they're rendered:

```ts
// Set a consistent order for all entries
uidoc.on('context-entry', ({ entry, type }) => {
  if (type !== 'delete') {
    entry.order = 100
  }
})

// Add custom metadata to entries
uidoc.on('context-entry', ({ entry, key, type }) => {
  if (type !== 'delete') {
    entry.customMetadata = {
      processedAt: new Date().toISOString(),
      sourceKey: key,
    }
  }
})
```

### Tracking source files

Monitor which files are being processed:

```ts
const processedFiles = new Set()

uidoc.on('source', ({ file, type }) => {
  if (type === 'create') {
    processedFiles.add(file)
    console.log(`Processing: ${file}`)
  } else if (type === 'delete') {
    processedFiles.delete(file)
    console.log(`Removed: ${file}`)
  }
})
```

### Customizing page rendering

Change the layout or add data to pages before they're rendered:

```ts
uidoc.on('page', ({ page, layout }) => {
  // Use a custom layout for the index page
  if (page.id === 'index') {
    layout = 'home'
  }

  // Add custom data to pages
  page.generatedAt = new Date().toISOString()
})
```

### Adding output files

Generate additional files during the output phase:

```ts
uidoc.on('output', ({ promises, write }) => {
  // Create a manifest file listing all pages
  const pages = Object.values(uidoc.pages())
  const manifest = {
    generatedAt: new Date().toISOString(),
    pages: pages.map(p => ({
      id: p.id,
      title: p.title,
      sections: p.sections.length,
    })),
  }

  promises.push(write('manifest.json', JSON.stringify(manifest, null, 2)))
})
```

## Why the event system matters

The event system provides several key benefits:

- **Extensibility:** Add custom behavior without modifying UI-Doc's core code
- **Integration:** Connect UI-Doc with external tools, analytics, or build systems
- **Customization:** Modify documentation entries, layouts, or output based on your needs
- **Monitoring:** Track the documentation generation process for debugging or logging
- **Separation of concerns:** Keep custom logic separate from standard UI-Doc processing

## Common misconceptions

### "Events can stop processing"

Events are informational and allow modification, but they don't provide a way to prevent UI-Doc from continuing its processing. All registered listeners are called, and processing continues regardless of what listeners do.

### "Event order doesn't matter"

Event order is critical. For example, `context-entry` events fire during source processing, while `page` and `example` events fire during output generation. Modifying a page in a `context-entry` handler works because the page hasn't been rendered yet. Modifying it in the `page` handler happens at render time.

### "The output event replaces the output callback"

The `output` event provides additional capabilities but doesn't replace the `output` callback you pass to `uidoc.output()`. The callback is still used to write all pages and examples. The event lets you add extra files or processing.

## Related concepts

- [Doc blocks](./doc-blocks.md) - Understanding the source of context entries
- [Core API Reference](../reference/core-api.md) - Complete API documentation including event types

## Further reading

- [Custom Transformers Tutorial](../tutorials/custom-transformers.md) - Extend UI-Doc with custom tag transformers
- [@ui-doc/core README](../../packages/core/README.md) - Full core package documentation with event examples
