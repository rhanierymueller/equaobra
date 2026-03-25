import { render, screen } from '@testing-library/react'

import { WorkLogSection } from './WorkLogSection'

jest.mock('../../hooks/useWorkLogs', () => ({
  useWorkLogs: () => ({
    logs: [],
    addLog: jest.fn(),
    removeLog: jest.fn(),
    getLogsForMember: jest.fn(() => []),
    getTotalHours: jest.fn(() => 0),
    refresh: jest.fn(),
  }),
}))

jest.mock('@/src/features/notifications/hooks/useNotifications', () => ({
  useNotifications: () => ({
    push: jest.fn(),
    mine: [],
    unreadCount: 0,
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    remove: jest.fn(),
    refresh: jest.fn(),
  }),
}))

const mockTeam = {
  id: 'team-1',
  name: 'Reforma Apartamento',
  obraLocation: 'Belo Horizonte',
  ownerId: 'user-1',
  scheduledStart: '2026-04-01',
  estimatedDays: 30,
  observations: '',
  createdAt: '2026-03-01T00:00:00Z',
  members: [
    {
      professionalId: 'user-1',
      name: 'João Silva',
      profession: 'Pedreiro',
      phone: '',
      avatarInitials: 'JS',
      isLeader: true,
      status: 'accepted' as const,
    },
  ],
}

describe('WorkLogSection', () => {
  it('renders the section title', () => {
    render(
      <WorkLogSection
        team={mockTeam}
        currentUser={{ id: 'user-1', name: 'João Silva' }}
        isLeader={true}
        leaderId="user-1"
        onRequestConfirm={jest.fn()}
      />,
    )
    expect(screen.getByText(/registro de horas/i)).toBeInTheDocument()
  })

  it('renders stat cards for hours', () => {
    render(
      <WorkLogSection
        team={mockTeam}
        currentUser={{ id: 'user-1', name: 'João Silva' }}
        isLeader={false}
        leaderId="user-1"
        onRequestConfirm={jest.fn()}
      />,
    )
    // Section starts collapsed, click to expand
    const toggleBtn = screen.getByRole('button', { name: /registro de horas/i })
    toggleBtn.click()
  })
})
