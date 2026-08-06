import { useMutation } from '@apollo/client/react';
import { CREATE_TASK } from '../graphql/mutations';
import { GET_TASKS } from '../graphql/queries';

export function useCreateTask() {
  const [createTask, { loading, error }] = useMutation(CREATE_TASK, {
    refetchQueries: [GET_TASKS],
  });

  return {
    createTask,
    loading,
    error,
  };
}
