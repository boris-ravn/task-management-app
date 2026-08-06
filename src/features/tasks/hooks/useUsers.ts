import { useQuery } from '@apollo/client/react';
import { GET_USERS } from '../graphql/queries';
import type { User } from '../types';

interface GetUsersData {
  users: User[];
}

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: Error | undefined;
}

export function useUsers(): UseUsersResult {
  const { data, loading, error } = useQuery<GetUsersData>(GET_USERS);

  return {
    users: data?.users ?? [],
    loading,
    error,
  };
}
