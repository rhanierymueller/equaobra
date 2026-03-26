import { render, screen } from '@testing-library/react'

import { TeamStatsGrid } from './TeamStatsGrid'

const baseTeam = {
  id: 't1',
  name: 'Equipe Alpha',
  ownerId: 'u1',
  obraLocation: 'São Paulo, SP',
  scheduledStart: '2026-05-01',
  estimatedDays: 30,
  observations: '',
  active: true,
  createdAt: '2026-01-01',
  members: [
    {
      professionalId: 'p1',
      name: 'Ana',
      profession: 'Pedreiro',
      phone: '',
      avatarUrl: null,
      avatarInitials: 'A',
      hourlyRate: 50,
      isLeader: true,
      status: 'accepted' as const,
      invitationMessage: null,
    },
  ],
}

describe('TeamStatsGrid', () => {
  it('renders scheduled start date', () => {
    render(<TeamStatsGrid team={baseTeam} />)
    expect(screen.getByText('Início previsto')).toBeInTheDocument()
  })

  it('renders estimated days', () => {
    render(<TeamStatsGrid team={baseTeam} />)
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('dias')).toBeInTheDocument()
  })

  it('shows calculated cost when all members have hourly rate', () => {
    render(<TeamStatsGrid team={baseTeam} />)
    // 50/h * 8h * 30 days = 12000
    expect(screen.getByText(/12\.000/)).toBeInTheDocument()
  })

  it('shows "A combinar" when members have no hourly rate', () => {
    const team = {
      ...baseTeam,
      members: [{ ...baseTeam.members[0], hourlyRate: null }],
    }
    render(<TeamStatsGrid team={team} />)
    expect(screen.getByText('A combinar')).toBeInTheDocument()
  })
})
