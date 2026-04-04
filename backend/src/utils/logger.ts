export interface LogContext {
  [key: string]: any;
}

// Allow error to be unknown for catch blocks
type LogContextArg = LogContext | unknown;

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: LogContext;
}

class Logger {
  private formatEntry(level: LogEntry['level'], message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  private print(entry: LogEntry): void {
    const { timestamp, level, message, context } = entry;
    const prefix = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    if (context && Object.keys(context).length > 0) {
      if (level === 'error') {
        console.error(prefix, context);
      } else if (level === 'warn') {
        console.warn(prefix, context);
      } else if (level === 'debug') {
        console.debug(prefix, context);
      } else {
        console.log(prefix, context);
      }
    } else {
      if (level === 'error') {
        console.error(prefix);
      } else if (level === 'warn') {
        console.warn(prefix);
      } else if (level === 'debug') {
        console.debug(prefix);
      } else {
        console.log(prefix);
      }
    }
  }

  info(message: string, context?: LogContextArg): void {
    this.print(this.formatEntry('info', message, context as LogContext));
  }

  warn(message: string, context?: LogContextArg): void {
    this.print(this.formatEntry('warn', message, context as LogContext));
  }

  error(message: string, context?: LogContextArg): void {
    // If context is just an error object, wrap it
    const ctx = context instanceof Error ? { error: context.message, stack: context.stack } : (context as LogContext);
    this.print(this.formatEntry('error', message, ctx));
  }

  debug(message: string, context?: LogContextArg): void {
    this.print(this.formatEntry('debug', message, context as LogContext));
  }
}

export const logger = new Logger();
export default logger;
