import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import { useCreateTask } from './useCreateTask';
import { CREATE_TASK } from '../graphql/mutations';
import { GET_TASKS } from '../graphql/queries';
import type { ReactNode } from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';

const MOCK_INPUT = {
  name: 'New Task',
  dueDate: '2024-07-01',
  pointEstimate: 'TWO',
  status: 'TODO',
  tags: ['IOS'],
};

const successMock: MockLink.MockedResponse = {
  request: {
    query: CREATE_TASK,
    variables: { input: MOCK_INPUT },
  },
  result: {
    data: {
      createTask: {
        id: '1',
        ...MOCK_INPUT,
        assignee: null,
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
  return ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

describe('useCreateTask', () => {
  it('starts with loading:false before the mutation is called', () => {
    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper([successMock, refetchMock]),
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('calls the mutation and resolves without error', async () => {
    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper([successMock, refetchMock]),
    });

    await act(async () => {
      await result.current.createTask({ variables: { input: MOCK_INPUT } });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });
  });
});
