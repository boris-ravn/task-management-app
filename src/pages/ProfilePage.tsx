import { useNavigate } from 'react-router-dom';
import { useProfile } from '../features/profile/hooks/useProfile';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, error } = useProfile();

  if (loading) {
    return (
      <div className={styles.page}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <p>Error loading profile.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <p>Error loading profile.</p>
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