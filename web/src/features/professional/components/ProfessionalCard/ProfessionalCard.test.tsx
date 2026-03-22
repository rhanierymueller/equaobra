import { render, screen, fireEvent } from '@testing-library/react'

import { MOCK_PROFESSIONALS } from '../../professional.mock'

import { ProfessionalCard } from './ProfessionalCard'

const mockPro = MOCK_PROFESSIONALS[0]

describe('ProfessionalCard', () => {
  it('renders professional name and profession', () => {
    render(<ProfessionalCard professional={mockPro} />)
    expect(screen.getByText(mockPro.name)).toBeInTheDocument()
    expect(screen.getByText(mockPro.profession)).toBeInTheDocument()
  })

  it('renders available badge when professional is available', () => {
    render(<ProfessionalCard professional={mockPro} />)
    expect(screen.getByText(/disponível/i)).toBeInTheDocument()
  })

  it('calls onClick with professional when clicked', () => {
    const handleClick = jest.fn()
    render(<ProfessionalCard professional={mockPro} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledWith(mockPro)
  })

  it('applies selected style when selected prop is true', () => {
    render(<ProfessionalCard professional={mockPro} selected />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-selected', 'true')
  })
})
