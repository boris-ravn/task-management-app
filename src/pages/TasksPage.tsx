import { useNavigate, useLocation } from 'react-router-dom'
import { ListIcon } from '../components/ui/icons/ListIcon'
import { DashboardIcon } from '../components/ui/icons/DashboardIcon'
import styles from './TasksPage.module.css'

export function TasksPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${
              pathname === '/tasks' ? styles.viewButtonActive : ''
            }`}
            onClick={() => navigate('/tasks')}
          >
            <ListIcon />
          </button>

          <button
            className={`${styles.viewButton} ${
              pathname === '/' ? styles.viewButtonActive : ''
            }`}
            onClick={() => navigate('/')}
          >
            <DashboardIcon />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <p className={styles.label}>Coming soon...</p>
      </div>
    </div>
  )
}