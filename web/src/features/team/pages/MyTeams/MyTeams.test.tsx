import { render, screen } from '@testing-library/react'

import { MyTeams } from './MyTeams'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('@/src/features/team/hooks/useTeams', () => ({
  useTeams: () => ({
    teams: [],
    myTeams: [],
    createTeam: jest.fn(),
    addMemberToTeam: jest.fn(),
    removeMember: jest.fn(),
    setLeader: jest.fn(),
    updateMemberProfession: jest.fn(),
    deleteTeam: jest.fn(),
    isInTeam: jest.fn(),
    isInAnyTeam: jest.fn(),
  }),
}))

describe('MyTeams', () => {
  it('renders login prompt when user is not authenticated', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
    render(<MyTeams />)
    expect(screen.getByText(/você precisa estar logado/i)).toBeInTheDocument()
  })

  it('renders empty state when user has no teams', () => {
    jest
      .spyOn(Storage.prototype, 'getItem')
      .mockReturnValue(
        JSON.stringify({ id: 'u1', name: 'Test', email: 't@t.com', role: 'contratante' }),
      )
    render(<MyTeams />)
    expect(screen.getByText(/nenhuma equipe criada/i)).toBeInTheDocument()
  })
})
