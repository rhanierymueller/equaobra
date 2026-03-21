// ProfessionalMap renders Leaflet which requires a DOM + window.
// Tests are integration tests that run in jsdom with jest-environment-jsdom.
// Leaflet must be mocked at the module level.

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  useMap: () => ({ flyTo: jest.fn(), on: jest.fn(), off: jest.fn() }),
}))

jest.mock('leaflet', () => ({
  marker: jest.fn(() => ({ addTo: jest.fn(), bindPopup: jest.fn(), on: jest.fn(), remove: jest.fn() })),
  divIcon: jest.fn(() => ({})),
  default: {},
}))

import { render, screen } from '@testing-library/react'
import { ProfessionalMap } from './ProfessionalMap'
import { MOCK_PROFESSIONALS } from '../../professional.mock'

describe('ProfessionalMap', () => {
  it('renders the map container', () => {
    render(
      <ProfessionalMap
        professionals={MOCK_PROFESSIONALS}
        selected={null}
        onSelect={jest.fn()}
      />,
    )
    expect(screen.getByTestId('map')).toBeInTheDocument()
  })
})
