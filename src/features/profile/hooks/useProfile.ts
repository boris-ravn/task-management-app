import { useQuery } from '@apollo/client/react';
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
}

interface GetProfileData {
  profile: User;
}

export function useProfile(): UseProfileResult {
  const { data, loading, error } = useQuery<GetProfileData>(GET_PROFILE);

  return {
    user: data?.profile ?? undefined,
    loading,
    error,
  };
}