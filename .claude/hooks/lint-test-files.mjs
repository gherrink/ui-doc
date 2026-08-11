#!/usr/bin/env node
/**
 * PostToolUse hook that lints test files after Write/Edit operations.
 *
 * Input (stdin): JSON with tool_input.file_path
 * Output (stdout): JSON with decision (allow/block) and feedback
 *
 * - Runs ESLint --fix on test files (*.test.ts, *.spec.ts)
 * - Auto-fixes what it can
 * - Blocks and reports remaining errors for Claude to fix
 */

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import process from 'node:process'

async function main() {
  // Read JSON from stdin
  let input = ''
  process.stdin.setEncoding('utf8')
  for await (const chunk of process.stdin) {
    input += chunk
  }

  const data = JSON.parse(input)
  const filePath = data.tool_input?.file_path ?? ''

  // Only process test files
  if (!filePath.endsWith('.test.ts') && !filePath.endsWith('.spec.ts')) {
    process.exit(0)
  }

  // Skip if file doesn't exist (might be a delete operation)
  if (!existsSync(filePath)) {
    process.exit(0)
  }

  // Run oxlint with --fix.
  //
  // Deliberately without --type-aware: given a single explicit path, tsgolint
  // cannot build a full program for it and reports every import as an `error`
  // type - 59 phantom findings on an untouched file. Type-aware rules are
  // essentially non-autofixable anyway, and `pnpm lint` enforces them over the
  // whole repo, which resolves correctly.
  try {
    execSync(`npx oxlint --fix --format json "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    // Success - no errors remain after fix
    // oxlint-disable-next-line no-console
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          linted: true,
          file: filePath,
          message: 'Test file passed linting',
        },
      }),
    )
  } catch (error) {
    // oxlint returns a non-zero exit code when errors remain
    // Parse the JSON output to extract error details
    let lintOutput = { diagnostics: [] }
    try {
      lintOutput = JSON.parse(error.stdout || '{}')
    } catch {
      // If we can't parse the linter output, report the raw error
      // oxlint-disable-next-line no-console
      console.log(
        JSON.stringify({
          decision: 'block',
          reason: `oxlint failed to run: ${error.message}`,
        }),
      )
      return
    }

    // oxlint reports a flat `diagnostics` array, each entry carrying its rule
    // in `code` and its position in the first label's span.
    const diagnostics = (lintOutput.diagnostics ?? []).filter(
      diagnostic => diagnostic.severity === 'error',
    )

    const errors = diagnostics
      .slice(0, 5) // Limit to first 5 errors to keep feedback concise
      .map(
        diagnostic =>
          `Line ${diagnostic.labels?.[0]?.span?.line ?? '?'}: ` +
          `[${diagnostic.code}] ${diagnostic.message}`,
      )

    if (errors.length > 0) {
      const totalErrors = diagnostics.length

      // oxlint-disable-next-line no-console
      console.log(
        JSON.stringify({
          decision: 'block',
          reason: [
            `Test file has ${totalErrors} lint error(s) that could not be auto-fixed:`,
            '',
            ...errors,
            totalErrors > 5 ? `\n... and ${totalErrors - 5} more error(s)` : '',
            '',
            'Please fix these errors before continuing.',
          ]
            .filter(Boolean)
            .join('\n'),
        }),
      )
    } else {
      // No errors remain (maybe only warnings)
      // oxlint-disable-next-line no-console
      console.log(
        JSON.stringify({
          hookSpecificOutput: {
            linted: true,
            file: filePath,
            message: 'Test file passed linting (with warnings)',
          },
        }),
      )
    }
  }
}

main().catch(err => {
  console.error('Hook error:', err)
  process.exit(1)
})
