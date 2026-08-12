import { useMutation } from '@apollo/client/react';
import { DELETE_TASK } from '../graphql/mutations'

interface DeleteTaskData {
  deleteTask: { __typename: 'Task'; id: string };
}

export function useDeleteTask() {
    const [mutate, { loading, error }] = useMutation<DeleteTaskData>(DELETE_TASK);

    const deleteTask = (id: string) =>
        mutate({
            variables: { input: { id } },
            // __typename is required: Apollo only injects it into the server's
            // selection set, so without it this write is never normalized and the
            // eviction below finds nothing to remove.
            optimisticResponse: { deleteTask: { __typename: 'Task', id } },
            // Runs twice — optimistic layer, then real result — so it has to be
            // idempotent. Splicing the lists by hand would double-apply; evicting
            // the entity is both idempotent and enough, since every cached list
            // drops an unreadable reference on read.
            update: (cache) => {
                cache.evict({ id: cache.identify({ __typename: 'Task', id }) });
            },
        });

    return { deleteTask, loading, error };
}
