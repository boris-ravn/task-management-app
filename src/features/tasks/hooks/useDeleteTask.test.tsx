import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { useDeleteTask } from './useDeleteTask';
import { DELETE_TASK } from '../graphql/mutations';
import { GET_TASKS } from '../graphql/queries';

const MOCK_INPUT = { id: '42' };

const successMock: MockLink.MockedResponse = {
  request: {
    query: DELETE_TASK,
    variables: { input: MOCK_INPUT },
  },
  result: {
    data: {
      deleteTask: {
        id: '42',
      },
    },
  },
};

const refetchMock: MockLink.MockedResponse = {
  request: {
    query: GET_TASKS,
    variables: { input: {} },
  },
  result: {
    data: {
      tasks: [],
    },
  },
};

function createWrapper(mocks: MockLink.MockedResponse[]) {
  const client = new ApolloClient({
    link: new MockLink(mocks),
    cache: new InMemoryCache(),
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );

  return { client, wrapper };
}

describe('useDeleteTask', () => {
  it('starts with loading: false before the mutation is called', () => {
    const { wrapper } = createWrapper([successMock, refetchMock]);

    const { result } = renderHook(() => useDeleteTask(), {
      wrapper,
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('calls the mutation and resolves without error', async () => {
    const { client, wrapper } = createWrapper([
      successMock,
      refetchMock,
      refetchMock,
    ]);

    const sub = client
      .watchQuery({
        query: GET_TASKS,
        variables: { input: {} },
      })
      .subscribe(() => {});

    const { result } = renderHook(() => useDeleteTask(), {
      wrapper,
    });

    await act(async () => {
      await result.current.deleteTask(MOCK_INPUT.id);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    sub.unsubscribe();
  });
});