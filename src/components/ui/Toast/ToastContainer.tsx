import { useEffect } from 'react'
import { useToast } from '../../../context/ToastContext/ToastContext'
import type { Toast } from '../../../context/ToastContext/reducer'
import { CloseIcon } from '../icons/CloseIcon'
import styles from './ToastContainer.module.css'

const TOAST_DURATION_MS = 4000

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [toast.id, onDismiss])

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={`${styles.toast} ${toast.variant === 'error' ? styles.toastError : styles.toastSuccess}`}
    >
      <span className={styles.message}>{toast.message}</span>
      <button
        aria-label="Dismiss notification"
        className={styles.dismissButton}
        onClick={() => onDismiss(toast.id)}
      >
        <CloseIcon />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  // The wrapper renders even when empty and carries aria-live: screen readers only
  // announce content added to a region that already existed. Injecting a
  // role="status" node and its text at the same moment is commonly missed, so
  // mounting on demand would silently drop every success notification.
  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  )
}
