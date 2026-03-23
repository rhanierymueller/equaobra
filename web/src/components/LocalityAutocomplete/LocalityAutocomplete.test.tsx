import { render, screen, fireEvent } from '@testing-library/react'

import { LocalityAutocomplete } from './LocalityAutocomplete'

const defaultProps = {
  value: '',
  onChange: jest.fn(),
  onSelect: jest.fn(),
}

describe('LocalityAutocomplete', () => {
  it('renders input with default placeholder', () => {
    render(<LocalityAutocomplete {...defaultProps} />)
    expect(screen.getByPlaceholderText(/bairro ou cidade/i)).toBeInTheDocument()
  })

  it('renders input with custom placeholder', () => {
    render(<LocalityAutocomplete {...defaultProps} placeholder="Pesquisar localidade..." />)
    expect(screen.getByPlaceholderText(/pesquisar localidade/i)).toBeInTheDocument()
  })

  it('calls onChange when user types', () => {
    const onChange = jest.fn()
    render(<LocalityAutocomplete {...defaultProps} onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'São Paulo' } })
    expect(onChange).toHaveBeenCalledWith('São Paulo')
  })
})
