# Template syntax reference

Complete reference for the UI-Doc HTML template engine syntax, including variables, conditionals, loops, and partials.

## Overview

The UI-Doc HTML renderer includes a lightweight, dependency-free template engine. Templates use double curly braces `{{...}}` for directives and support variable interpolation, conditionals, loops, and partial includes.

All template directives follow the pattern `{{type:arguments}}` where `type` identifies the directive and `arguments` provide the necessary parameters.

## Variables

### var

Output values from the render context.

**Syntax:**

```text
{{var:contextKey}}
{{var:contextKey escape}}
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| contextKey | Yes | `string` | Property name to read from context. Supports dot notation for nested properties. |
| escape | No | `boolean` | When present, HTML-escapes the output value. |

**Example:**

```html
<!-- Context: { title: "Hello World", page: { name: "Introduction" } } -->
<h1>{{var:title}}</h1>
<p>{{var:page.name}}</p>

<!-- With HTML escaping -->
<!-- Context: { userInput: "<script>alert('XSS')</script>" } -->
<div>{{var:userInput escape}}</div>
```

**Output:**

```html
<h1>Hello World</h1>
<p>Introduction</p>

<div>&lt;script&gt;alert(&#039;XSS&#039;)&lt;/script&gt;</div>
```

**Behavior:**

- Returns empty string for `undefined`, `null`, or missing properties
- Converts numbers and booleans to strings
- Nested properties are accessed with dot notation (e.g., `page.title.text`)
- When `escape` is present, converts `&`, `<`, `>`, `"`, and `'` to HTML entities

## Conditionals

### if

Conditionally render content based on truthiness or comparisons.

**Syntax:**

```text
{{if:contextKey}}content{{/if}}
{{if:contextKey operator value}}content{{/if}}
{{if:contextKey operator otherContextKey}}content{{/if}}
{{if:value operator value}}content{{/if}}
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| contextKey | Conditional | `string` | Property name to evaluate. Required if no operator is used. |
| operator | No | `string` | Comparison operator. See table below. |
| value | Conditional | `string \| number \| boolean` | Literal value to compare against. Required if operator is present. |

**Supported operators:**

| Operator | Description | Example |
|----------|-------------|---------|
| `===` | Strict equality | `{{if:status === "active"}}` |
| `==` | Loose equality | `{{if:count == 5}}` |
| `!==` | Strict inequality | `{{if:type !== "draft"}}` |
| `!=` | Loose inequality | `{{if:value != false}}` |
| `>` | Greater than | `{{if:count > 10}}` |
| `>=` | Greater than or equal | `{{if:count >= 5}}` |
| `<` | Less than | `{{if:count < 100}}` |
| `<=` | Less than or equal | `{{if:count <= 50}}` |

**Example:**

```html
<!-- Simple truthiness check -->
{{if:showContent}}
  <p>This is visible when showContent is truthy</p>
{{/if}}

<!-- Comparison with literal value -->
{{if:status === "active"}}
  <span class="badge">Active</span>
{{/if}}

<!-- Comparison between context values -->
{{if:currentId === selectedId}}
  <div class="selected">Selected Item</div>
{{/if}}

<!-- Numeric comparison -->
{{if:count > 5}}
  <span>More than 5 items</span>
{{/if}}
```

**Truthiness:**

When no operator is provided, the following values are considered falsy:

- `undefined`
- `null`
- `false`
- `0` (number zero)
- `""` (empty string)

All other values are truthy.

## Loops

### for

Iterate over arrays or objects and render content for each item.

**Syntax:**

```text
{{for:contextKey}}content{{/for}}
{{for}}content{{/for}}
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| contextKey | No | `string` | Property name containing the array or object to iterate. Defaults to current context if omitted. |

**Loop variables:**

Within a `for` loop, these special variables are available:

| Variable | Type | Description |
|----------|------|-------------|
| `_loop.index` | `number` | Zero-based iteration index |
| `_loop.value` | `any` | Current item value |
| `_loop.key` | `string` | Current key (object loops only) |
| `_parent` | `object` | Reference to parent context |
| `_contextKey` | `string` | Name of the iterated property |

**Array example:**

```html
<!-- Context: { items: ["apple", "banana", "cherry"] } -->
<ul>
  {{for:items}}
    <li>{{var:_loop.value}} (index: {{var:_loop.index}})</li>
  {{/for}}
</ul>
```

**Output:**

```html
<ul>
  <li>apple (index: 0)</li>
  <li>banana (index: 1)</li>
  <li>cherry (index: 2)</li>
</ul>
```

**Object example:**

```html
<!-- Context: { colors: { red: "#f00", green: "#0f0", blue: "#00f" } } -->
<ul>
  {{for:colors}}
    <li>{{var:_loop.key}}: {{var:_loop.value}}</li>
  {{/for}}
</ul>
```

**Output:**

```html
<ul>
  <li>red: #f00</li>
  <li>green: #0f0</li>
  <li>blue: #00f</li>
</ul>
```

**Array of objects example:**

```html
<!-- Context: { sections: [
  { title: "Introduction", content: "Welcome" },
  { title: "Details", content: "More info" }
]} -->
{{for:sections}}
  <section>
    <h2>{{var:title}}</h2>
    <div>{{var:content}}</div>
  </section>
{{/for}}
```

**Output:**

```html
<section>
  <h2>Introduction</h2>
  <div>Welcome</div>
</section>
<section>
  <h2>Details</h2>
  <div>More info</div>
</section>
```

**Behavior:**

- Empty arrays/objects render nothing
- Non-iterable values (strings, numbers, booleans) render nothing
- Object properties are available directly when iterating arrays of objects
- Objects are iterated in key insertion order

## Pages

### page

Render a registered page template with optional context switching.

**Syntax:**

```text
{{page}}
{{page:pageName}}
{{page:pageName contextKey}}
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| pageName | No | `string` | Name of registered page template. Defaults to `'default'`. Supports dot notation for dynamic lookup. |
| contextKey | No | `string` | Property name to use as context for rendering. Defaults to current context. |

**Example:**

```html
<!-- Render default page template -->
{{page}}

<!-- Render specific page template -->
{{page:default}}

<!-- Render page with different context -->
<!-- Context: { page: { title: "Home", content: "..." } } -->
{{page:default page}}

<!-- Dynamic page name from context -->
<!-- Context: { page: { id: "custom-page" } } -->
{{page:page.id}}
```

**Behavior:**

- Falls back to `'default'` page if specified page is not found
- When `pageName` contains a dot (e.g., `page.id`), attempts to resolve it from context first
- If resolved value is a non-empty string, uses that as the page name
- Context switching allows different data to be passed to the page template

## Partials

### partial

Include reusable template fragments.

**Syntax:**

```text
{{partial:partialName}}
{{partial:partialName contextKey}}
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| partialName | Yes | `string` | Name of registered partial template. |
| contextKey | No | `string` | Property name to use as context for rendering. Defaults to current context. |

**Example:**

```html
<!-- Include a navigation partial -->
{{partial:nav-main}}

<!-- Include partial with different context -->
<!-- Context: { currentSection: { title: "Overview", items: [...] } } -->
{{partial:section currentSection}}

<!-- Nested partials -->
<div class="container">
  {{for:sections}}
    {{partial:section-inner}}
  {{/for}}
</div>
```

**Behavior:**

- Falls back to `'default'` partial if specified partial is not found
- Context switching allows different data to be passed to the partial
- Partials can include other partials (recursive includes are allowed)

## Debug

### debug

Output context as formatted JSON for debugging templates.

**Syntax:**

```text
{{debug}}
{{debug:contextKey}}
```

**Parameters:**

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| contextKey | No | `string` | Property name to debug. Defaults to entire context. |

**Example:**

```html
<!-- Output entire context -->
{{debug}}

<!-- Output specific property -->
{{debug:page}}

<!-- Output nested property -->
{{debug:page.sections}}
```

**Output:**

```html
<pre>{
  "title": "My Page",
  "page": {
    "id": "home",
    "title": "Home"
  }
}</pre>
```

**Behavior:**

- Outputs a `<pre>` element with formatted JSON
- Uses 2-space indentation
- Shows message if context key is empty or undefined
- Useful for inspecting available context data during template development

## Context structure

The render context is an object containing data passed to templates. Common properties include:

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string` | Document or page title |
| `description` | `string` | Optional page description |
| `page` | `object` | Page-specific data (id, title, content, etc.) |
| `sections` | `array` | Array of section objects with nested subsections |
| `assets` | `array` | Asset references for styles and scripts |
| `styles` | `string` | Rendered style tags (in layout context) |
| `scripts` | `string` | Rendered script tags (in layout context) |

Custom properties can be added through UI-Doc configuration.

## Escaping and special characters

### HTML escaping

The `escape` modifier on `{{var}}` directives performs HTML entity encoding:

| Character | Encoded As |
|-----------|------------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#039;` |

### Template literal syntax

Template directives use `{{` and `}}` delimiters. To output literal curly braces in templates, use them outside of template syntax or within HTML content.

## Complete directive reference

| Directive | Has Content | Closes With | Purpose |
|-----------|-------------|-------------|---------|
| `{{var:...}}` | No | N/A | Output variable value |
| `{{if:...}}` | Yes | `{{/if}}` | Conditional rendering |
| `{{for:...}}` | Yes | `{{/for}}` | Loop over array/object |
| `{{page:...}}` | No | N/A | Render page template |
| `{{partial:...}}` | No | N/A | Include partial template |
| `{{debug:...}}` | No | N/A | Output context as JSON |

## See also

- [HTML Renderer Package](../../packages/html-renderer/README.md) - Complete API reference
- [Custom Templates How-To](../how-to/custom-templates.md) - Guide to creating custom templates
- [Template Loader](../../packages/html-renderer/README.md#loading-templates) - Loading templates from files
