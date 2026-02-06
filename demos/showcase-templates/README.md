# Showcase: Custom Templates

Demonstrates customizing UI-Doc's HTML output with your own templates.

## Usage

```bash
pnpm showcase:templates
pnpm serve:showcase:templates
```

## What It Shows

- Custom `layouts/default.html` with branded header/footer
- Custom `partials/nav-main.html` with modified navigation
- Custom CSS injected via template
- Brand colors and styling

## Template Structure

```text
showcase-templates/
├── templates/
│   ├── layouts/
│   │   └── default.html    # Main page layout
│   └── partials/
│       └── nav-main.html   # Navigation component
└── src/
    └── styles.css
```

## Configuration

```javascript
uidoc({
  source: ['src/**/*.css'],
  templatePath: 'templates',
})
```

## Template Variables

Templates use `{{var:name}}` syntax:

- `{{var:title}}` - Page title
- `{{var:styles}}` - Injected stylesheets
- `{{var:scripts}}` - Injected scripts
- `{{var:homeLink}}` - Link to homepage
- `{{var:logo}}` - Logo text/image
- `{{partial:nav-main}}` - Include partial
- `{{page:page.id page}}` - Page content

## Use Cases

- Corporate branding integration
- Custom navigation patterns
- Additional analytics/tracking scripts
- Modified page structure
