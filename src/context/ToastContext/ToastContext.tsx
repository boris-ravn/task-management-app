import { createContext, useCallback, useContext, useReducer, useRef } from 'react';
import type { ReactNode } from 'react';
import { toastReducer, initialState } from './reducer';
import type { Toast, ToastVariant } from './reducer';

interface ToastContextValue {
  toasts: Toast[];
  showToast: (variant: ToastVariant, message: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  // Ids are generated here so the reducer stays pure, and callers never deal with them.
  const nextId = useRef(0);

  const showToast = useCallback((variant: ToastVariant, message: string) => {
    nextId.current += 1;
    dispatch({
      type: 'SHOW_TOAST',
      toast: { id: String(nextId.current), variant, message },
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'DISMISS_TOAST', id });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
