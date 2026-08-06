import { useMutation } from '@apollo/client/react';
import { DELETE_TASK } from '../graphql/mutations'
import { GET_TASKS } from '../graphql/queries'  

export function useDeleteTask() {
    const [deleteTask, { loading, error }] = useMutation(DELETE_TASK, {
        refetchQueries: [GET_TASKS],
    });
    return { deleteTask, loading, error };
}
