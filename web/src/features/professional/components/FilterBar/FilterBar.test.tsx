import { render, screen, fireEvent } from '@testing-library/react'

import { FilterBar } from './FilterBar'

import type { ProfessionalFilters } from '@/src/types/professional.types'

const defaultFilters: ProfessionalFilters = {
  search: '',
  professions: [],
  minRating: 0,
  maxDistanceKm: 50,
  availableOnly: false,
}

const noop = jest.fn()

describe('FilterBar', () => {
  it('renders filter sections', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        resultCount={10}
        onToggleProfession={noop}
        onSetMinRating={noop}
        onSetMaxDistance={noop}
        onSetAvailableOnly={noop}
        onReset={noop}
      />,
    )
    expect(screen.getByText(/avaliação mínima/i)).toBeInTheDocument()
    expect(screen.getByText(/especialidade/i)).toBeInTheDocument()
    expect(screen.getByText(/distância máxima/i)).toBeInTheDocument()
  })

  it('shows result count', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        resultCount={7}
        onToggleProfession={noop}
        onSetMinRating={noop}
        onSetMaxDistance={noop}
        onSetAvailableOnly={noop}
        onReset={noop}
      />,
    )
    expect(screen.getByText(/7 profissionais encontrados/i)).toBeInTheDocument()
  })

  it('calls onSetAvailableOnly when toggle is clicked', () => {
    const handler = jest.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        resultCount={5}
        onToggleProfession={noop}
        onSetMinRating={noop}
        onSetMaxDistance={noop}
        onSetAvailableOnly={handler}
        onReset={noop}
      />,
    )
    fireEvent.click(screen.getByRole('switch'))
    expect(handler).toHaveBeenCalledWith(true)
  })
})
