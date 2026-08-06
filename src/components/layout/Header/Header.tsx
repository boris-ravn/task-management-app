import { BellIcon } from '../../ui/icons/BellIcon'
import { SearchIcon } from '../../ui/icons/SearchIcon'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.search}>
        <SearchIcon className={styles.icon} />
        <input type="text" placeholder="Search" className={styles.searchInput} />
      </div>

      <div className={styles.actions}>
        <BellIcon className={styles.icon} />
        <div className={styles.avatar} />
      </div>
    </header>
  )
}
