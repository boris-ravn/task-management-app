import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskModal } from './TaskModal';
import { TasksUIProvider, useTasksUI } from '../../context/TasksUIContext';
import { useEffect } from 'react';
import { Status, TaskTag, PointEstimate, UserType } from '../../types';
import type { Task } from '../../types';

const mockUpdateTask = vi.hoisted(() => vi.fn().mockResolvedValue({}))

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

vi.mock('../../hooks/useUpdateTask', () => ({
  useUpdateTask: () => ({
    updateTask: mockUpdateTask,
    loading: false,
    error: undefined,
  }),
}));

const MOCK_TASK: Task = {
  id: 'task-1',
  name: 'Fix login bug',
  status: Status.IN_PROGRESS,
  pointEstimate: PointEstimate.TWO,
  dueDate: '2026-09-01T00:00:00.000Z',
  tags: [TaskTag.REACT],
  assignee: {
    id: 'u1',
    fullName: 'Jane Doe',
    avatar: null,
    email: 'jane@example.com',
  },
  creator: {
    id: 'u2',
    fullName: 'Bob',
    avatar: null,
    email: 'bob@example.com',
    type: UserType.ADMIN,
  },
  position: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
} as Task;

function OpenAndRender() {
  const { dispatch, state } = useTasksUI();

  useEffect(() => {
    dispatch({ type: 'OPEN_MODAL' });
  }, [dispatch]);

  return state.modal.mode !== 'closed' ? <TaskModal /> : null;
}

function OpenAndRenderInEditMode() {
  const { dispatch, state } = useTasksUI();

  useEffect(() => {
    dispatch({
      type: 'OPEN_MODAL_FOR_EDIT',
      task: MOCK_TASK,
    });
  }, [dispatch]);

  return state.modal.mode !== 'closed' ? <TaskModal /> : null;
}

function renderModal() {
  render(
    <TasksUIProvider>
      <OpenAndRender />
    </TasksUIProvider>
  );
}

function renderModalInEditMode() {
  render(
    <TasksUIProvider>
      <OpenAndRenderInEditMode />
    </TasksUIProvider>,
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

  it('shows "Update" button label in edit mode', () => {
    renderModalInEditMode();

    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.queryByText('Create')).not.toBeInTheDocument();
  });

  it('pre-fills the title input with the task name in edit mode', () => {
    renderModalInEditMode();

    const titleInput = screen.getByPlaceholderText('Task Title');

    expect(titleInput).toHaveValue(MOCK_TASK.name);
  });

  it('pre-fills point estimate in edit mode', () => {
    renderModalInEditMode();

    expect(screen.getByText(MOCK_TASK.pointEstimate)).toBeInTheDocument();
  });

  it('submit calls updateTask with correct variables in edit mode', async () => {
    renderModalInEditMode();

    await userEvent.click(screen.getByText('Update'));

    expect(mockUpdateTask).toHaveBeenCalledWith({
      variables: {
        input: {
          id: MOCK_TASK.id,
          name: MOCK_TASK.name,
          status: MOCK_TASK.status,
          pointEstimate: MOCK_TASK.pointEstimate,
          dueDate: '2026-09-01',
          tags: MOCK_TASK.tags,
          assigneeId: MOCK_TASK.assignee!.id,
        },
      },
    });
  });
})
