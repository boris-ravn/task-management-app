import { render, screen } from '@testing-library/react'
import { ToastProvider } from '../../../../context/ToastContext/ToastContext'
import { TaskColumn } from './TaskColumn'
import { Status, TaskTag, PointEstimate, UserType } from '../../types'
import type { Task } from '../../types'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../context/TasksUIContext', () => ({
  useTasksUI: () => ({ dispatch: vi.fn() }),
}))

vi.mock('../../hooks/useDeleteTask', () => ({
  useDeleteTask: () => ({ deleteTask: vi.fn(), loading: false, error: undefined }),
}))

const MOCK_USER = {
  id: 'u1',
  fullName: 'Jane Smith',
  avatar: null,
  email: 'jane@example.com',
  type: UserType.CANDIDATE,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const MOCK_TASKS: Task[] = [
  { id: '1', name: 'Task 1', status: Status.TODO, tags: [TaskTag.REACT], pointEstimate: PointEstimate.TWO, dueDate: new Date().toISOString(), assignee: null, creator: MOCK_USER, position: 1, createdAt: new Date().toISOString() },
  { id: '2', name: 'Task 2', status: Status.TODO, tags: [TaskTag.NODE_JS], pointEstimate: PointEstimate.FOUR, dueDate: new Date().toISOString(), assignee: null, creator: MOCK_USER, position: 2, createdAt: new Date().toISOString() },
]

describe('TaskColumn', () => {

  it('renders the column label', () => {
    render(<ToastProvider><TaskColumn status={Status.TODO} label="To Do" tasks={MOCK_TASKS} /></ToastProvider>)
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('renders the correct task count', () => {
    render(<ToastProvider><TaskColumn status={Status.TODO} label="To Do" tasks={MOCK_TASKS} /></ToastProvider>)
    expect(screen.getByText('(02)')).toBeInTheDocument()
  })

  it('renders a TaskCard for each task', () => {
    render(<ToastProvider><TaskColumn status={Status.TODO} label="To Do" tasks={MOCK_TASKS} /></ToastProvider>)
    MOCK_TASKS.forEach(task => {
      expect(screen.getByText(task.name)).toBeInTheDocument()
    })
  })

  it('renders an empty list without crashing', () => {
    render(<ToastProvider><TaskColumn status={Status.TODO} label="To Do" tasks={[]} /></ToastProvider>)
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('(00)')).toBeInTheDocument()
  })
})
