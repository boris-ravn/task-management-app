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
  { status: Status.BACKLOG,     label: 'Backlog' },
  { status: Status.TODO,        label: 'To Do' },
  { status: Status.IN_PROGRESS, label: 'In Progress' },
  { status: Status.DONE,        label: 'Done' },
  { status: Status.CANCELLED,   label: 'Cancelled' },
]

function DashboardContent() {
  const { tasks, loading, error } = useTasks()
  const { state, dispatch } = useTasksUI()

  if (loading) {
    return <div className={styles.page}><p>Loading...</p></div>
  }

  if (error) {
    return <div className={styles.page}><p>Error loading tasks.</p></div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          <button className={styles.viewButton}><ListIcon /></button>
          <button className={`${styles.viewButton} ${styles.viewButtonActive}`}><DashboardIcon /></button>
        </div>
        <button
          className={styles.addButton}
          aria-label="Add task"
          onClick={() => dispatch({ type: 'OPEN_MODAL' })}
        >
          <PlusIcon />
        </button>
      </div>
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