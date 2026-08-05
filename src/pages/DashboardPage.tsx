import type { Task } from '../features/tasks/types'
import { Status, TaskTag, PointEstimate, UserType } from '../features/tasks/types'
import { TaskColumn } from '../features/tasks/components/TaskColumn/TaskColumn'
import { ListIcon } from '../components/ui/icons/ListIcon'
import { DashboardIcon } from '../components/ui/icons/DashboardIcon'
import { PlusIcon } from '../components/ui/icons/PlusIcon'
import styles from './DashboardPage.module.css'

const MOCK_USER = {
  id: 'u1',
  fullName: 'Jane Smith',
  avatar: null,
  email: 'jane@example.com',
  type: UserType.CANDIDATE,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const today = new Date().toISOString()
const yesterday = new Date(Date.now() - 86_400_000).toISOString()
const nextWeek = new Date(Date.now() + 7 * 86_400_000).toISOString()

const MOCK_TASKS: Task[] = [
  { id: '1', name: 'Set up design tokens', status: Status.BACKLOG, tags: [TaskTag.REACT], pointEstimate: PointEstimate.TWO, dueDate: nextWeek, assignee: null, creator: MOCK_USER, position: 1, createdAt: today },
  { id: '2', name: 'Build auth flow', status: Status.BACKLOG, tags: [TaskTag.NODE_JS], pointEstimate: PointEstimate.FOUR, dueDate: yesterday, assignee: MOCK_USER, creator: MOCK_USER, position: 2, createdAt: today },
  { id: '3', name: 'Create wireframes', status: Status.TODO, tags: [TaskTag.IOS, TaskTag.ANDROID], pointEstimate: PointEstimate.ONE, dueDate: today, assignee: MOCK_USER, creator: MOCK_USER, position: 1, createdAt: today },
  { id: '4', name: 'Dashboard UI', status: Status.TODO, tags: [TaskTag.REACT], pointEstimate: PointEstimate.EIGHT, dueDate: nextWeek, assignee: null, creator: MOCK_USER, position: 2, createdAt: today },
  { id: '5', name: 'API integration', status: Status.IN_PROGRESS, tags: [TaskTag.NODE_JS, TaskTag.REACT], pointEstimate: PointEstimate.FOUR, dueDate: yesterday, assignee: MOCK_USER, creator: MOCK_USER, position: 1, createdAt: today },
  { id: '6', name: 'Write unit tests', status: Status.IN_PROGRESS, tags: [TaskTag.RAILS], pointEstimate: PointEstimate.TWO, dueDate: nextWeek, assignee: null, creator: MOCK_USER, position: 2, createdAt: today },
  { id: '7', name: 'Deploy to staging', status: Status.DONE, tags: [TaskTag.NODE_JS], pointEstimate: PointEstimate.ONE, dueDate: yesterday, assignee: MOCK_USER, creator: MOCK_USER, position: 1, createdAt: today },
  { id: '8', name: 'Legacy migration', status: Status.CANCELLED, tags: [TaskTag.RAILS], pointEstimate: PointEstimate.EIGHT, dueDate: yesterday, assignee: null, creator: MOCK_USER, position: 1, createdAt: today },
]

const COLUMNS: { status: Status; label: string }[] = [
  { status: Status.BACKLOG,     label: 'Backlog' },
  { status: Status.TODO,        label: 'To Do' },
  { status: Status.IN_PROGRESS, label: 'In Progress' },
  { status: Status.DONE,        label: 'Done' },
  { status: Status.CANCELLED,   label: 'Cancelled' },
]

export function DashboardPage() {
  return (
    <div className={styles.page}>

      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          <button className={styles.viewButton}>
            <ListIcon />
          </button>
          <button className={`${styles.viewButton} ${styles.viewButtonActive}`}>
            <DashboardIcon />
          </button>
        </div>
        <button className={styles.addButton}>
          <PlusIcon />
        </button>
      </div>

      <div className={styles.columns}>
        {COLUMNS.map(({ status, label }) => (
          <TaskColumn
            key={status}
            status={status}
            label={label}
            tasks={MOCK_TASKS.filter(task => task.status === status)}
          />
        ))}
      </div>

    </div>
  )
}