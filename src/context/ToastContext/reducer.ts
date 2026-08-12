export type ToastVariant = 'success' | 'error';

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
}

export interface ToastState {
  toasts: Toast[];
}

export type ToastAction =
  | { type: 'SHOW_TOAST'; toast: Toast }
  | { type: 'DISMISS_TOAST'; id: string };

export const initialState: ToastState = {
  toasts: [],
};

export function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'SHOW_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.toast]
      };
    case 'DISMISS_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.id)
      };
    default:
      return state;
  }
}
