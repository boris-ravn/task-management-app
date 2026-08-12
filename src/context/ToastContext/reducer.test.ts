import { describe, it, expect } from 'vitest';
import { toastReducer, initialState } from './reducer';
import type { Toast, ToastState } from './reducer';

const mockToast: Toast = {
  id: '1',
  variant: 'error',
  message: 'Could not delete task',
};

describe('toastReducer', () => {
  it('initialState has no toasts', () => {
    expect(initialState.toasts).toEqual([]);
  });

  it('SHOW_TOAST appends the toast', () => {
    const state = toastReducer(initialState, { type: 'SHOW_TOAST', toast: mockToast });
    expect(state.toasts).toEqual([mockToast]);
  });

  it('SHOW_TOAST keeps existing toasts in order', () => {
    const second: Toast = { id: '2', variant: 'success', message: 'Task deleted' };
    const state = toastReducer(
      { toasts: [mockToast] },
      { type: 'SHOW_TOAST', toast: second },
    );
    expect(state.toasts).toEqual([mockToast, second]);
  });

  it('DISMISS_TOAST removes only the matching toast', () => {
    const second: Toast = { id: '2', variant: 'success', message: 'Task deleted' };
    const state = toastReducer(
      { toasts: [mockToast, second] },
      { type: 'DISMISS_TOAST', id: '1' },
    );
    expect(state.toasts).toEqual([second]);
  });

  it('DISMISS_TOAST ignores an unknown id', () => {
    const state = toastReducer({ toasts: [mockToast] }, { type: 'DISMISS_TOAST', id: 'nope' });
    expect(state.toasts).toEqual([mockToast]);
  });

  it('does not mutate the state argument', () => {
    const originalState: ToastState = { toasts: [] };
    const newState = toastReducer(originalState, { type: 'SHOW_TOAST', toast: mockToast });
    expect(originalState.toasts).toEqual([]);
    expect(newState.toasts).toHaveLength(1);
  });
});
