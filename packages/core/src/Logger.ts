import type { LogContext, Logger, LogLevel } from './Logger.types'

export const noopLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const parts: string[] = [`[ui-doc:${level}]`]

  if (context?.phase !== undefined) {
    parts.push(`[${context.phase}]`)
  }

  if (context?.source !== undefined && context.source !== '') {
    const location = context.line !== undefined
      ? `${context.source}:${context.line}`
      : context.source
    parts.push(`(${location})`)
  }

  parts.push(message)

  return parts.join(' ')
}

export function createConsoleLogger(minLevel: LogLevel = 'debug'): Logger {
  const minLevelValue = LOG_LEVELS[minLevel]

  const log = (level: LogLevel, message: string, context?: LogContext): void => {
    if (LOG_LEVELS[level] < minLevelValue) {
      return
    }

    const formatted = formatMessage(level, message, context)

    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(formatted)
        break
      case 'info':
        // eslint-disable-next-line no-console
        console.info(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        break
    }
  }

  return {
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, context) => log('error', message, context),
  }
}
