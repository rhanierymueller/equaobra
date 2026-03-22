import { render, screen } from '@testing-library/react'

import { Navbar } from './Navbar'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

describe('Navbar', () => {
  it('renders the EquaObra brand logo', () => {
    render(<Navbar />)
    expect(screen.getByText('Equa')).toBeInTheDocument()
    expect(screen.getByText('Obra')).toBeInTheDocument()
  })

  it('shows search input when onSearchChange is provided', () => {
    render(<Navbar searchValue="" onSearchChange={jest.fn()} />)
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
  })
})
