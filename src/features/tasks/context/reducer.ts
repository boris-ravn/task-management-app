export interface TasksUIState {
  isModalOpen: boolean;
}

export type TasksUIAction = 
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' };

export const initialState: TasksUIState = {
  isModalOpen: false
};

export function tasksUIReducer(state: TasksUIState, action: TasksUIAction): TasksUIState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { ...state, isModalOpen: true };
    case 'CLOSE_MODAL':
      return { ...state, isModalOpen: false };
    default:
      return state;
  }
}
