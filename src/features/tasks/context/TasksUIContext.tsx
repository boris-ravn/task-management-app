import { createContext, useContext, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { tasksUIReducer, initialState } from './reducer';
import type { TasksUIState, TasksUIAction } from './reducer';

interface TasksUIContextValue {
  state: TasksUIState;
  dispatch: Dispatch<TasksUIAction>;
}

const TasksUIContext = createContext<TasksUIContextValue | null>(null);

export function TasksUIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tasksUIReducer, initialState);

  return (
    <TasksUIContext.Provider value={{ state, dispatch }}>
      {children}
    </TasksUIContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTasksUI(): TasksUIContextValue {
  const context = useContext(TasksUIContext);
  if (!context) {
    throw new Error('useTasksUI must be used within a TasksUIProvider');
  }
  return context;
}
