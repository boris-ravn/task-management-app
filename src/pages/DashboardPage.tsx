import { useNavigate, useLocation } from 'react-router-dom'
import { Status } from '../features/tasks/types'
import { TaskColumn } from '../features/tasks/components/TaskColumn/TaskColumn'
import { TaskModal } from '../features/tasks/components/TaskModal/TaskModal'
import { TasksUIProvider, useTasksUI } from '../features/tasks/context/TasksUIContext'
import { useTasks } from '../features/tasks/hooks/useTasks'
import { ListIcon } from '../components/ui/icons/ListIcon'
import { DashboardIcon } from '../components/ui/icons/DashboardIcon'
import { PlusIcon } from '../components/ui/icons/PlusIcon'
import styles from './DashboardPage.module.css'

const COLUMNS: { status: Status; label: string }[] = [
  { status: Status.BACKLOG, label: 'Backlog' },
  { status: Status.TODO, label: 'To Do' },
  { status: Status.IN_PROGRESS, label: 'In Progress' },
  { status: Status.DONE, label: 'Done' },
  { status: Status.CANCELLED, label: 'Cancelled' },
]

function DashboardContent() {
  const { tasks, loading, error, searchTerm, retry } = useTasks()
  const { state, dispatch } = useTasksUI()

  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Both guards require an empty list: with cache-and-network, `loading` and
  // `error` also occur during background revalidation, when there is still
  // perfectly good data on screen that must not be replaced.
  if (loading && tasks.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <p className={styles.emptyLabel}>Loading...</p>
        </div>
      </div>
    )
  }

  if (error && tasks.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <p className={styles.emptyLabel}>Error loading tasks.</p>
          <button className={styles.retryButton} onClick={retry}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          <button
            onClick={() => navigate('/tasks')}
            className={`${styles.viewButton} ${
              pathname === '/tasks' ? styles.viewButtonActive : ''
            }`}
          >
            <ListIcon />
          </button>

          <button
            onClick={() => navigate('/')}
            className={`${styles.viewButton} ${
              pathname === '/' ? styles.viewButtonActive : ''
            }`}
          >
            <DashboardIcon />
          </button>
        </div>

        <button
          className={styles.addButton}
          aria-label="Add task"
          onClick={() => dispatch({ type: 'OPEN_MODAL' })}
        >
          <PlusIcon />
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyLabel}>
            {searchTerm ? `No tasks match "${searchTerm}"` : 'No tasks yet'}
          </p>
        </div>
      ) : (
        <div className={styles.columns}>
          {COLUMNS.map(({ status, label }) => (
            <TaskColumn
              key={status}
              status={status}
              label={label}
              tasks={tasks.filter((task) => task.status === status)}
            />
          ))}
        </div>
      )}

      <button
        className={styles.fab}
        aria-label="Add task"
        onClick={() => dispatch({ type: 'OPEN_MODAL' })}
      >
        <PlusIcon />
      </button>

      {state.modal.mode !== 'closed' && <TaskModal />}
    </div>
  )
}

export function DashboardPage() {
  return (
    <TasksUIProvider>
      <DashboardContent />
    </TasksUIProvider>
  )
}