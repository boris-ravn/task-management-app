import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { useTasks } from '../features/tasks/hooks/useTasks';

vi.mock('../features/tasks/hooks/useTasks', () => ({
  useTasks: vi.fn(() => ({ tasks: [], loading: true, error: undefined })),
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

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a loading indicator while tasks are loading', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders an error message when tasks fail to load', () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: false, error: new Error('fail') });
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('renders all five column labels', () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: false, error: undefined });
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByText(/backlog/i)).toBeInTheDocument();
    expect(screen.getByText(/to do/i)).toBeInTheDocument();
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/done/i)).toBeInTheDocument();
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
  });

  it('clicking the + button opens the task modal', async () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: false, error: undefined });
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    const addButton = screen.getAllByRole('button', { name: /add task/i })[0];
    await userEvent.click(addButton);
    expect(screen.getByPlaceholderText(/task title/i)).toBeInTheDocument();
  });
});
