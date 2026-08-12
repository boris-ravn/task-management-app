import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { useDeleteTask } from './useDeleteTask';
import { DELETE_TASK } from '../graphql/mutations';
import { GET_TASKS } from '../graphql/queries';

const DOOMED_ID = '42';
const SURVIVOR_ID = '99';

function task(id: string, name: string) {
  return {
    __typename: 'Task',
    id,
    name,
    status: 'TODO',
    pointEstimate: 'TWO',
    dueDate: '2026-09-01T00:00:00.000Z',
    tags: ['REACT'],
    assignee: null,
  };
}

const UNFILTERED_INPUT = { input: {} };
const FILTERED_INPUT = { input: { name: 'Ticket' } };

const unfilteredListMock: MockLink.MockedResponse = {
  request: { query: GET_TASKS, variables: UNFILTERED_INPUT },
  result: { data: { tasks: [task(DOOMED_ID, 'Ticket doomed'), task(SURVIVOR_ID, 'Ticket survivor')] } },
};

const filteredListMock: MockLink.MockedResponse = {
  request: { query: GET_TASKS, variables: FILTERED_INPUT },
  result: { data: { tasks: [task(DOOMED_ID, 'Ticket doomed')] } },
};

const deleteSuccessMock: MockLink.MockedResponse = {
  request: { query: DELETE_TASK, variables: { input: { id: DOOMED_ID } } },
  result: { data: { deleteTask: { __typename: 'Task', id: DOOMED_ID } } },
};

const deleteErrorMock: MockLink.MockedResponse = {
  request: { query: DELETE_TASK, variables: { input: { id: DOOMED_ID } } },
  error: new Error('Network error'),
};

function createWrapper(mocks: MockLink.MockedResponse[]) {
  // Held separately from client.cache, which is typed as the abstract ApolloCache
  // and whose extract() therefore returns unknown.
  const cache = new InMemoryCache();
  const client = new ApolloClient({ link: new MockLink(mocks), cache });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );

  return { client, cache, wrapper };
}

function cachedIds(client: ApolloClient, variables: Record<string, unknown>) {
  const data = client.readQuery<{ tasks: { id: string }[] }>({
    query: GET_TASKS,
    variables,
  });
  return data?.tasks.map((t) => t.id) ?? null;
}

describe('useDeleteTask', () => {
  it('starts with loading: false before the mutation is called', () => {
    const { wrapper } = createWrapper([deleteSuccessMock]);

    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('removes the task from every cached filter variant with one eviction', async () => {
    const { client, wrapper } = createWrapper([
      unfilteredListMock,
      filteredListMock,
      deleteSuccessMock,
    ]);

    await client.query({ query: GET_TASKS, variables: UNFILTERED_INPUT });
    await client.query({ query: GET_TASKS, variables: FILTERED_INPUT });

    expect(cachedIds(client, UNFILTERED_INPUT)).toEqual([DOOMED_ID, SURVIVOR_ID]);
    expect(cachedIds(client, FILTERED_INPUT)).toEqual([DOOMED_ID]);

    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    await act(async () => {
      await result.current.deleteTask(DOOMED_ID);
    });

    expect(cachedIds(client, UNFILTERED_INPUT)).toEqual([SURVIVOR_ID]);
    expect(cachedIds(client, FILTERED_INPUT)).toEqual([]);
  });

  it('evicts the entity itself, not just the list entries', async () => {
    const { client, cache, wrapper } = createWrapper([unfilteredListMock, deleteSuccessMock]);

    await client.query({ query: GET_TASKS, variables: UNFILTERED_INPUT });
    expect(cache.extract()[`Task:${DOOMED_ID}`]).toBeDefined();

    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    await act(async () => {
      await result.current.deleteTask(DOOMED_ID);
    });

    expect(cache.extract()[`Task:${DOOMED_ID}`]).toBeUndefined();
    expect(cache.extract()[`Task:${SURVIVOR_ID}`]).toBeDefined();
  });

  it('restores the task when the mutation fails', async () => {
    const { client, cache, wrapper } = createWrapper([unfilteredListMock, deleteErrorMock]);

    await client.query({ query: GET_TASKS, variables: UNFILTERED_INPUT });

    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    await act(async () => {
      await expect(result.current.deleteTask(DOOMED_ID)).rejects.toThrow('Network error');
    });

    expect(cachedIds(client, UNFILTERED_INPUT)).toEqual([DOOMED_ID, SURVIVOR_ID]);
    expect(cache.extract()[`Task:${DOOMED_ID}`]).toBeDefined();
  });
});
