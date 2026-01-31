export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  source?: string
  line?: number
  phase?: 'parse' | 'transform' | 'render' | 'output'
}

export interface Logger {
  debug: (message: string, context?: LogContext) => void
  info: (message: string, context?: LogContext) => void
  warn: (message: string, context?: LogContext) => void
  error: (message: string, context?: LogContext) => void
}
