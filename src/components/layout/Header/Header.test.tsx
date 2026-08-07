import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Header } from './Header'

vi.mock('../../../features/profile/hooks/useProfile', () => ({
  useProfile: () => ({
    user: { fullName: 'Test User', email: 'test@ravn.co', type: 'CANDIDATE', avatar: null, createdAt: '2026-01-01T00:00:00Z' },
    loading: false,
    error: undefined,
  }),
}))

describe('Header', () => {
  it('renders the search input', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument()
  })
})
