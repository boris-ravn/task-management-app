import { describe, it, expect } from 'vitest';
import { tasksUIReducer, initialState } from './reducer';
import type { TasksUIState } from './reducer';


describe('tasksUIReducer', () => {
  it('initialState has isModalOpen set to false', () => {
    expect(initialState.isModalOpen).toBe(false);
  });

  it('OPEN_MODAL sets isModalOpen to true', () => {
    const state = tasksUIReducer(initialState, { type: 'OPEN_MODAL' });
    expect(state.isModalOpen).toBe(true);
  });

  it('CLOSE_MODAL sets isModalOpen to false', () => {
    const state = tasksUIReducer({ ...initialState, isModalOpen: true }, { type: 'CLOSE_MODAL' });
    expect(state.isModalOpen).toBe(false);
  });

  it('does not mutate the state argument', () => {
    const originalState: TasksUIState = { isModalOpen: false };
    const newState = tasksUIReducer(originalState, { type: 'OPEN_MODAL' });
    expect(originalState.isModalOpen).toBe(false);
    expect(newState.isModalOpen).toBe(true);
  });
});
