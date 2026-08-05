import { render, screen } from '@testing-library/react'
import { TaskCard } from './TaskCard'
import { Status, TaskTag, PointEstimate } from '../../types'
import type { Task } from '../../types'
import { describe, expect, it } from 'vitest'

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
    const pastTask = { ...MOCK_TASK, dueDate: new Date(Date.now() - 86400000).toISOString() } // 1 day in the past
    render(<TaskCard task={pastTask} />)
    const dueDateElement = screen.getByTestId('due-date')
    expect(dueDateElement.className).toContain('dueDateOverdue')
  })
})
