export type Profession =
  | 'Pedreiro'
  | 'Eletricista'
  | 'Encanador'
  | 'Pintor'
  | 'Marceneiro'
  | 'Azulejista'
  | 'Gesseiro'
  | 'Mestre de Obras'

export interface ProfessionalLocation {
  lat: number
  lng: number
  neighborhood: string
  city: string
}

export interface Professional {
  id: string
  name: string
  profession: Profession
  rating: number
  reviewCount: number
  distanceKm: number
  available: boolean
  phone: string
  bio: string
  location: ProfessionalLocation
  completedJobs: number
  avatarInitials: string
  avatarUrl?: string
  tags: string[]
  hourlyRate?: number
}

export interface ProfessionalFilters {
  search: string
  locality: string
  professions: Profession[]
  minRating: number
  maxDistanceKm: number
  availableOnly: boolean
}

export const ALL_PROFESSIONS: Profession[] = [
  'Pedreiro',
  'Eletricista',
  'Encanador',
  'Pintor',
  'Marceneiro',
  'Azulejista',
  'Gesseiro',
  'Mestre de Obras',
]

export const PROFESSION_COLORS: Record<Profession, string> = {
  Pedreiro: '#E07B2A',
  Eletricista: '#FFD166',
  Encanador: '#4ECDC4',
  Pintor: '#A8E6CF',
  Marceneiro: '#C4956A',
  Azulejista: '#74B9FF',
  Gesseiro: '#DFE6E9',
  'Mestre de Obras': '#FF6B6B',
}
