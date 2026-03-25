import { render, screen } from '@testing-library/react'

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
    render(<NotificationPanel userId="user-1" />)
    expect(screen.getByText(/notificações/i)).toBeInTheDocument()
  })

  it('renders empty state when there are no notifications', () => {
    render(<NotificationPanel userId="user-1" />)
    expect(screen.getByText(/nenhuma notificação/i)).toBeInTheDocument()
  })
})
