import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext/ToastContext';
import { DashboardPage } from './DashboardPage';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { Status, TaskTag, PointEstimate } from '../features/tasks/types';
import type { Task } from '../features/tasks/types';

vi.mock('../features/tasks/hooks/useTasks', () => ({
  useTasks: vi.fn(() => ({ tasks: [], loading: true, error: undefined, searchTerm: '', retry: vi.fn() })),
}));

vi.mock('../features/tasks/hooks/useCreateTask', () => ({
  useCreateTask: () => ({
    createTask: vi.fn(),
    loading: false,
    error: undefined,
  }),
}));

vi.mock('../features/tasks/hooks/useUsers', () => ({
  useUsers: () => ({
    users: [{ id: 'u1', fullName: 'Jane Doe', avatar: null }],
    loading: false,
    error: undefined,
  }),
}));

vi.mock('../features/tasks/hooks/useUpdateTask', () => ({
  useUpdateTask: () => ({
    updateTask: vi.fn(),
    loading: false,
    error: undefined,
  }),
}));

vi.mock('../features/tasks/hooks/useDeleteTask', () => ({
  useDeleteTask: () => ({
    deleteTask: vi.fn(),
    loading: false,
    error: undefined,
  }),
}));

const mockRetry = vi.fn();

const MOCK_TASK = {
  id: '1',
  name: 'Test Task',
  status: Status.TODO,
  tags: [TaskTag.REACT],
  pointEstimate: PointEstimate.FOUR,
  dueDate: '2026-06-15T00:00:00.000Z',
  assignee: null,
} as Task;

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a loading indicator while tasks are loading', () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: true, error: undefined, searchTerm: '', retry: vi.fn() });
    render(<MemoryRouter><ToastProvider><DashboardPage /></ToastProvider></MemoryRouter>);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  // cache-and-network reports loading during every background revalidation, so a
  // loading-only guard would blank the board on each debounced keystroke.
  it('keeps the board rendered while revalidating with tasks already loaded', () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [MOCK_TASK], loading: true, error: undefined, searchTerm: '', retry: vi.fn() });
    render(<MemoryRouter><ToastProvider><DashboardPage /></ToastProvider></MemoryRouter>);

    expect(screen.getByText(/backlog/i)).toBeInTheDocument();
    expect(screen.getByText(MOCK_TASK.name)).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('keeps the board rendered when a revalidation fails with tasks already loaded', () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [MOCK_TASK], loading: false, error: new Error('fail'), searchTerm: '', retry: mockRetry });
    render(<MemoryRouter><ToastProvider><DashboardPage /></ToastProvider></MemoryRouter>);

    expect(screen.getByText(MOCK_TASK.name)).toBeInTheDocument();
    expect(screen.queryByText('Error loading tasks.')).not.toBeInTheDocument();
  });

  it('renders an error message when tasks fail to load', () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: false, error: new Error('fail'), searchTerm: '', retry: mockRetry });
    render(<MemoryRouter><ToastProvider><DashboardPage /></ToastProvider></MemoryRouter>);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('offers a retry that re-runs the query when tasks fail to load', async () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: false, error: new Error('fail'), searchTerm: '', retry: mockRetry });
    render(<MemoryRouter><ToastProvider><DashboardPage /></ToastProvider></MemoryRouter>);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('renders all five column labels', () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [MOCK_TASK], loading: false, error: undefined, searchTerm: '', retry: vi.fn() });
    render(<MemoryRouter><ToastProvider><DashboardPage /></ToastProvider></MemoryRouter>);
    expect(screen.getByText(/backlog/i)).toBeInTheDocument();
    expect(screen.getByText(/to do/i)).toBeInTheDocument();
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/done/i)).toBeInTheDocument();
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
  });

  it('shows a no-tasks-yet empty state when there are no tasks and no search', () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: false, error: undefined, searchTerm: '', retry: vi.fn() });
    render(<MemoryRouter><ToastProvider><DashboardPage /></ToastProvider></MemoryRouter>);

    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.queryByText(/backlog/i)).not.toBeInTheDocument();
  });

  it('names the search term in the empty state when a search returns nothing', () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: false, error: undefined, searchTerm: 'zzz', retry: vi.fn() });
    render(<MemoryRouter><ToastProvider><DashboardPage /></ToastProvider></MemoryRouter>);

    expect(screen.getByText('No tasks match "zzz"')).toBeInTheDocument();
  });

  it('keeps the add-task button reachable while the board is empty', () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: false, error: undefined, searchTerm: '', retry: vi.fn() });
    render(<MemoryRouter><ToastProvider><DashboardPage /></ToastProvider></MemoryRouter>);

    expect(screen.getAllByRole('button', { name: /add task/i }).length).toBeGreaterThan(0);
  });

  it('clicking the + button opens the task modal', async () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: false, error: undefined, searchTerm: '', retry: vi.fn() });
    render(<MemoryRouter><ToastProvider><DashboardPage /></ToastProvider></MemoryRouter>);
    const addButton = screen.getAllByRole('button', { name: /add task/i })[0];
    await userEvent.click(addButton);
    expect(screen.getByPlaceholderText(/task title/i)).toBeInTheDocument();
  });
});
