import { useMutation } from '@apollo/client/react';
import { UPDATE_TASK } from '../graphql/mutations'
import { GET_TASKS } from '../graphql/queries'

export function useUpdateTask() {
    const [updateTask, { loading, error }] = useMutation(UPDATE_TASK, {
        refetchQueries: [GET_TASKS],
    });
    return { updateTask, loading, error };
}
