import { useQuery } from '@apollo/client/react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../../hooks/useDebounce';
import { useLogQueryError } from '../../../hooks/useLogQueryError';
import { GET_TASKS } from '../graphql/queries';
import type { Task } from '../types';

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: Error | undefined;
  /** The debounced term actually sent to the API, not the raw URL param. */
  searchTerm: string;
  retry: () => void;
}

interface GetTasksData {
  tasks: Task[];
}

export function useTasks(): UseTasksResult {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const debouncedQ = useDebounce(q.trim(), 300);
  const input = debouncedQ ? { name: debouncedQ } : {};

  const { data, loading, error, refetch } = useQuery<GetTasksData>(GET_TASKS, {
    variables: { input },
    // The cache holds a separate list per filter. Revalidating on view is what
    // stops a list another mutation made stale from being served indefinitely.
    fetchPolicy: 'cache-and-network',
  });

  useLogQueryError(error, 'loadTasks');

  return {
    tasks: data?.tasks ?? [],
    loading,
    error,
    searchTerm: debouncedQ,
    retry: () => {
      // A failed retry resurfaces through `error` and is reported by the hook above.
      refetch().catch(() => {});
    },
  };
}