import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PageWrapper } from './PageWrapper'

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
