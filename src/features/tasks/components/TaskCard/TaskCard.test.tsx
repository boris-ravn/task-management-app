import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'
import { Status, TaskTag, PointEstimate } from '../../types'
import type { Task } from '../../types'
import { describe, expect, it, vi, beforeEach } from 'vitest'

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
  dueDate: new Date().toISOString(),
  assignee: null,
  creator: {
    id: 'u1',
    fullName: 'Jane Smith',
    avatar: null,
    email: 'jane@example.com',
  },
} as Task

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the task name', () => {
    render(<TaskCard task={MOCK_TASK} />)
    expect(screen.getByText(MOCK_TASK.name)).toBeInTheDocument()
  })

  it('renders the point estimate', () => {
    render(<TaskCard task={MOCK_TASK} />)
    expect(screen.getByText('4 Points')).toBeInTheDocument()
  })

  it('renders the task tags', () => {
    render(<TaskCard task={MOCK_TASK} />)
    expect(screen.getByText('REACT')).toBeInTheDocument()
    expect(screen.getByText('NODE.JS')).toBeInTheDocument()
  })

  it('renders "TODAY" for due date when task.dueDate is today', () => {
    const todayTask = { ...MOCK_TASK, dueDate: new Date().toISOString() }
    render(<TaskCard task={todayTask} />)
    expect(screen.getByTestId('due-date')).toHaveTextContent('TODAY')
  })

  it('applies overdue class for past due date', () => {
    const pastTask = {
      ...MOCK_TASK,
      dueDate: new Date(Date.now() - 86400000).toISOString(),
    }

    render(<TaskCard task={pastTask} />)
    const dueDateElement = screen.getByTestId('due-date')
    expect(dueDateElement.className).toContain('dueDateOverdue')
  })


  it('clicking ⋯ shows Edit and Delete buttons', async () => {
    render(<TaskCard task={MOCK_TASK} />)

    await userEvent.click(screen.getByRole('button', { name: 'Task options' }))

    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('clicking Edit dispatches OPEN_MODAL_FOR_EDIT with the task', async () => {
    render(<TaskCard task={MOCK_TASK} />)

    await userEvent.click(screen.getByRole('button', { name: 'Task options' }))
    await userEvent.click(screen.getByText('Edit'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'OPEN_MODAL_FOR_EDIT',
      task: MOCK_TASK,
    })
  })

  it('clicking Delete shows the confirmation message', async () => {
    render(<TaskCard task={MOCK_TASK} />)

    await userEvent.click(screen.getByRole('button', { name: 'Task options' }))
    await userEvent.click(screen.getByText('Delete'))

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })

  it('clicking Go back hides the confirmation', async () => {
    render(<TaskCard task={MOCK_TASK} />)

    await userEvent.click(screen.getByRole('button', { name: 'Task options' }))
    await userEvent.click(screen.getByText('Delete'))
    await userEvent.click(screen.getByText('Go back'))

    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
  })

  it('clicking confirm Delete calls deleteTask with the task id', async () => {
    render(<TaskCard task={MOCK_TASK} />)

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
})