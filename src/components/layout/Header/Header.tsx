import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../../features/profile/hooks/useProfile';

import { BellIcon } from '../../ui/icons/BellIcon';
import { SearchIcon } from '../../ui/icons/SearchIcon';
import styles from './Header.module.css';

export function Header() {
  const navigate = useNavigate();
  const { user } = useProfile();

  return (
    <header className={styles.header}>
      <div className={styles.search}>
        <SearchIcon className={styles.icon} />
        <input type="text" placeholder="Search" className={styles.searchInput} />
      </div>

      <div className={styles.actions}>
        <BellIcon className={styles.icon} />

        <button className={styles.avatarButton} onClick={() => navigate('/profile')}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              className={styles.avatar}
              alt={user.fullName}
            />
          ) : (
            <div className={styles.avatar} />
          )}
        </button>
      </div>
    </header>
  );
}