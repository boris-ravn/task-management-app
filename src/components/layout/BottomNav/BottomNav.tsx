import { NavLink } from 'react-router-dom'

import { DashboardIcon } from '../../ui/icons/DashboardIcon'
import { ListIcon } from '../../ui/icons/ListIcon'

import styles from './BottomNav.module.css'

export function BottomNav() {
  return (
    <nav className={styles.bottomNav}>
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? `${styles.navItem} ${styles.navItemActive}`
            : styles.navItem
        }
      >
        <DashboardIcon className={styles.icon} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/tasks"
        className={({ isActive }) =>
          isActive
            ? `${styles.navItem} ${styles.navItemActive}`
            : styles.navItem
        }
      >
        <ListIcon className={styles.icon} />
        <span>Tasks</span>
      </NavLink>
    </nav>
  )
}