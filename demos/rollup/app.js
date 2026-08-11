// This demo documents a CSS library, so it has no application code of its own.
//
// The entry exists because Rollup requires at least one JS input, and because
// the stylesheet is compiled by the cssAssets output plugin rather than being
// imported as a module. Importing the CSS from here would need a plugin that
// puts stylesheets into Rollup's module graph - exactly what this setup avoids.
//
// The export keeps the chunk non-empty; without it Rollup warns on every build.
export const name = 'ui-doc-rollup-demo'
