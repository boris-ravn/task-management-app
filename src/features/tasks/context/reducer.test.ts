import { describe, it, expect } from 'vitest';
import { tasksUIReducer, initialState } from './reducer';
import type { TasksUIState } from './reducer';
import { PointEstimate, Status, TaskTag, UserType } from '../types';

const mockTask = {
  id: '1',
  name: 'Test Task',
  status: Status.TODO,
  pointEstimate: PointEstimate.ONE,
  dueDate: '2024-01-01',
  tags: [TaskTag.IOS],
  assignee: null,
  creator: {
    id: 'user-1',
    fullName: 'Test User',
    avatar: null,
    email: 'test@example.com',
    type: UserType.ADMIN,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  position: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('tasksUIReducer', () => {
  it('initialState has isModalOpen set to closed', () => {
    expect(initialState.modal.mode).toBe('closed');
  });

  it('OPEN_MODAL sets isModalOpen to create', () => {
    const state = tasksUIReducer(initialState, { type: 'OPEN_MODAL' });
    expect(state.modal.mode).toBe('create');
  });

  it('CLOSE_MODAL sets isModalOpen to closed', () => {
    const state = tasksUIReducer({ ...initialState, modal: { mode: 'create' } }, { type: 'CLOSE_MODAL' });
    expect(state.modal.mode).toBe('closed');
  });

  it('does not mutate the state argument', () => {
    const originalState: TasksUIState = { modal: { mode: 'closed' } };
    const newState = tasksUIReducer(originalState, { type: 'OPEN_MODAL' });
    expect(originalState.modal.mode).toBe('closed');
    expect(newState.modal.mode).toBe('create');
  });

  it('OPEN_MODAL_FOR_EDIT sets modal mode to edit and stores the task', () => {
    const state = tasksUIReducer(initialState, { type: 'OPEN_MODAL_FOR_EDIT', task: mockTask });
    expect(state.modal.mode).toBe('edit');
    if(state.modal.mode === 'edit') {
      expect(state.modal.task).toEqual(mockTask);
    }
  });

});
