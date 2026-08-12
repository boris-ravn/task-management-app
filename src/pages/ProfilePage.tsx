import { useNavigate } from 'react-router-dom';
import { useProfile } from '../features/profile/hooks/useProfile';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, error, retry } = useProfile();

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.message}>Loading...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.page}>
        <p className={styles.message}>Error loading profile.</p>
        <button className={styles.retryButton} onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>← Back</button>

      <div className={styles.card}>
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarFallback} />
        )}

        <h1 className={styles.name}>{user.fullName}</h1>
        <p className={styles.meta}>{user.email}</p>
        <p className={styles.meta}>Role: {user.type}</p>
        <p className={styles.meta}>
          Member since: {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}