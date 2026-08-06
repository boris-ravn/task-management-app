import type { Task } from '../types';

export type ModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; task: Task };

export interface TasksUIState {
  modal: ModalState;
}

export type TasksUIAction =
  | { type: 'OPEN_MODAL' }
  | { type: 'OPEN_MODAL_FOR_EDIT'; task: Task }
  | { type: 'CLOSE_MODAL' };

export const initialState: TasksUIState = {
  modal: { mode: 'closed' },
};

export function tasksUIReducer(state: TasksUIState, action: TasksUIAction): TasksUIState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        ...state,
        modal: { mode: 'create' }
      };
    case 'OPEN_MODAL_FOR_EDIT':
      return {
        ...state,
        modal: { mode: 'edit', task: action.task }
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modal: { mode: 'closed' }
      };
    default:
      return state;
  }
}
