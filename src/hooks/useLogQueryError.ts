import { useEffect, useRef } from 'react';
import { logError } from '../lib/error-logger';

/**
 * Reports a failed query to the error logger once per distinct error.
 *
 * Lives in the query hooks rather than in the components that render the error,
 * so a failure cannot go unreported just because a consumer forgot to handle it.
 * The ref guards against duplicate reports from re-renders and from StrictMode's
 * double-invoked effects in development.
 */
export function useLogQueryError(error: Error | undefined, action: string): void {
  const lastLogged = useRef<Error | undefined>(undefined);

  useEffect(() => {
    if (error && lastLogged.current !== error) {
      lastLogged.current = error;
      logError(error, { action });
    }
  }, [error, action]);
}
