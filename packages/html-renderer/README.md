# Styleguide HTML Renderer

Simple and light HTML Rendering Engine. Its purpose is to create HTML from a Context Object by using a simple template syntax and have no dependencies. This project should not be used for complexer projects, because of it's simplicity.

## Tags

Tags are used to get a bit of functionality into the html generation process.

### var

Output value of a variable.

```
<h1>{{var:title}}</h1>
```

To escape the variable use `{{var:title escape}}`.

### if

Use a if condition to decide when our when not to render something. Please not that currently there is no `else` or `ifelse`

```
{{if:show}}
<p>Show this if show inside the context is a true statement</p>
{{/if}}
```

#### Conditions

You can use conditions

```
{{if:title === "foo"}}
{{if:show === true}}
{{if:page.number === 3}}
```

**Operators:**

- `===`
- `==`
- `!==`
- `!=`
- `<`
- `<=`
- `>`
- `>=`

### for

Use for to loop over objects and arrays. Please not that a loop will change the context to help you access inside your loop target and give you loop specific context like index and object keys.

#### array loop

```
<!-- context: {"list": ["foo", "bar", "baz"]} -->
<ul>
  {{for:list}}
  <li>{{var:_loop.value}}, index: {{var:_loop.index}}</li>
  {{/for}}
</ul>

<!-- Output: -->
<ul>
  <li>foo, index: 0</li>
  <li>bar, index: 1</li>
  <li>baz, index: 2</li>
</ul>
```

#### object loop

```
<!-- context: {"list": {"foo": "FOO", "bar": "BAR", "baz": "BAZ"}} -->
<ul>
  {{for:list}}
  <li>{{var:_loop.value}}, key: {{var:_loop.key}}, index: {{var:_loop.index}}</li>
  {{/for}}
</ul>

<!-- Output: -->
<ul>
  <li>FOO, key: foo, index: 0</li>
  <li>BAR, key: bar, index: 1</li>
  <li>BAZ, key: baz, index: 2</li>
</ul>
```

#### loop items as objects

You can loop over an array or object of objects. The object items will directly be accessible inside the for context.

```
<!-- context: {"sections": [{"title": "Section 1", content: "<p>Section 1 content</p>"}, {"title": "Section 2", content: "<p>Section 2 content</p>"}]} -->

{{for:sections}}
<section>
  <h2>{{var::title}}</h2>
  {{var:content}}
</section>
{{/for}}

<!-- Output: -->
<section>
  <h2>Section 1</h2>
  <p>Section 1 content</p>
</section>
<section>
  <h2>Section 2</h2>
  <p>Section 2 content</p>
</section>
```

### page

Use page to output registered page templates (see Templates > Page). `{{page:foo}}` this will try to render the `foo` page. If no page with this name is registered the system will fallback to the `default` page. If you want to use the default page you can also just use `{{page}}`. As second parameter you can give a context if you like to change the context `{{page:layout newContext}}`.

```
<!-- context: {"title": "Document Title", "page": {"title": "Page title", "content": "Page content"}} -->

<html>
<head>
  <title>{{var:title}}</title>
</head>
<body>
  <!-- using default layout with new context `page` -->
  {{page:default page}}
</body>
</html>

<!-- default page template with change context -->
<!-- context: {"title": "Page title", "content": "Page content"} -->

<main>
  <h1>{{var:title}}</h1>
  <p>{{var:content}}</p>
</main>

<!-- Output: -->
<html>
<head>
  <title>Document Title</title>
</head>
<body>
<main>
  <h1>Page title</h1>
  <p>Page content</p>
</main>
</body>
</html>
```

### partial

Use partial to render registered partial templates (see Templates > Partial). If the given partial name was not found nothing will be generated

```
{{partial:foo}} > output foo partial
```

As second parameter you can give a context definition to change the context

```
{{partial:foo bar}} > output foo partial using bar of the current context as new context
```

### debug

Use debug to output the current context or parts of the context. The context will be outputted as JSON.

```
<!-- context: {"title": "Document Title", "page": {"title": "Page title", "content": "Page content"}} -->

{{debug}}
<!-- Output: -->
{"title": "Document Title", "page": {"title": "Page title", "content": "Page content"}}

{{debug:page}}
<!-- Output: -->
{"title": "Page title", "content": "Page content"}

```

## Templates

You can register different template parts to the renderer these templates can then be reused wile generation.

### Layouts

Define the HTML basic structure.

### Page

Define a page specific template. You can use the `{{page:your-page-template-name}}` tag to render a specific page template. Page templates are not necessary but they help to keep layouts smaller and easier to read.

### Partial

Define a partial that can be reused, to get the same output inside layouts, pages and even in other partials. You can use the `{{partial:your-partial-name}}` tag to render the partial.

## Usage

```
import { HtmlRenderer } from '@styleguide/html-renderer'

const layout = `
<html>
  <head>
    <meta charset="utf-8">
    <title>{{var:title}}</title>
  </head>
  <body>
    {{page:default}}
  </body>
</html>`

const page = `
<h1>{{var:title}}</h1>

{{if:excerpt}}
<div>{{var:excerpt}}</div>
{{/if}}

{{for:sections}}
{{partial:section}}
{{/for}}`

const section = `
<h2>{{var:title}}</h2>

{{var:content}}
`

const renderer = new HtmlRenderer()

renderer.addLayout('default', layout)
renderer.addPage('default', page)
renderer.addPartial('section', section)

renderer.generate({
  title: 'Example',
  page: {
    title: 'Example Page Title',
    sections: [
      {; content: "<p>Section 1 content</p>" },
      {; title: "Section 2"; content: "<p>Section 2 content</p>" },
    ],
  },
})

```
