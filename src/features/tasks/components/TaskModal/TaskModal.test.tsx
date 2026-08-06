import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskModal } from './TaskModal';
import { TasksUIProvider, useTasksUI } from '../../context/TasksUIContext';
import { useEffect } from 'react';

vi.mock('../../hooks/useCreateTask', () => ({
  useCreateTask: () => ({
    createTask: vi.fn(),
    loading: false,
    error: undefined,
  }),
}));

vi.mock('../../hooks/useUsers', () => ({
  useUsers: () => ({
    users: [{ id: 'u1', fullName: 'Jane Doe', avatar: null }],
    loading: false,
    error: undefined,
  }),
}));

function OpenAndRender() {
  const { dispatch, state } = useTasksUI();

  useEffect(() => {
    dispatch({ type: 'OPEN_MODAL' });
  }, [dispatch]);

  return state.isModalOpen ? <TaskModal /> : null;
}

function renderModal() { 
  render(
    <TasksUIProvider>
      <OpenAndRender />
    </TasksUIProvider>
  );
}

describe('TaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title input', () => {
    renderModal();
    const titleInput = screen.getByPlaceholderText('Task Title');
    expect(titleInput).toBeInTheDocument();
  });

  it('renders all picker labels', () => {
    renderModal();
    expect(screen.getByText('Estimate')).toBeInTheDocument();
    expect(screen.getByText('BACKLOG')).toBeInTheDocument();
    expect(screen.getByText('Assignee')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
  });

  it('Create button is disabled when no fields are filled', () => {
    renderModal();
    const createButton = screen.getByText('Create');
    expect(createButton).toBeDisabled();
  });

  it('Cancel button dispatches CLOSE_MODAL', async () => {
    renderModal();
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
    const titleInput = screen.queryByPlaceholderText('Task Title');
    expect(titleInput).not.toBeInTheDocument();
  });
});
