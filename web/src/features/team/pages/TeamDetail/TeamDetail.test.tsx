import { render, screen } from '@testing-library/react'

import { TeamDetail } from './TeamDetail'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('@/src/features/team/hooks/useTeams', () => ({
  useTeams: () => ({
    teams: [],
    removeMember: jest.fn(),
    setLeader: jest.fn(),
    updateMemberProfession: jest.fn(),
    deleteTeam: jest.fn(),
  }),
}))

describe('TeamDetail', () => {
  it('renders not found state when team does not exist', () => {
    render(<TeamDetail id="nonexistent-id" />)
    expect(screen.getByText(/equipe não encontrada/i)).toBeInTheDocument()
  })
})
