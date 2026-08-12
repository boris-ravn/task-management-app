import { useState } from 'react';
import type { Task } from '../../types'
import { TaskTag, PointEstimate } from '../../types'
import { ClockIcon } from '../../../../components/ui/icons/ClockIcon'
import { OptionsIcon } from '../../../../components/ui/icons/OptionsIcon'
import { EditIcon } from '../../../../components/ui/icons/EditIcon'
import { DeleteIcon } from '../../../../components/ui/icons/DeleteIcon'
import { useTasksUI } from '../../context/TasksUIContext'
import { useToast } from '../../../../context/ToastContext/ToastContext'
import { useDeleteTask } from '../../hooks/useDeleteTask'
import styles from './TaskCard.module.css'
import { normalizeAvatarUrl } from '../../../../lib/avatar';
import { isOverdue, formatDueDate } from '../../../../lib/date';
import { logError } from '../../../../lib/error-logger';

const POINT_LABELS: Record<PointEstimate, string> = {
  [PointEstimate.ZERO]: '0',
  [PointEstimate.ONE]: '1',
  [PointEstimate.TWO]: '2',
  [PointEstimate.FOUR]: '4',
  [PointEstimate.EIGHT]: '8',
}

const TAG_LABELS: Record<TaskTag, string> = {
  [TaskTag.IOS]: 'IOS APP',
  [TaskTag.ANDROID]: 'ANDROID',
  [TaskTag.NODE_JS]: 'NODE.JS',
  [TaskTag.REACT]: 'REACT',
  [TaskTag.RAILS]: 'RAILS',
}

const TAG_COLORS: Record<TaskTag, string> = {
  [TaskTag.IOS]: '#70B252',
  [TaskTag.ANDROID]: '#E5B454',
  [TaskTag.NODE_JS]: '#9B7FE0',
  [TaskTag.REACT]: '#4098FF',
  [TaskTag.RAILS]: '#4FB3A6',
}

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate)

  const { dispatch } = useTasksUI()
  const { showToast } = useToast()
  const { deleteTask, loading: deleteLoading } = useDeleteTask()
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteTask({ variables: { input: { id: task.id } } })
      showToast('success', 'Task deleted')
      setShowDeleteConfirm(false)
    } catch (error) {
      logError(error, { action: 'deleteTask', taskId: task.id })
      showToast('error', 'Could not delete task')
    }
  }

  return (
    <div className={styles.card}>

      <div className={styles.header}>
        <span className={styles.title}>{task.name}</span>
        <button
          aria-label="Task options"
          className={styles.optionsButton}
          onClick={() => setShowMenu(prev => !prev)}
        >
          <OptionsIcon />
        </button>
      </div>

      {showMenu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9 }}
            onClick={() => setShowMenu(false)}
          />
          <div className={styles.menu}>
            <button
              className={styles.menuItem}
              onClick={() => {
                dispatch({ type: 'OPEN_MODAL_FOR_EDIT', task })
                setShowMenu(false)
              }}
            >
              <EditIcon />
              Edit
            </button>

            <button
              className={styles.menuItem}
              onClick={() => {
                setShowDeleteConfirm(true)
                setShowMenu(false)
              }}
            >
              <DeleteIcon />
              Delete
            </button>
          </div>
        </>
      )}

      <div className={styles.meta}>
        <span>{POINT_LABELS[task.pointEstimate]} Points</span>
        <div data-testid="due-date" className={`${styles.dueDate} ${overdue ? styles.dueDateOverdue : ''}`}>
          <ClockIcon />
          <span>{formatDueDate(task.dueDate)}</span>
        </div>
      </div>

      <div className={styles.tags}>
        {task.tags.map(tag => (
          <span
            key={tag}
            className={styles.tag}
            style={{
              color: TAG_COLORS[tag],
              backgroundColor: `${TAG_COLORS[tag]}1A`,
            }}
          >
            {TAG_LABELS[tag]}
          </span>
        ))}
      </div>

      <div className={styles.footer}>
        {task.assignee ? (
          <img
            src={normalizeAvatarUrl(task.assignee.avatar)}
            alt={task.assignee.fullName}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatar} />
        )}
      </div>

      {showDeleteConfirm && (
        <div className={styles.deleteOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.deleteDialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.deleteTitle}>Delete Task</h3>
            <p className={styles.deleteBody}>Are you sure you want to delete this task?</p>
            <hr className={styles.deleteDivider} />
            <div className={styles.deleteActions}>
              <button
                className={styles.goBackButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Go back
              </button>
              <button
                className={styles.deleteButton}
                disabled={deleteLoading}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
