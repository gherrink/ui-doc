# UI-Doc Demos

This folder contains demonstrations of UI-Doc integration patterns and feature showcases.

## Structure

| Demo | Description | Command |
|------|-------------|---------|
| **Build Tool Demos** | Same CSS content, different build tools ||
| `node-cli/` | Node.js programmatic API | `pnpm node-cli` |
| `rollup/` | Rollup plugin | `pnpm rollup` |
| `vite/` | Vite plugin | `pnpm vite:build` |
| **Feature Showcases** | Unique content demonstrating specific features ||
| `showcase-minimal/` | Bare minimum setup | `pnpm showcase:minimal` |
| `showcase-variations/` | `@variations` tag demo | `pnpm showcase:variations` |
| `showcase-multi-source/` | CSS + JS doc blocks | `pnpm showcase:multi-source` |
| `showcase-templates/` | Custom HTML templates | `pnpm showcase:templates` |

## Shared Resources

Build tool demos share common resources in `shared/`:

```text
shared/
├── css/                    # Source CSS with UI-Doc blocks
│   ├── index.css           # Unified entry point
│   ├── 01_resets/
│   ├── 02_utils/
│   ├── 03_components/
│   └── 04_layouts/
├── assets/
│   └── fonts/              # Icon fonts
└── ui-doc/
    ├── templates/          # Custom HTML templates
    └── assets/             # Preview images
```

## Running Demos

### Build Tool Demos

Build all three to compare output across different build tools:

```bash
# Build
pnpm node-cli
pnpm rollup
pnpm vite:build

# Serve and view
pnpm serve:node-cli   # http://localhost:8080
pnpm serve:rollup     # http://localhost:8080
pnpm serve:vite       # http://localhost:8080
```

Development mode (Vite only):

```bash
pnpm vite             # Starts dev server with HMR
```

### Feature Showcases

Each showcase demonstrates a specific UI-Doc feature:

```bash
# Minimal setup example
pnpm showcase:minimal && pnpm serve:showcase:minimal

# @variations tag permutation grids
pnpm showcase:variations && pnpm serve:showcase:variations

# Multi-source (CSS + JS) documentation
pnpm showcase:multi-source && pnpm serve:showcase:multi-source

# Custom HTML templates
pnpm showcase:templates && pnpm serve:showcase:templates
```

## Output

All demos output to `dist/<demo-name>/`. The UI-Doc HTML files are in the `ui-doc/` subdirectory:

- `dist/node-cli/` - HTML files directly (programmatic API)
- `dist/rollup/ui-doc/` - HTML files in ui-doc subfolder
- `dist/vite/ui-doc/` - HTML files in ui-doc subfolder
- `dist/showcase-*/ui-doc/` - HTML files in ui-doc subfolder
