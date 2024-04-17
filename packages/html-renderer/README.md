# Styleguide HTML Renderer

Simple and light HTML Rendering Engine. Its perpise is to create HTML from a Context Object by using a simple templating syntax and
have no dependencies. This project sould not be used for complexer projects, because of it's simplicity.

## Tags

Tags are used to get a bit of functionality into the html generation process. Please not since we use only regex and not real paring enging
to generate the output it can happen that a regex matches to mucht.

### var

Output value of a variable.

```
<h1>{{var:title}}</h1>
```

### var-escaped

Ouput escaped value of a variable.

```
<div>{{var-escaped:content}}</div>
```

### if

Use a if condition to desiced when our when not to render something. Please not that currentryl there is no `else` or `ifelse`

```
{{if:show}}
<p>Show this if show inside the context is a true statement</p>
{{endif:show}}
```

### for

Use for to loop over objects and arrays. Please not that a loop will change the context to help you access inside your loop target
and give you loop specific context like index and object keys.

#### array loop

```
<!-- context: {"list": ["foo", "bar", "baz"]} -->
<ul>
  {{for:list}}
  <li>{{var:_loop.value}}, index: {{var:_loop.index}}</li>
  {{endfor:list}}
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
  {{endfor:list}}
</ul>

<!-- Output: -->
<ul>
  <li>FOO, key: foo, index: 0</li>
  <li>BAR, key: bar, index: 1</li>
  <li>BAZ, key: baz, index: 2</li>
</ul>
```

#### loop items as objects

You can loop over an array or object of objects. The object items will directily be acccasible inside the for context.

```
<!-- context: {"sections": [{"title": "Section 1", content: "<p>Section 1 content</p>"}, {"title": "Section 2", content: "<p>Section 2 content</p>"}]} -->

{{for:sections}}
<section>
  <h2>{{var::title}}</h2>
  {{var:content}}
</section>
{{endfor:sections}}

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

Use page to output registerd page templates (see Templating > Page). `{{page:foo}}` this will try to
render the `foo` page. If no page with this name is registerd the system will fallback to the `default` page.
If you want to use the default page you can also just use `{{page}}`. Please note that the page tag will
search for a `page` inside the current context and change the context than to the value of `page`.

```
<!-- context: {"title": "Document Title", "page": {"title": "Page title", "content": "Page content"}} -->

<html>
<head>
  <title>{{var:title}}</title>
</head>
<body>
  {{page}}
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

Use partial to render registered partial templates (see Templating > Partial). If the given partial name was not found nothing will be generated

```
{{partial:foo}} > output foo partial
```

### partial-context

Simular to partial but will chagne the context to a given variable name.

```
{{partial-context:foo}} > output foo partial and chagne context to foo
{{partial-context:foo:bar}} > output foo partial and chagne context to bar
{{partial-context:foo.bar}} > output foo-bar partial and chagne context to foo.bar
```

### debug

Use debug to output the current context or parts of the context. The context will be outputed as JSON.

```
<!-- context: {"title": "Document Title", "page": {"title": "Page title", "content": "Page content"}} -->

{{debug}}
<!-- Output: -->
{"title": "Document Title", "page": {"title": "Page title", "content": "Page content"}}

{{debug:page}}
<!-- Output: -->
{"title": "Page title", "content": "Page content"}

```

## Templating

You can register different template parts to the renderer these templates can then be reused wile generation.

### Layouts

Define the HTML basic structure.

### Page

Define a page specific template. You can use the `{{page:your-page-template-name}}` tag to render a specific page template.
Page templates are not nececarray but they help to keep layouts smaller and easier to read.

### Partial

Define a partial that can be reused, to get the same output inside layouts, pages and even in other partials. You can use the
`{{partial:your-partial-name}}` tag to render the partial.

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
{{endif:excerpt}}

{{for:sections}}
{{partial:section}}
{{endfor:sections}}`

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
      { title: "Section 1" content: "<p>Section 1 content</p>" },
      { title: "Section 2" content: "<p>Section 2 content</p>" },
    ],
  },
})

```
