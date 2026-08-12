import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { ToastProvider, useToast } from '../../../context/ToastContext/ToastContext'
import { ToastContainer } from './ToastContainer'

function ShowToastOnMount({ variant, message }: { variant: 'success' | 'error'; message: string }) {
  const { showToast } = useToast()
  return <button onClick={() => showToast(variant, message)}>trigger</button>
}

function renderWithToast(children: ReactNode) {
  return render(
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>,
  )
}

describe('ToastContainer', () => {
  it('renders nothing when there are no toasts', () => {
    renderWithToast(null)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders a success toast with role status', async () => {
    renderWithToast(<ShowToastOnMount variant="success" message="Task created" />)

    await userEvent.click(screen.getByText('trigger'))

    expect(screen.getByRole('status')).toHaveTextContent('Task created')
  })

  it('renders an error toast with role alert', async () => {
    renderWithToast(<ShowToastOnMount variant="error" message="Could not create task" />)

    await userEvent.click(screen.getByText('trigger'))

    expect(screen.getByRole('alert')).toHaveTextContent('Could not create task')
  })

  it('dismisses a toast when the dismiss button is clicked', async () => {
    renderWithToast(<ShowToastOnMount variant="error" message="Could not create task" />)

    await userEvent.click(screen.getByText('trigger'))
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  describe('auto-dismiss', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    // fireEvent rather than userEvent: userEvent's internal delays stall under fake
    // timers, and here the click is only setup — the timeout is what's under test.
    it('dismisses itself after the timeout elapses', () => {
      renderWithToast(<ShowToastOnMount variant="success" message="Task deleted" />)

      fireEvent.click(screen.getByText('trigger'))
      expect(screen.getByRole('status')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(4000)
      })

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('keeps the toast visible before the timeout elapses', () => {
      renderWithToast(<ShowToastOnMount variant="success" message="Task deleted" />)

      fireEvent.click(screen.getByText('trigger'))

      act(() => {
        vi.advanceTimersByTime(3999)
      })

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })
})
