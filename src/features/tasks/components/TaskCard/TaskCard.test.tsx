import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '../../../../context/ToastContext/ToastContext'
import { ToastContainer } from '../../../../components/ui/Toast/ToastContainer'
import { getLoggedErrors, clearLoggedErrors } from '../../../../lib/error-logger'
import { TaskCard } from './TaskCard'
import { Status, TaskTag, PointEstimate } from '../../types'
import type { Task } from '../../types'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

const mockDispatch = vi.hoisted(() => vi.fn())
const mockDeleteTask = vi.hoisted(() => vi.fn().mockResolvedValue({}))

vi.mock('../../context/TasksUIContext', () => ({
  useTasksUI: () => ({ dispatch: mockDispatch }),
}))

vi.mock('../../hooks/useDeleteTask', () => ({
  useDeleteTask: () => ({
    deleteTask: mockDeleteTask,
    loading: false,
    error: undefined,
  }),
}))

const MOCK_TASK: Task = {
  id: '1',
  name: 'Test Task',
  status: Status.TODO,
  tags: [TaskTag.REACT, TaskTag.NODE_JS],
  pointEstimate: PointEstimate.FOUR,
  dueDate: '2026-06-15T00:00:00.000Z',
  assignee: null,
  creator: {
    id: 'u1',
    fullName: 'Jane Smith',
    avatar: null,
    email: 'jane@example.com',
  },
} as Task

// Real ToastProvider rather than a mock, so tests assert the user-visible
// notification instead of a spy call.
function renderCard(task: Task = MOCK_TASK) {
  return render(
    <ToastProvider>
      <TaskCard task={task} />
      <ToastContainer />
    </ToastProvider>,
  )
}

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the task name', () => {
    renderCard()
    expect(screen.getByText(MOCK_TASK.name)).toBeInTheDocument()
  })

  it('renders the point estimate', () => {
    renderCard()
    expect(screen.getByText('4 Points')).toBeInTheDocument()
  })

  it('renders the task tags', () => {
    renderCard()
    expect(screen.getByText('REACT')).toBeInTheDocument()
    expect(screen.getByText('NODE.JS')).toBeInTheDocument()
  })

  // Scoped to these two tests: they need a frozen clock, and fake timers would
  // stall the userEvent-driven tests below.
  describe('due date', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('renders "TODAY" when the due date is today', () => {
      renderCard()
      expect(screen.getByTestId('due-date')).toHaveTextContent('TODAY')
    })

    it('applies overdue class for past due date', () => {
      const pastTask = { ...MOCK_TASK, dueDate: '2026-06-14T00:00:00.000Z' }

      renderCard(pastTask)
      expect(screen.getByTestId('due-date').className).toContain('dueDateOverdue')
    })
  })


  it('clicking ⋯ shows Edit and Delete buttons', async () => {
    renderCard()

    await userEvent.click(screen.getByRole('button', { name: 'Task options' }))

    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('clicking Edit dispatches OPEN_MODAL_FOR_EDIT with the task', async () => {
    renderCard()

    await userEvent.click(screen.getByRole('button', { name: 'Task options' }))
    await userEvent.click(screen.getByText('Edit'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'OPEN_MODAL_FOR_EDIT',
      task: MOCK_TASK,
    })
  })

  it('clicking Delete shows the confirmation message', async () => {
    renderCard()

    await userEvent.click(screen.getByRole('button', { name: 'Task options' }))
    await userEvent.click(screen.getByText('Delete'))

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })

  it('clicking Go back hides the confirmation', async () => {
    renderCard()

    await userEvent.click(screen.getByRole('button', { name: 'Task options' }))
    await userEvent.click(screen.getByText('Delete'))
    await userEvent.click(screen.getByText('Go back'))

    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
  })

  it('clicking confirm Delete calls deleteTask with the task id', async () => {
    renderCard()

    await userEvent.click(screen.getByRole('button', { name: 'Task options' }))

    await userEvent.click(screen.getByText('Delete'))

    await userEvent.click(screen.getByText('Delete'))

    expect(mockDeleteTask).toHaveBeenCalledWith({
      variables: {
        input: {
          id: MOCK_TASK.id,
        },
      },
    })
  })

  it('shows a success toast and closes the dialog when delete succeeds', async () => {
    renderCard()

    await userEvent.click(screen.getByRole('button', { name: 'Task options' }))
    await userEvent.click(screen.getByText('Delete'))
    await userEvent.click(screen.getByText('Delete'))

    expect(screen.getByRole('status')).toHaveTextContent('Task deleted')
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
  })

  describe('when delete fails', () => {
    beforeEach(() => {
      clearLoggedErrors()
      mockDeleteTask.mockRejectedValueOnce(new Error('Network error'))
    })

    it('shows an error toast, keeps the dialog open, and logs the error', async () => {
      renderCard()

      await userEvent.click(screen.getByRole('button', { name: 'Task options' }))
      await userEvent.click(screen.getByText('Delete'))
      await userEvent.click(screen.getByText('Delete'))

      expect(screen.getByRole('alert')).toHaveTextContent('Could not delete task')
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()

      const [entry] = getLoggedErrors()
      expect(entry.message).toBe('Network error')
      expect(entry.context).toEqual({ action: 'deleteTask', taskId: MOCK_TASK.id })
    })
  })
})