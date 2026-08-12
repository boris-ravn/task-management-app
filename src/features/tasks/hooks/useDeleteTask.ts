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
            // Evicting the entity is enough. The cache keeps one task list per
            // filter, and every one of them drops an unreadable reference on read,
            // so a single eviction updates them all — no per-list logic, and no
            // refetch. Runs twice (optimistic layer, then real result), which is
            // safe because evict is idempotent.
            update: (cache) => {
                cache.evict({ id: cache.identify({ __typename: 'Task', id }) });
            },
        });

    return { deleteTask, loading, error };
}
