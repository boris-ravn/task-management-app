import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { PageWrapper } from './PageWrapper'

vi.mock('../../../features/profile/hooks/useProfile', () => ({
  useProfile: () => ({
    user: { fullName: 'Test User', email: 'test@ravn.co', type: 'CANDIDATE', avatar: null, createdAt: '2026-01-01T00:00:00Z' },
    loading: false,
    error: undefined,
  }),
}))

describe('PageWrapper', () => {
  it('renders the sidebar navigation and the page content', () => {
    render(
      <MemoryRouter>
        <PageWrapper>
          <div>Page content</div>
        </PageWrapper>
      </MemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })
})
