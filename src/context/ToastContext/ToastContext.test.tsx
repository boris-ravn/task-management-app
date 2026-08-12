import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider, useToast } from './ToastContext';

function wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('useToast', () => {
  it('exposes initial state with no toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current.toasts).toEqual([]);
  });

  it('showToast adds a toast with the given variant and message', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('success', 'Task created');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].variant).toBe('success');
    expect(result.current.toasts[0].message).toBe('Task created');
  });

  it('assigns each toast a distinct id', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('error', 'first');
      result.current.showToast('error', 'second');
    });

    const [first, second] = result.current.toasts;
    expect(first.id).not.toBe(second.id);
  });

  it('dismissToast removes the toast by id', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('success', 'Task deleted');
    });
    const { id } = result.current.toasts[0];

    act(() => {
      result.current.dismissToast(id);
    });

    expect(result.current.toasts).toEqual([]);
  });

  it('throws when used outside ToastProvider', () => {
    expect(() => renderHook(() => useToast())).toThrow(
      'useToast must be used within a ToastProvider');
  });
});
