import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { useProfile } from '../features/profile/hooks/useProfile';

vi.mock('../features/profile/hooks/useProfile', () => ({
  useProfile: vi.fn(),
}));

const mockRetry = vi.fn();

const MOCK_USER = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  type: 'CANDIDATE',
  avatar: null,
  createdAt: '2026-01-15T00:00:00.000Z',
};

function renderPage() {
  render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a loading indicator while the profile loads', () => {
    vi.mocked(useProfile).mockReturnValue({ user: undefined, loading: true, error: undefined, retry: mockRetry });
    renderPage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders the profile once it resolves', () => {
    vi.mocked(useProfile).mockReturnValue({ user: MOCK_USER, loading: false, error: undefined, retry: mockRetry });
    renderPage();

    expect(screen.getByText(MOCK_USER.fullName)).toBeInTheDocument();
    expect(screen.getByText(MOCK_USER.email)).toBeInTheDocument();
    expect(screen.getByText(/CANDIDATE/)).toBeInTheDocument();
  });

  it('offers a retry when the query fails', async () => {
    vi.mocked(useProfile).mockReturnValue({ user: undefined, loading: false, error: new Error('fail'), retry: mockRetry });
    renderPage();

    expect(screen.getByText(/error loading profile/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('treats a resolved-but-empty profile as a recoverable error', () => {
    vi.mocked(useProfile).mockReturnValue({ user: undefined, loading: false, error: undefined, retry: mockRetry });
    renderPage();

    expect(screen.getByText(/error loading profile/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
