import { useQuery } from '@apollo/client/react';
import { GET_TASKS } from '../graphql/queries';
import type { Task } from '../types';

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: Error | undefined;
}

interface GetTasksData {
  tasks: Task[];
}


export function useTasks(): UseTasksResult {
  const { data, loading, error } = useQuery<GetTasksData>(GET_TASKS, {
    variables: { input: {} },
  });

  return {
    tasks: data?.tasks ?? [],
    loading,
    error,
  };
}
