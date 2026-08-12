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

  if (toasts.length === 0) return null

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  )
}
