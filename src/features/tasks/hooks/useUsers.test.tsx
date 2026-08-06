import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { useUsers } from './useUsers';
import { GET_USERS } from '../graphql/queries';

const MOCK_USER = {
  id: '1',
  fullName: 'John Doe',
  avatar: 'https://example.com/avatar.jpg',
};

const successMock: MockLink.MockedResponse = {
  request: {
    query: GET_USERS,
  },
  result: {
    data: {
      users: [MOCK_USER],
    },
  },
};

const errorMock: MockLink.MockedResponse = {
  request: {
    query: GET_USERS,
  },
  error: new Error('Network error'),
};

function createWrapper(mocks: MockLink.MockedResponse[]) {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new MockLink(mocks),
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
  };
}

describe('useUsers', () => {
  it('returns an empty users array and loading:true on initial render', () => {
    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper([successMock]),
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
  });

  it('returns users after the query resolves', async () => {
    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper([successMock]),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].fullName).toBe(MOCK_USER.fullName);
    expect(result.current.error).toBeUndefined();
  });

  it('returns an error when the query fails', async () => {
    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper([errorMock]),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Network error');
  });
});
