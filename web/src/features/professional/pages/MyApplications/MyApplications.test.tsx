import { render, screen } from '@testing-library/react'

import { MyApplications } from './MyApplications'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('@/src/features/opportunity/hooks/useInterests', () => ({
  useInterests: () => ({ interests: [] }),
}))
jest.mock('@/src/features/opportunity/hooks/useOpportunities', () => ({
  useOpportunities: () => ({ opportunities: [] }),
}))

describe('MyApplications', () => {
  it('renders login prompt when user is not authenticated', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
    render(<MyApplications />)
    expect(screen.getByText(/você precisa estar logado/i)).toBeInTheDocument()
  })

  it('renders empty state when user has no applications', () => {
    jest
      .spyOn(Storage.prototype, 'getItem')
      .mockReturnValue(JSON.stringify({ id: 'u1', name: 'Test', email: 't@t.com', role: 'profissional' }))
    render(<MyApplications />)
    expect(screen.getByText(/nenhuma candidatura ainda/i)).toBeInTheDocument()
  })
})
