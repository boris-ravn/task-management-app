import { NavLink } from 'react-router-dom'
import { DashboardIcon } from '../../ui/icons/DashboardIcon'
import { ListIcon } from '../../ui/icons/ListIcon'
import ravnLogo from '../../../assets/ravn-logo.png'
import styles from './Sidebar.module.css'

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <img src={ravnLogo} alt="Ravn" className={styles.logo} />

      <nav className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
          }
        >
          <DashboardIcon className={styles.icon} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
          }
        >
          <ListIcon className={styles.icon} />
          <span>Tasks</span>
        </NavLink>
      </nav>
    </aside>
  )
}
