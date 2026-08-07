import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import { useTasks } from './useTasks';
import { GET_TASKS } from '../graphql/queries';
import type { ReactNode } from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';

const MOCK_TASK = {
  id: '1',
  name: 'Test Task',
  status: 'TODO',
  pointEstimate: 'FOUR',
  dueDate: '2024-06-30',
  tags: ['IOS'],
  assignee: {
    id: '1',
    fullName: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
  },
};

const successMock: MockLink.MockedResponse = {
  request: {
    query: GET_TASKS,
    variables: { input: {} },
  },
  result: {
    data: {
      tasks: [MOCK_TASK],
    },
  },
};

const errorMock: MockLink.MockedResponse = {
  request: {
    query: GET_TASKS,
    variables: { input: {} },
  },
  error: new Error('Network error'),
};  

function createWrapper(mocks: MockLink.MockedResponse[]) {
  const client = new ApolloClient({
    link: new MockLink(mocks),
    cache: new InMemoryCache(),
  });
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </MemoryRouter>
  );
} 

describe('useTasks', () => {
  it('returns an empty tasks array and loading:true on initial render', () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper([successMock]),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);
  });

  it('returns tasks after the query resolves', async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper([successMock]),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tasks).toHaveLength(1);
    });
    
    expect(result.current.tasks[0].name).toEqual(MOCK_TASK.name);
  });

  it('returns an error when the query fails', async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper([errorMock]),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeDefined();
    });
  });
});
