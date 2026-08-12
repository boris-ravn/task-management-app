export interface ErrorContext {
  action: string;
  [key: string]: unknown;
}

export interface LoggedError {
  message: string;
  stack: string | undefined;
  context: ErrorContext;
  timestamp: string;
}

// Stands in for a remote service (Sentry, Datadog). Swapping the sink for a real
// transport is the only change needed — call sites stay as they are.
const entries: LoggedError[] = [];

export function logError(error: unknown, context: ErrorContext): void {
  const entry: LoggedError = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };

  entries.push(entry);

  if (import.meta.env.DEV) {
    console.error(`[error-logger] ${context.action}: ${entry.message}`, entry);
  }
}

export function getLoggedErrors(): readonly LoggedError[] {
  return entries;
}

export function clearLoggedErrors(): void {
  entries.length = 0;
}
