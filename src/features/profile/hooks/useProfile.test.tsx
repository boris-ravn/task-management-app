import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { useProfile } from './useProfile';
import { GET_PROFILE } from '../graphql/queries';

const MOCK_USER = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  type: 'CANDIDATE',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: '2023-01-15T00:00:00.000Z',
};

const successMock: MockLink.MockedResponse = {
  request: {
    query: GET_PROFILE,
  },
  result: {
    data: {
      profile: MOCK_USER,
    },
  },
};

const errorMock: MockLink.MockedResponse = {
  request: {
    query: GET_PROFILE,
  },
  error: new Error('Network error'),
};

function createWrapper(mocks: MockLink.MockedResponse[]) {
  const client = new ApolloClient({
    link: new MockLink(mocks),
    cache: new InMemoryCache(),
  });

  return ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
}

describe('useProfile', () => {
  it('returns loading: true and user: undefined on initial render', () => {
    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper([successMock]),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('returns the user after the query resolves', async () => {
    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper([successMock]),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user?.fullName).toBe(MOCK_USER.fullName);
    expect(result.current.user?.email).toBe(MOCK_USER.email);
    expect(result.current.error).toBeUndefined();
  });

  it('returns an error when the query fails', async () => {
    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper([errorMock]),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Network error');
  });
});