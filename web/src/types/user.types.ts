export type UserRole = 'contratante' | 'profissional'

export interface Address {
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  number?: string
  complement?: string
  lat?: number
  lng?: number
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  roles?: UserRole[]
  profession?: string
  professions?: string[]
  hourlyRate?: number
  showHourlyRate?: boolean
  avatarUrl?: string
  createdAt: string
  address?: Address
  companyAddress?: Address
  companyName?: string
  cnpj?: string
  website?: string
  instagram?: string
  facebook?: string
}

export interface AuthUser extends User {
  token: string
}
