import { useEffect, useRef } from 'react';
import { logError } from '../lib/error-logger';

/**
 * Reports a failed query to the error logger once per distinct error. The ref is
 * load-bearing: without it StrictMode's double-invoked effects log twice in dev.
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
