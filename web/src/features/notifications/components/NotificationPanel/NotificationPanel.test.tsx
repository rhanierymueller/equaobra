import { render, screen, fireEvent } from '@testing-library/react'

import { NotificationPanel } from './NotificationPanel'

jest.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    mine: [],
    unreadCount: 0,
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    remove: jest.fn(),
    refresh: jest.fn(),
    push: jest.fn(),
  }),
}))

describe('NotificationPanel', () => {
  it('renders the panel header', () => {
    render(<NotificationPanel userId="user-1" onClose={jest.fn()} />)
    expect(screen.getByText(/notificações/i)).toBeInTheDocument()
  })

  it('renders empty state when there are no notifications', () => {
    render(<NotificationPanel userId="user-1" onClose={jest.fn()} />)
    expect(screen.getByText(/nenhuma notificação/i)).toBeInTheDocument()
  })

  it('calls onClose when clicking outside', () => {
    const onClose = jest.fn()
    render(<NotificationPanel userId="user-1" onClose={onClose} />)
    fireEvent.mouseDown(document.body)
    expect(onClose).toHaveBeenCalled()
  })
})
