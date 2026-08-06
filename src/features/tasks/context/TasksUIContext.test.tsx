import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TasksUIProvider, useTasksUI } from './TasksUIContext';

function wrapper({ children }: { children: ReactNode }) {
  return <TasksUIProvider>{children}</TasksUIProvider>;
}

describe('useTasksUI', () => {
  it('exposes initial state with isModalOpen: false', () => {
    const { result } = renderHook(() => useTasksUI(), { wrapper });
    expect(result.current.state.isModalOpen).toBe(false);
  });

  it('dispatching OPEN_MODAL sets isModalOpen to true', () => {
    const { result } = renderHook(() => useTasksUI(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'OPEN_MODAL' });
    });
    expect(result.current.state.isModalOpen).toBe(true);
  });

  it('dispatching CLOSE_MODAL after OPEN_MODAL sets isModalOpen back to false', () => {
    const { result } = renderHook(() => useTasksUI(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'OPEN_MODAL' });
    });
    expect(result.current.state.isModalOpen).toBe(true);

    act(() => {
      result.current.dispatch({ type: 'CLOSE_MODAL' });
    });
    expect(result.current.state.isModalOpen).toBe(false);
  });

  it('throws when used outside TasksUIProvider', () => {
    expect(() => renderHook(() => useTasksUI())).toThrow(
      'useTasksUI must be used within a TasksUIProvider');
  });
});
