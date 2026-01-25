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

  // Run ESLint with --fix
  try {
    execSync(`npx eslint --cache --fix --format json "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    // Success - no errors remain after fix
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({
      hookSpecificOutput: {
        linted: true,
        file: filePath,
        message: 'Test file passed linting',
      },
    }))
  } catch (error) {
    // ESLint returns non-zero exit code when errors exist
    // Parse the JSON output to extract error details
    let eslintOutput = []
    try {
      eslintOutput = JSON.parse(error.stdout || '[]')
    } catch {
      // If we can't parse ESLint output, report the raw error
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({
        decision: 'block',
        reason: `ESLint failed to run: ${error.message}`,
      }))
      return
    }

    // Extract remaining errors (severity 2 = error, severity 1 = warning)
    const errors = eslintOutput
      .flatMap(file => file.messages?.filter(msg => msg.severity >= 2) || [])
      .slice(0, 5) // Limit to first 5 errors to keep feedback concise
      .map(err => `Line ${err.line}: [${err.ruleId}] ${err.message}`)

    if (errors.length > 0) {
      const totalErrors = eslintOutput
        .reduce((sum, file) => sum + (file.errorCount || 0), 0)

      // eslint-disable-next-line no-console
      console.log(JSON.stringify({
        decision: 'block',
        reason: [
          `Test file has ${totalErrors} lint error(s) that could not be auto-fixed:`,
          '',
          ...errors,
          totalErrors > 5 ? `\n... and ${totalErrors - 5} more error(s)` : '',
          '',
          'Please fix these errors before continuing.',
        ].filter(Boolean).join('\n'),
      }))
    } else {
      // No errors remain (maybe only warnings)
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({
        hookSpecificOutput: {
          linted: true,
          file: filePath,
          message: 'Test file passed linting (with warnings)',
        },
      }))
    }
  }
}

main().catch(err => {
  console.error('Hook error:', err)
  process.exit(1)
})
