import { useQuery } from '@apollo/client/react';
import { useLogQueryError } from '../../../hooks/useLogQueryError';
import { GET_PROFILE } from '../graphql/queries';

interface User {
  fullName: string;
  email: string;
  type: string;
  avatar: string | null;
  createdAt: string;
}

interface UseProfileResult {
  user: User | undefined;
  loading: boolean;
  error: Error | undefined;
  retry: () => void;
}

interface GetProfileData {
  profile: User;
}

export function useProfile(): UseProfileResult {
  const { data, loading, error, refetch } = useQuery<GetProfileData>(GET_PROFILE);

  useLogQueryError(error, 'loadProfile');

  return {
    user: data?.profile ?? undefined,
    loading,
    error,
    retry: () => {
      // A failed retry resurfaces through `error` and is reported by the hook above.
      refetch().catch(() => {});
    },
  };
}
