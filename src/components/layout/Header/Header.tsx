import type { ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProfile } from '../../../features/profile/hooks/useProfile';

import { BellIcon } from '../../ui/icons/BellIcon';
import { SearchIcon } from '../../ui/icons/SearchIcon';
import styles from './Header.module.css';

export function Header() {
  const navigate = useNavigate();
  const { user } = useProfile();

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    const value = e.target.value;

    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }

    setSearchParams(params);
  };

  return (
    <header className={styles.header}>
      <div className={styles.search}>
        <SearchIcon className={styles.icon} />

        <input
          type="text"
          placeholder="Search tasks..."
          value={q}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.actions}>
        <BellIcon className={styles.icon} />

        <button
          className={styles.avatarButton}
          onClick={() => navigate('/profile')}
        >
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