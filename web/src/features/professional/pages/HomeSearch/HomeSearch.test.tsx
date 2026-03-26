import { render, screen } from '@testing-library/react'

import HomeSearch from './HomeSearch'

jest.mock('next/dynamic', () => () => {
  const MockComponent = () => <div data-testid="map-placeholder" />
  MockComponent.displayName = 'MockDynamic'
  return MockComponent
})
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

describe('HomeSearch', () => {
  it('renders navbar and filter sidebar', () => {
    render(<HomeSearch />)
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
    expect(screen.getByText(/filtros/i)).toBeInTheDocument()
  })

  it('renders professional list', () => {
    render(<HomeSearch />)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })
})
