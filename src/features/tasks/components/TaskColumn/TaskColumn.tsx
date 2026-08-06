import type { Task } from '../../types'
import type { Status } from '../../types'
import { TaskCard } from '../TaskCard/TaskCard'
import styles from './TaskColumn.module.css'

interface TaskColumnProps {
  status: Status
  label: string
  tasks: Task[]
}

export function TaskColumn({ label, tasks }: TaskColumnProps) {
  const count = String(tasks.length).padStart(2, '0')

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>({count})</span>
      </div>
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
